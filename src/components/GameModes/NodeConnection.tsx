import { useState, useRef, useEffect, useCallback, useLayoutEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDrag } from '@use-gesture/react'
import { Move } from 'lucide-react'
import { NB } from '../../styles/neobrutal'

interface NodeConnectionProps {
    question: string
    options: string[]
    onAnswer: (answer: string) => void
    onInteraction?: () => void
    selectedAnswer?: string
    neoBrutal?: boolean
}

function getPointerCoords(event: PointerEvent | TouchEvent | MouseEvent): { x: number; y: number } {
    if ('touches' in event) {
        const touch = event.changedTouches?.[0] ?? event.touches?.[0]
        return touch ? { x: touch.clientX, y: touch.clientY } : { x: 0, y: 0 }
    }
    return { x: event.clientX, y: event.clientY }
}

function placeOnCircle(count: number, radius: number, cx: number, cy: number) {
    return Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * 2 * Math.PI - Math.PI / 2 + Math.PI / 4
        return {
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle),
        }
    })
}

const CONNECTION_ANIM_DURATION = 400
const HINT_ANIM_DURATION = 2500

export function NodeConnection({ question, options, onAnswer, onInteraction, selectedAnswer, neoBrutal }: NodeConnectionProps) {
    const [dragEnd, setDragEnd] = useState<{ x: number; y: number } | null>(null)
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [connectingIndex, setConnectingIndex] = useState<number | null>(null)
    const [showHint, setShowHint] = useState(true)
    const [releaseMissed, setReleaseMissed] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const layoutWrapperRef = useRef<HTMLDivElement>(null)
    const [layoutSize, setLayoutSize] = useState(400)

    const selectedIndex = selectedAnswer ? options.indexOf(selectedAnswer) : -1

    const BASE = 400

    useLayoutEffect(() => {
        const el = layoutWrapperRef.current
        if (!el) return
        const update = () => {
            const raw = el.getBoundingClientRect().width
            const w = Math.floor(raw)
            setLayoutSize(w > 0 ? Math.min(BASE, Math.max(260, w)) : BASE)
        }
        update()
        const ro = new ResizeObserver(update)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const cx = layoutSize / 2
    const cy = layoutSize / 2
    const radius = (175 / BASE) * layoutSize
    const positions = useMemo(
        () => placeOnCircle(options.length, radius, cx, cy),
        [options.length, radius, cx, cy]
    )
    const nodeRadius = (50 / BASE) * layoutSize
    const nodeWidth = (110 / BASE) * layoutSize
    const nodeHeight = (90 / BASE) * layoutSize
    const centerNodeSize = (64 / BASE) * layoutSize

    const confirmSelection = useCallback((index: number) => {
        setConnectingIndex(index)
        setTimeout(() => {
            onAnswer(options[index])
        }, CONNECTION_ANIM_DURATION)
    }, [options, onAnswer])

    useEffect(() => {
        const t = setTimeout(() => setShowHint(false), HINT_ANIM_DURATION)
        return () => clearTimeout(t)
    }, [])

    useEffect(() => {
        if (!releaseMissed) return
        const t = setTimeout(() => setReleaseMissed(false), 1500)
        return () => clearTimeout(t)
    }, [releaseMissed])

    const getContainerCoords = useCallback((clientX: number, clientY: number) => {
        if (!containerRef.current) return null
        const rect = containerRef.current.getBoundingClientRect()
        return { x: clientX - rect.left, y: clientY - rect.top }
    }, [])

    const bind = useDrag(
        ({ down, first, last, event }) => {
            if (connectingIndex !== null) return
            if (first) {
                onInteraction?.()
                setShowHint(false)
            }

            const ev = event as PointerEvent | TouchEvent
            const { x: clientX, y: clientY } = ev ? getPointerCoords(ev) : { x: 0, y: 0 }
            const coords = getContainerCoords(clientX, clientY)

            if (down && coords) {
                setDragEnd({ x: coords.x, y: coords.y })
                const hitRadius = nodeRadius * 2.5
                const hit = positions.findIndex(
                    (p) => Math.hypot(coords.x - p.x, coords.y - p.y) < hitRadius
                )
                setHoveredIndex(hit >= 0 ? hit : null)
            } else {
                if (last && coords) {
                    const hitRadius = nodeRadius * 2.5
                    const hit = positions.findIndex(
                        (p) => Math.hypot(coords.x - p.x, coords.y - p.y) < hitRadius
                    )
                    if (hit >= 0) {
                        confirmSelection(hit)
                    } else {
                        setReleaseMissed(true)
                    }
                }
                setDragEnd(null)
                setHoveredIndex(null)
            }
        },
        {
            pointer: { capture: true },
            triggerAllEvents: true,
            preventScroll: true,
            preventScrollAxis: 'xy',
        }
    )

    const isDisabled = connectingIndex !== null

    const lineMuted = neoBrutal ? 'rgba(0,0,0,0.25)' : 'var(--color-border)'
    const lineActive = neoBrutal ? NB.black : 'var(--color-primary)'

    return (
        <div
            ref={layoutWrapperRef}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 20,
                width: '100%',
                maxWidth: 420,
                overflow: 'visible',
                ...(neoBrutal ? { fontFamily: NB.font } : {}),
            }}
            className="animate-pop-in"
        >
            <p
                style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: neoBrutal ? NB.black : 'var(--color-text)',
                    textAlign: 'center',
                    lineHeight: 1.35,
                    margin: 0,
                }}
            >
                {question}
            </p>

            <div
                ref={containerRef}
                style={{
                    position: 'relative',
                    width: layoutSize,
                    height: layoutSize,
                    maxWidth: '100%',
                }}
            >
                <svg
                    style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                    }}
                    width={layoutSize}
                    height={layoutSize}
                >
                    {connectingIndex === null && !dragEnd && positions.map((p, i) => (
                        <line
                            key={i}
                            x1={cx}
                            y1={cy}
                            x2={p.x}
                            y2={p.y}
                            stroke={lineMuted}
                            strokeWidth={2}
                            strokeDasharray="8 6"
                            strokeOpacity={0.75}
                        />
                    ))}
                    {connectingIndex !== null && positions[connectingIndex] && (() => {
                        const p = positions[connectingIndex]
                        const len = Math.hypot(p.x - cx, p.y - cy)
                        return (
                            <motion.line
                                x1={cx}
                                y1={cy}
                                x2={p.x}
                                y2={p.y}
                                stroke={lineActive}
                                strokeWidth={4}
                                strokeLinecap="round"
                                strokeDasharray={len}
                                initial={{ strokeDashoffset: len }}
                                animate={{ strokeDashoffset: 0 }}
                                transition={{ duration: CONNECTION_ANIM_DURATION / 1000, ease: 'easeOut' }}
                            />
                        )
                    })()}
                    {dragEnd && connectingIndex === null && (
                        <line
                            x1={cx}
                            y1={cy}
                            x2={dragEnd.x}
                            y2={dragEnd.y}
                            stroke={lineActive}
                            strokeWidth={3}
                            strokeLinecap="round"
                        />
                    )}
                    {showHint && options.length > 0 && (() => {
                        const p = positions[0]
                        const len = Math.hypot(p.x - cx, p.y - cy)
                        return (
                            <motion.line
                                x1={cx}
                                y1={cy}
                                x2={p.x}
                                y2={p.y}
                                stroke={lineActive}
                                strokeWidth={2}
                                strokeDasharray={`${len} ${len}`}
                                strokeOpacity={0.5}
                                initial={{ strokeDashoffset: len }}
                                animate={{ strokeDashoffset: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            />
                        )
                    })()}
                </svg>

                {options.map((opt, i) => {
                    const isHighlighted = connectingIndex === i || hoveredIndex === i || selectedIndex === i
                    return (
                        <motion.div
                            key={i}
                            onClick={() => {
                                if (isDisabled) return
                                onInteraction?.()
                                setShowHint(false)
                                confirmSelection(i)
                            }}
                            style={{
                                position: 'absolute',
                                left: positions[i].x - nodeWidth / 2,
                                top: positions[i].y - nodeHeight / 2,
                                width: nodeWidth,
                                height: nodeHeight,
                                borderRadius: 9999,
                                background: neoBrutal
                                    ? (isHighlighted ? NB.black : NB.yellow)
                                    : (isHighlighted ? 'var(--color-primary)' : 'white'),
                                border: neoBrutal ? NB.border : `3px solid ${isHighlighted ? 'var(--color-primary-dark)' : 'var(--color-border)'}`,
                                borderBottom: neoBrutal ? undefined : `4px solid ${isHighlighted ? 'var(--color-primary-dark)' : 'var(--color-border-dark)'}`,
                                boxShadow: neoBrutal ? (isHighlighted ? NB.shadowSm : NB.shadow) : undefined,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 8,
                                cursor: isDisabled ? 'default' : 'pointer',
                                transition: 'all 0.15s ease',
                                boxSizing: 'border-box',
                                zIndex: 1,
                            }}
                            animate={connectingIndex === i ? { scale: [1, 1.08, 1] } : {}}
                            transition={{ duration: CONNECTION_ANIM_DURATION / 1000 }}
                        >
                            <span
                                title={opt}
                                style={{
                                    fontSize: '0.8rem',
                                    fontWeight: '800',
                                    color: isHighlighted ? (neoBrutal ? NB.yellow : 'white') : (neoBrutal ? NB.black : 'var(--color-text)'),
                                    textAlign: 'center',
                                    lineHeight: 1.2,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 4,
                                    WebkitBoxOrient: 'vertical',
                                    padding: '0 2px',
                                }}
                            >
                                {opt}
                            </span>
                        </motion.div>
                    )
                })}

                {connectingIndex === null && (
                    <motion.div
                        {...(bind() as any)}
                        style={{
                            position: 'absolute',
                            left: (dragEnd?.x ?? cx) - centerNodeSize / 2,
                            zIndex: 2,
                            top: (dragEnd?.y ?? cy) - centerNodeSize / 2,
                            width: centerNodeSize,
                            height: centerNodeSize,
                            borderRadius: '50%',
                            background: neoBrutal ? NB.yellow : 'rgba(100, 116, 139, 0.15)',
                            border: neoBrutal ? NB.border : '3px solid var(--color-primary)',
                            boxShadow: neoBrutal ? NB.shadowSm : undefined,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'grab',
                            touchAction: 'none',
                            boxSizing: 'border-box',
                            userSelect: 'none',
                        }}
                        whileTap={{ cursor: 'grabbing', scale: 0.95 }}
                        animate={
                            !dragEnd
                                ? {
                                      boxShadow: [
                                          '0 0 0 0 rgba(100, 116, 139, 0)',
                                          '0 0 0 6px rgba(100, 116, 139, 0.2)',
                                          '0 0 0 0 rgba(100, 116, 139, 0)',
                                      ],
                                  }
                                : {}
                        }
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    >
                        <Move size={24} style={{ color: neoBrutal ? NB.black : 'var(--color-primary)' }} />
                    </motion.div>
                )}
            </div>

            <div style={{ position: 'relative', height: '32px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <AnimatePresence>
                    {releaseMissed && (
                        <motion.p
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'absolute',
                                fontSize: '0.8rem',
                                fontWeight: '800',
                                color: 'var(--color-danger)',
                                letterSpacing: '0.05em',
                                textAlign: 'center',
                                margin: 0,
                            }}
                        >
                            Release over an option to select
                        </motion.p>
                    )}
                    {dragEnd && hoveredIndex !== null && (
                        <motion.p
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'absolute',
                                fontSize: '0.8rem',
                                fontWeight: '800',
                                color: neoBrutal ? NB.black : 'var(--color-primary)',
                                letterSpacing: '0.05em',
                                textAlign: 'center',
                                margin: 0,
                            }}
                        >
                            Release to select: {options[hoveredIndex]}
                        </motion.p>
                    )}
                </AnimatePresence>
                <motion.p
                    style={{
                        position: 'absolute',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: 'var(--color-text-muted)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        textAlign: 'center',
                        margin: 0,
                        opacity: dragEnd && hoveredIndex !== null ? 0 : releaseMissed ? 0 : !showHint ? 0.5 : 1,
                    }}
                >
                    Drag from center to zone, or click an option
                </motion.p>
            </div>
        </div>
    )
}
