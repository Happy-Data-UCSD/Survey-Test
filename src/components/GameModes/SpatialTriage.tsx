import { useState, useRef, useEffect } from 'react'
import { motion, useSpring } from 'framer-motion'
import { useDrag } from '@use-gesture/react'
import { NB } from '../../styles/neobrutal'

type Zone = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | null

interface SpatialTriageProps {
    question: string
    options: { topLeft: string; topRight: string; bottomLeft: string; bottomRight: string }
    onAnswer: (answer: string) => void
    selectedAnswer?: string
    neoBrutal?: boolean
}

function getZoneFromMovement(dx: number, dy: number): Zone {
    if (dx < 0 && dy < 0) return 'topLeft'
    if (dx >= 0 && dy < 0) return 'topRight'
    if (dx < 0 && dy >= 0) return 'bottomLeft'
    if (dx >= 0 && dy >= 0) return 'bottomRight'
    return null
}

function ZoneLabel({ label, active, selected, neoBrutal }: { label: string; active: boolean; selected: boolean; neoBrutal?: boolean }) {
    const highlighted = active || selected
    return (
        <span
            style={{
                fontSize: '1.15rem',
                fontWeight: '800',
                fontFamily: neoBrutal ? NB.font : undefined,
                color: highlighted ? (neoBrutal ? NB.black : 'var(--color-primary)') : (neoBrutal ? 'rgba(0,0,0,0.45)' : 'var(--color-text-muted)'),
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

export function SpatialTriage({ question, options, onAnswer, selectedAnswer, neoBrutal }: SpatialTriageProps) {
    const [activeZone, setActiveZone] = useState<Zone>(null)
    
    const getSelectedZone = (): Zone => {
        if (!selectedAnswer) return null
        for (const zone of ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const) {
            if (options[zone] === selectedAnswer) return zone
        }
        return null
    }
    const selectedZone = getSelectedZone()
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const containerRef = useRef<HTMLDivElement>(null)
    const [showHint, setShowHint] = useState(true)

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
        
        const t = setTimeout(() => setShowHint(false), 2500)
        
        return () => {
            ro.disconnect()
            clearTimeout(t)
        }
    }, [])

    const bind = useDrag(
        ({ down, movement: [dx, dy], first }) => {
            if (first) {
                setShowHint(false)
            }

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
        },
        { pointer: { capture: true }, preventScroll: true, preventScrollAxis: 'xy' }
    )

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
                touchAction: 'none',
                overscrollBehavior: 'contain',
                userSelect: 'none',
            }}
            className="animate-pop-in"
        >
            {(['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const).map((zone) => {
                const isActive = activeZone === zone
                const isSelected = selectedZone === zone
                const highlighted = isActive || isSelected
                return (
                    <div
                        key={zone}
                        style={{
                            display: 'flex',
                            alignItems: zone.startsWith('bottom') ? 'flex-end' : 'flex-start',
                            justifyContent: zone.endsWith('Right') ? 'flex-end' : 'flex-start',
                            padding: '28px',
                            background: neoBrutal
                                ? (highlighted ? NB.yellow : NB.pageBg)
                                : (highlighted ? 'rgba(100, 116, 139, 0.12)' : 'rgba(0,0,0,0.02)'),
                            border: neoBrutal
                                ? `3px solid ${NB.black}`
                                : `3px solid ${highlighted ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            borderRightWidth: zone.endsWith('Right') ? '3px' : neoBrutal ? '2px' : '2px',
                            borderBottomWidth: zone.startsWith('bottom') ? '3px' : neoBrutal ? '2px' : '2px',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        <ZoneLabel label={options[zone]} active={isActive} selected={isSelected} neoBrutal={neoBrutal} />
                    </div>
                )
            })}

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
                        width: '260px',
                        ...(neoBrutal
                            ? {
                                background: NB.cardBg,
                                borderRadius: '16px',
                                border: NB.border,
                                boxShadow: NB.shadow,
                                fontFamily: NB.font,
                            }
                            : {
                                background: 'white',
                                borderRadius: '16px',
                                border: `2px solid ${activeZone ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                borderBottom: `4px solid ${activeZone ? 'var(--color-primary-dark)' : 'var(--color-border-dark)'}`,
                            }),
                    padding: '20px 24px',
                    cursor: 'grab',
                    touchAction: 'none',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    zIndex: 2,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 1.1, cursor: 'grabbing' }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <h2
                        style={{
                            fontSize: '1.25rem',
                            fontWeight: '800',
                            lineHeight: 1.35,
                            color: neoBrutal ? NB.black : 'var(--color-text)',
                            textAlign: 'left',
                            userSelect: 'none',
                            margin: 0,
                        }}
                    >
                        {question}
                    </h2>
                    <p
                        style={{
                            fontSize: '0.8rem',
                            fontWeight: '800',
                            color: neoBrutal ? NB.black : 'var(--color-text-muted)',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            textAlign: 'left',
                            userSelect: 'none',
                            margin: 0,
                        }}
                    >
                        drag to zone
                    </p>
                </div>
                {/* Drag Handle */}
                <div style={{ display: 'flex', alignItems: 'center', opacity: neoBrutal ? 1 : 0.3 }}>
                    <svg width="16" height="32" viewBox="0 0 16 32" fill={neoBrutal ? NB.black : "currentColor"}>
                        <circle cx="4" cy="6" r="2" />
                        <circle cx="4" cy="16" r="2" />
                        <circle cx="4" cy="26" r="2" />
                        <circle cx="12" cy="6" r="2" />
                        <circle cx="12" cy="16" r="2" />
                        <circle cx="12" cy="26" r="2" />
                    </svg>
                </div>
            </motion.div>

            {/* Hint Animation (Ghost Box & Arrow) */}
            {showHint && (
                <motion.div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: '16px',
                        border: neoBrutal ? `3px dashed ${NB.black}` : '3px dashed var(--color-primary)',
                        pointerEvents: 'none',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: neoBrutal ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)',
                    }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 1 }}
                    animate={{ 
                        x: dimensions.width ? dimensions.width / 4 : 150, 
                        y: dimensions.height ? -dimensions.height / 4 : -150,
                        opacity: [0.8, 0.8, 0],
                        scale: [1, 0.8, 0.8]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5, ease: "easeOut" }}
                >
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={neoBrutal ? NB.black : "var(--color-primary)"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="19" x2="19" y2="5"></line>
                        <polyline points="9 5 19 5 19 15"></polyline>
                    </svg>
                </motion.div>
            )}
            </div>
        </div>
    )
}
