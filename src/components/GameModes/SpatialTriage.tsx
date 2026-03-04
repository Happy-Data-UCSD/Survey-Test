import { useState, useRef, useEffect } from 'react'
import { motion, useSpring } from 'framer-motion'
import { useDrag } from '@use-gesture/react'

type Zone = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | null

interface SpatialTriageProps {
    question: string
    options: { topLeft: string; topRight: string; bottomLeft: string; bottomRight: string }
    onAnswer: (answer: string) => void
    onDragStart?: () => void
}

function getZoneFromMovement(dx: number, dy: number): Zone {
    if (dx < 0 && dy < 0) return 'topLeft'
    if (dx >= 0 && dy < 0) return 'topRight'
    if (dx < 0 && dy >= 0) return 'bottomLeft'
    if (dx >= 0 && dy >= 0) return 'bottomRight'
    return null
}

function ZoneLabel({ label, active }: { label: string; active: boolean }) {
    return (
        <span
            style={{
                fontSize: '1.15rem',
                fontWeight: '800',
                color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                transition: 'color 0.15s ease',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
                lineHeight: 1.3,
            }}
        >
            {label}
        </span>
    )
}

export function SpatialTriage({ question, options, onAnswer, onDragStart }: SpatialTriageProps) {
    const [activeZone, setActiveZone] = useState<Zone>(null)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    const mx = useSpring(0, { bounce: 0, stiffness: 400, damping: 30 })
    const my = useSpring(0, { bounce: 0, stiffness: 400, damping: 30 })

    const minDrag = 80

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const ro = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect
            setDimensions({ width, height })
        })
        ro.observe(el)
        setDimensions({ width: el.offsetWidth, height: el.offsetHeight })
        return () => ro.disconnect()
    }, [])

    const bind = useDrag(({ down, movement: [dx, dy], first }) => {
        if (first && onDragStart) onDragStart()

        if (down) {
            mx.set(dx)
            my.set(dy)
            const zone = getZoneFromMovement(dx, dy)
            const dist = Math.sqrt(dx * dx + dy * dy)
            setActiveZone(dist >= minDrag ? zone : null)
        } else {
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist >= minDrag) {
                const zone = getZoneFromMovement(dx, dy)
                const { width, height } = dimensions
                const w = width || 300
                const h = height || 400
                const targets: Record<Exclude<Zone, null>, [number, number]> = {
                    topLeft: [-w / 4, -h / 4],
                    topRight: [w / 4, -h / 4],
                    bottomLeft: [-w / 4, h / 4],
                    bottomRight: [w / 4, h / 4],
                }
                const [tx, ty] = zone ? targets[zone] : [0, 0]
                mx.set(tx)
                my.set(ty)
                if (zone) {
                    setTimeout(() => {
                        onAnswer(options[zone])
                        mx.set(0, false)
                        my.set(0, false)
                        setActiveZone(null)
                    }, 250)
                }
            } else {
                mx.set(0)
                my.set(0)
                setActiveZone(null)
            }
        }
    })

    return (
        <div
            ref={containerRef}
            style={{
                flex: 1,
                width: '100%',
                height: '100%',
                minHeight: 0,
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
            }}
            className="animate-pop-in"
        >
            {(['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const).map((zone) => (
                <div
                    key={zone}
                    style={{
                        display: 'flex',
                        alignItems: zone.startsWith('bottom') ? 'flex-end' : 'flex-start',
                        justifyContent: zone.endsWith('Right') ? 'flex-end' : 'flex-start',
                        padding: '28px',
                        background: activeZone === zone ? 'rgba(88, 204, 2, 0.12)' : 'rgba(0,0,0,0.02)',
                        border: `3px solid ${activeZone === zone ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRightWidth: zone.endsWith('Right') ? '3px' : '2px',
                        borderBottomWidth: zone.startsWith('bottom') ? '3px' : '2px',
                        transition: 'all 0.15s ease',
                    }}
                >
                    <ZoneLabel label={options[zone]} active={activeZone === zone} />
                </div>
            ))}

            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <motion.div
                    {...(bind() as any)}
                    style={{
                        x: mx,
                        y: my,
                        width: '340px',
                    background: 'white',
                    borderRadius: '20px',
                    border: `2px solid ${activeZone ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderBottom: `4px solid ${activeZone ? 'var(--color-primary-dark)' : 'var(--color-border-dark)'}`,
                    padding: '32px 28px',
                    cursor: 'grab',
                    touchAction: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                }}
                whileTap={{ cursor: 'grabbing' }}
            >
                <h2
                    style={{
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        lineHeight: 1.35,
                        color: 'var(--color-text)',
                        textAlign: 'center',
                        userSelect: 'none',
                    }}
                >
                    {question}
                </h2>
                <p
                    style={{
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: 'var(--color-text-muted)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        textAlign: 'center',
                        userSelect: 'none',
                    }}
                >
                    drag to zone
                </p>
            </motion.div>
            </div>
        </div>
    )
}
