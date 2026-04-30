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
    /** Measured space for width- and height-aware layout (short viewports). */
    const [sizeBox, setSizeBox] = useState({ w: 400, h: 520 })

    const selectedIndex = selectedAnswer ? options.indexOf(selectedAnswer) : -1

    const BASE = 400
    /** Minimum diagram edge when width is the only constraint. */
    const MIN_LAYOUT = 160
    /** Hard floor for tiny-height viewports (must stay ≤ height budget). */
    const ABS_MIN_DIAGRAM = 96

    useLayoutEffect(() => {
        const el = layoutWrapperRef.current
        if (!el) return
        const shell = el.closest('.test-survey-question-scroll') as HTMLElement | null
        const parent = el.parentElement

        const update = () => {
            const elW = el.getBoundingClientRect().width
            const pw = parent?.clientWidth ?? elW
            const ph = parent?.clientHeight ?? 0
            const sw = shell?.clientWidth ?? elW
            const sh = shell?.clientHeight ?? 0
            const availW = Math.max(0, Math.floor(Math.min(sw, pw, elW)))
            // Flex child height when wrapped; else full question band
            const availH = Math.max(0, Math.floor(ph > 0 ? ph : sh > 0 ? sh : 520))
            setSizeBox({ w: availW || 400, h: availH || 520 })

            // Space for title, gaps, instruction row — scales with short viewports
            const verticalNonDiagram = Math.max(44, Math.min(172, availH * 0.33))
            const budgetH = Math.max(0, availH - verticalNonDiagram)
            const fromW = Math.min(BASE, Math.max(MIN_LAYOUT, availW))
            const raw = Math.min(fromW, BASE, budgetH)
            const floored = Math.floor(raw)
            // Prefer readable diagram size, but never exceed vertical budget (short screens)
            const side =
                floored < ABS_MIN_DIAGRAM ? floored : Math.max(ABS_MIN_DIAGRAM, floored)
            setLayoutSize(Math.min(BASE, side))
        }

        update()
        const ro = new ResizeObserver(() => {
            requestAnimationFrame(update)
        })
        if (parent) ro.observe(parent)
        if (shell) ro.observe(shell)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const layoutScale = layoutSize / BASE
    const heightTight = Math.min(1.12, Math.max(0.68, sizeBox.h / 420))

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

    const questionFontRem = Math.max(
        0.68,
        Math.min(1.06, (0.68 + 0.42 * layoutScale) * heightTight)
    )
    const nodeLabelFontRem = Math.max(0.52, 0.44 + 0.36 * layoutScale)
    const hintFontRem = Math.max(0.58, (0.58 + 0.22 * layoutScale) * Math.min(1, heightTight + 0.08))
    const nodePadding = Math.max(4, Math.round(8 * layoutScale))
    const outerGap = Math.max(6, Math.round(20 * layoutScale * Math.min(1, sizeBox.h / 460)))
    const moveIconPx = Math.max(16, Math.round(14 + 10 * layoutScale))
    const svgStrokeMuted = Math.max(1, 1.5 * layoutScale)
    const svgStrokeDrag = Math.max(1.5, 2.5 * layoutScale)
    const svgStrokeConnect = Math.max(2, 3 * layoutScale)

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
        }
    )

    const isDisabled = connectingIndex !== null

    const lineMuted = neoBrutal ? 'rgba(0,0,0,0.25)' : 'var(--color-border)'
    const lineActive = neoBrutal ? NB.black : 'var(--color-primary)'

    const questionLineClamp =
        sizeBox.h < 290 ? 2 : sizeBox.h < 350 ? 3 : sizeBox.h < 420 ? 4 : sizeBox.h < 500 ? 5 : 8

    return (
        <div
            ref={layoutWrapperRef}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: outerGap,
                width: '100%',
                maxWidth: 420,
                flex: 1,
                minHeight: 0,
                maxHeight: '100%',
                overflow: 'hidden',
                ...(neoBrutal ? { fontFamily: NB.font } : {}),
            }}
            className="animate-pop-in"
        >
            <p
                title={question}
                style={{
                    fontSize: `${questionFontRem}rem`,
                    fontWeight: 800,
                    color: neoBrutal ? NB.black : 'var(--color-text)',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    margin: 0,
                    paddingInline: 4,
                    flexShrink: 0,
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: questionLineClamp,
                    overflow: 'hidden',
                    wordBreak: 'break-word',
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
                    flexShrink: 0,
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
                            strokeWidth={svgStrokeMuted}
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
                                strokeWidth={svgStrokeConnect}
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
                            strokeWidth={svgStrokeDrag}
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
                                strokeWidth={svgStrokeMuted}
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
                                padding: nodePadding,
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
                                    fontSize: `${nodeLabelFontRem}rem`,
                                    fontWeight: '800',
                                    color: isHighlighted ? (neoBrutal ? NB.yellow : 'white') : (neoBrutal ? NB.black : 'var(--color-text)'),
                                    textAlign: 'center',
                                    lineHeight: 1.2,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: layoutScale < 0.68 ? 3 : 4,
                                    WebkitBoxOrient: 'vertical',
                                    padding: '0 1px',
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
                        <Move size={moveIconPx} style={{ color: neoBrutal ? NB.black : 'var(--color-primary)' }} />
                    </motion.div>
                )}
            </div>

            <div style={{ position: 'relative', minHeight: `${Math.max(28, Math.round(32 * layoutScale))}px`, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingInline: 4 }}>
                <AnimatePresence>
                    {releaseMissed && (
                        <motion.p
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'absolute',
                                fontSize: `${hintFontRem}rem`,
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
                                fontSize: `${hintFontRem}rem`,
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
                        fontSize: `${hintFontRem}rem`,
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
