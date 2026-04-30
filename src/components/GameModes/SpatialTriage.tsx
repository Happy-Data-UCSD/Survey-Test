import { useState, useRef, useEffect, type RefObject } from 'react'
import { animate, motion, useMotionValue, useSpring, type MotionValue } from 'framer-motion'
import { useDrag } from '@use-gesture/react'
import { captureLiftRect, LiftPortal, type LiftedRect } from '../QuestionLiftPortal'
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

function SpatialTriageDragCard({
    mx,
    my,
    question,
    neoBrutal,
    activeZone,
    dragCardWidth,
    bind,
    cardRef,
    mirror,
    visualOpacity = 1,
    hintX,
    hintY,
    hintOpacity,
    showHintDecor,
}: {
    mx: MotionValue<number>
    my: MotionValue<number>
    question: string
    neoBrutal?: boolean
    activeZone: Zone
    dragCardWidth: number
    bind?: () => object
    cardRef?: RefObject<HTMLDivElement>
    mirror: boolean
    visualOpacity?: number
    hintX?: MotionValue<number>
    hintY?: MotionValue<number>
    hintOpacity?: MotionValue<number>
    showHintDecor?: boolean
}) {
    const gesture = bind?.() ?? {}
    const hintActive = Boolean(showHintDecor && hintX && hintY && hintOpacity)
    return (
        <motion.div
            ref={mirror ? undefined : cardRef}
            {...gesture}
            style={{
                position: !mirror ? 'relative' : undefined,
                x: mx,
                y: my,
                width: mirror ? '100%' : dragCardWidth,
                height: mirror ? '100%' : undefined,
                maxWidth: mirror ? 'none' : 'min(260px, calc(100% - 24px))',
                opacity: visualOpacity,
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
                cursor: mirror ? 'default' : 'grab',
                touchAction: 'none',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                zIndex: 2,
            }}
            whileHover={mirror ? undefined : { scale: 1.05 }}
            whileTap={mirror ? undefined : { scale: 1.1, cursor: 'grabbing' }}
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
            <div style={{ display: 'flex', alignItems: 'center', opacity: neoBrutal ? 1 : 0.3 }}>
                <svg width="16" height="32" viewBox="0 0 16 32" fill={neoBrutal ? NB.black : 'currentColor'}>
                    <circle cx="4" cy="6" r="2" />
                    <circle cx="4" cy="16" r="2" />
                    <circle cx="4" cy="26" r="2" />
                    <circle cx="12" cy="6" r="2" />
                    <circle cx="12" cy="16" r="2" />
                    <circle cx="12" cy="26" r="2" />
                </svg>
            </div>
            {hintActive && (
                <motion.div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        zIndex: 4,
                        opacity: hintOpacity,
                        x: hintX,
                        y: hintY,
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '16px',
                            outline: neoBrutal
                                ? `3px dashed ${NB.black}`
                                : `3px dashed var(--color-primary)`,
                            outlineOffset: '4px',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            width: 48,
                            height: 48,
                            marginLeft: -24,
                            marginTop: -24,
                            zIndex: 1,
                        }}
                    >
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={neoBrutal ? NB.black : 'var(--color-primary)'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="19" x2="19" y2="5" />
                            <polyline points="9 5 19 5 19 15" />
                        </svg>
                    </div>
                </motion.div>
            )}
        </motion.div>
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
    const cardRef = useRef<HTMLDivElement>(null)
    const [liftedRect, setLiftedRect] = useState<LiftedRect | null>(null)
    const [showHint, setShowHint] = useState(true)

    const mx = useSpring(0, { bounce: 0, stiffness: 400, damping: 30 })
    const my = useSpring(0, { bounce: 0, stiffness: 400, damping: 30 })

    const hintX = useMotionValue(0)
    const hintY = useMotionValue(0)
    const hintOpacity = useMotionValue(0)

    const minDrag = 80

    const zonePad =
        dimensions.width > 0
            ? Math.min(28, Math.max(14, Math.round(dimensions.width * 0.07)))
            : 28
    const dragCardWidth =
        dimensions.width > 0
            ? Math.min(260, Math.max(180, Math.round(dimensions.width * 0.72)))
            : 260

    useEffect(() => {
        if (!showHint) {
            hintX.set(0)
            hintY.set(0)
            hintOpacity.set(0)
            return
        }
        const ox = dragCardWidth * 0.38
        const oy = -dragCardWidth * 0.38
        const cycle = 2.4
        const delay = 0.4
        const ease = 'easeInOut'
        const tMoveEnd = 0.34
        const tFadeStart = 0.34
        const tFadeEnd = 0.44
        const tReset = 0.5

        const ax = animate(hintX, [0, ox, ox, 0, 0], {
            duration: cycle,
            repeat: Infinity,
            repeatDelay: delay,
            ease,
            times: [0, tMoveEnd, tFadeEnd, tReset, 1],
        })
        const ay = animate(hintY, [0, oy, oy, 0, 0], {
            duration: cycle,
            repeat: Infinity,
            repeatDelay: delay,
            ease,
            times: [0, tMoveEnd, tFadeEnd, tReset, 1],
        })
        // Stay invisible at center after reset (no fade-in before next loop) so the hint
        // does not sit on the card between cycles. Opacity only returns to 1 as the loop restarts.
        const ao = animate(hintOpacity, [1, 1, 0, 0, 0], {
            duration: cycle,
            repeat: Infinity,
            repeatDelay: delay,
            ease,
            times: [0, tFadeStart, tFadeEnd, tReset, 1],
        })
        return () => {
            ax.stop()
            ay.stop()
            ao.stop()
        }
    }, [showHint, dragCardWidth, hintX, hintY, hintOpacity])

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
                setLiftedRect(captureLiftRect(cardRef.current))
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
                            setLiftedRect(null)
                        }, 250)
                    } else {
                        setLiftedRect(null)
                    }
                } else {
                    mx.set(0)
                    my.set(0)
                    setActiveZone(null)
                    setLiftedRect(null)
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
                            pointerEvents: 'none',
                            display: 'flex',
                            alignItems: zone.startsWith('bottom') ? 'flex-end' : 'flex-start',
                            justifyContent: zone.endsWith('Right') ? 'flex-end' : 'flex-start',
                            padding: zonePad,
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

            <LiftPortal rect={liftedRect}>
                <SpatialTriageDragCard
                    mx={mx}
                    my={my}
                    question={question}
                    neoBrutal={neoBrutal}
                    activeZone={activeZone}
                    dragCardWidth={dragCardWidth}
                    mirror
                />
            </LiftPortal>

            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                    isolation: 'isolate',
                }}
            >
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <SpatialTriageDragCard
                        cardRef={cardRef}
                        mx={mx}
                        my={my}
                        question={question}
                        neoBrutal={neoBrutal}
                        activeZone={activeZone}
                        dragCardWidth={dragCardWidth}
                        bind={bind}
                        mirror={false}
                        visualOpacity={liftedRect ? 0 : 1}
                        hintX={hintX}
                        hintY={hintY}
                        hintOpacity={hintOpacity}
                        showHintDecor={showHint}
                    />
                </div>
            </div>
        </div>
    )
}
