import { useState, useEffect, useRef, type PointerEvent, type MouseEvent, type TouchEvent } from 'react'
import { animate, motion, useSpring, useTransform } from 'framer-motion'
import { useDrag } from '@use-gesture/react'
import { Move } from 'lucide-react'
import { captureLiftRect, LiftPortal } from '../QuestionLiftPortal'
import { NB } from '../../styles/neobrutal'

export type Direction = 'up' | 'down' | 'left' | 'right' | null

interface SwipeCardProps {
    question: string
    options: { up: string; down: string; left: string; right: string }
    onAnswer: (answer: string) => void
    onDragStart?: () => void
    selectedAnswer?: string
    neoBrutal?: boolean
}

const ARROWS: Record<string, string> = { up: '↑', down: '↓', left: '←', right: '→' }

function OptionPill({
    dir,
    label,
    active,
    selected,
    neoBrutal,
    onSelect,
}: {
    dir: string
    label: string
    active: boolean
    selected: boolean
    neoBrutal?: boolean
    onSelect?: () => void
}) {
    const [hovered, setHovered] = useState(false)

    const highlighted = active || selected
    const color = neoBrutal ? NB.black : 'var(--color-text)'
    const isSide = dir === 'left' || dir === 'right'
    const chipPadding = isSide ? '7px 9px' : '8px 11px'

    const neutralSurface = {
        background: 'none',
        border: 'none',
        padding: 0,
        borderRadius: 0,
    }

    const surfaceStyle = selected
        ? neoBrutal
            ? {
                background: NB.green,
                border: NB.border,
                boxShadow: NB.shadowSm,
                padding: chipPadding,
                borderRadius: 12,
            }
            : {
                background: 'color-mix(in srgb, var(--color-primary) 22%, #ffffff)',
                border: '2px solid var(--color-primary)',
                borderBottom: '4px solid var(--color-primary-dark)',
                padding: chipPadding,
                borderRadius: 12,
                color: 'var(--color-primary-dark)',
            }
        : (hovered || active)
            ? neoBrutal
                ? {
                    background: NB.yellow,
                    border: NB.border,
                    boxShadow: NB.shadow,
                    padding: chipPadding,
                    borderRadius: 12,
                }
                : {
                    background: 'color-mix(in srgb, var(--color-primary) 12%, #ffffff)',
                    border: '2px solid var(--color-primary-light)',
                    borderBottom: '3px solid var(--color-border-dark)',
                    padding: chipPadding,
                    borderRadius: 12,
                }
            : neutralSurface

    const stopDragStart = (e: PointerEvent | MouseEvent | TouchEvent) => {
        e.stopPropagation()
    }
    const arrowStyle = { fontSize: '1.8rem', lineHeight: 1, display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const }
    const labelStyle = {
        fontSize: '0.875rem',
        fontWeight: 900,
        letterSpacing: '0.04em',
        textTransform: 'uppercase' as const,
        wordWrap: 'break-word' as const,
        textAlign: 'center' as const,
        ...(neoBrutal ? { textShadow: NB.textReadabilityShadow } : {}),
        ...(isSide ? { maxWidth: 88 } : { width: '100%' }),
    }

    const inner = isSide ? (
        dir === 'left' ? (
            <>
                <span style={arrowStyle}>{ARROWS.left}</span>
                <span style={labelStyle}>{label}</span>
            </>
        ) : (
            <>
                <span style={labelStyle}>{label}</span>
                <span style={arrowStyle}>{ARROWS.right}</span>
            </>
        )
    ) : (
        <>
            {dir === 'up' && <span style={arrowStyle}>{ARROWS.up}</span>}
            <span style={labelStyle}>{label}</span>
            {dir === 'down' && (
                <span style={{ ...arrowStyle, marginTop: -2 }}>{ARROWS.down}</span>
            )}
        </>
    )

    const visualStyle = {
        opacity: highlighted ? 1 : 0.92,
        color: color,
        display: 'flex',
        flexDirection: (isSide ? 'row' : 'column') as 'row' | 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isSide ? 6 : (dir === 'down' ? 2 : 4),
        transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        userSelect: 'none' as const,
        transform: active
            ? 'scale(1.1)'
            : selected
                ? 'scale(1.04)'
                : hovered
                    ? 'scale(1.03)'
                    : 'scale(1)',
        fontWeight: '900',
        fontFamily: neoBrutal ? NB.font : 'inherit',
        maxWidth: selected || hovered || active ? '108px' : '92px',
        textAlign: 'center' as const,
        boxSizing: 'border-box' as const,
        ...surfaceStyle,
    }

    if (onSelect) {
        return (
            <button
                type="button"
                onPointerDown={stopDragStart}
                onMouseDown={stopDragStart}
                onTouchStart={stopDragStart}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={(e) => {
                    e.stopPropagation()
                    onSelect()
                }}
                style={{
                    ...visualStyle,
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                    touchAction: 'manipulation',
                    font: 'inherit',
                }}
            >
                {inner}
            </button>
        )
    }

    return (
        <div style={{ ...visualStyle, pointerEvents: 'none' }}>
            {inner}
        </div>
    )
}

function SwipeCardPlayfield({
    options,
    activeDir,
    selectedAnswer,
    neoBrutal,
    edgeInset,
    bottomEdgeInset,
    puckSize,
    bind,
    puckSurface,
    moveIconColor,
    moveIconSize,
    onAnswer,
    labelPickEnabled = true,
    puckInteractive = true,
}: {
    options: SwipeCardProps['options']
    activeDir: Direction
    selectedAnswer?: string
    neoBrutal?: boolean
    edgeInset: number
    bottomEdgeInset: number
    puckSize: number
    bind?: () => object
    puckSurface: Record<string, unknown>
    moveIconColor: string
    moveIconSize: number
    onAnswer: (answer: string) => void
    labelPickEnabled?: boolean
    /** When false, puck is display-only (e.g. portal mirror above scroll clipping) */
    puckInteractive?: boolean
}) {
    return (
        <div style={{
            position: 'absolute',
            inset: 0,
        }}
        >
            <div style={{
                position: 'absolute',
                top: edgeInset,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1,
                maxWidth: 'calc(100% - 8px)',
            }}
            >
                <OptionPill
                    dir="up"
                    label={options.up}
                    active={activeDir === 'up'}
                    selected={selectedAnswer === options.up}
                    neoBrutal={neoBrutal}
                    onSelect={labelPickEnabled ? () => onAnswer(options.up) : undefined}
                />
            </div>
            <div style={{
                position: 'absolute',
                left: edgeInset,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1,
                maxWidth: '30%',
            }}
            >
                <OptionPill
                    dir="left"
                    label={options.left}
                    active={activeDir === 'left'}
                    selected={selectedAnswer === options.left}
                    neoBrutal={neoBrutal}
                    onSelect={labelPickEnabled ? () => onAnswer(options.left) : undefined}
                />
            </div>
            <div style={{
                position: 'absolute',
                right: edgeInset,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1,
                maxWidth: '30%',
            }}
            >
                <OptionPill
                    dir="right"
                    label={options.right}
                    active={activeDir === 'right'}
                    selected={selectedAnswer === options.right}
                    neoBrutal={neoBrutal}
                    onSelect={labelPickEnabled ? () => onAnswer(options.right) : undefined}
                />
            </div>
            <div style={{
                position: 'absolute',
                bottom: bottomEdgeInset,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1,
                maxWidth: 'calc(100% - 8px)',
            }}
            >
                <OptionPill
                    dir="down"
                    label={options.down}
                    active={activeDir === 'down'}
                    selected={selectedAnswer === options.down}
                    neoBrutal={neoBrutal}
                    onSelect={labelPickEnabled ? () => onAnswer(options.down) : undefined}
                />
            </div>

            <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 2,
            }}
            >
                <motion.div
                    {...(bind ? bind() : {})}
                    aria-label="Drag toward an answer"
                    style={{
                        width: puckSize,
                        height: puckSize,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: puckInteractive ? 'grab' : 'default',
                        touchAction: 'none',
                        pointerEvents: puckInteractive ? 'auto' : 'none',
                        ...puckSurface,
                    }}
                    whileTap={puckInteractive ? { cursor: 'grabbing' } : undefined}
                >
                    <Move
                        size={moveIconSize}
                        color={moveIconColor}
                        strokeWidth={neoBrutal ? 2.5 : 2.25}
                        aria-hidden
                    />
                </motion.div>
            </div>
        </div>
    )
}

export function SwipeCard({ question, options, onAnswer, onDragStart, selectedAnswer, neoBrutal }: SwipeCardProps) {
    const [activeDir, setActiveDir] = useState<Direction>(null)
    const [compactUi, setCompactUi] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)
    const [liftedRect, setLiftedRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)

    useEffect(() => {
        const mq = window.matchMedia('(max-height: 640px), (max-width: 360px)')
        const apply = () => setCompactUi(mq.matches)
        apply()
        mq.addEventListener('change', apply)
        return () => mq.removeEventListener('change', apply)
    }, [])

    const threshold = compactUi ? 42 : 50

    const mx = useSpring(0, { bounce: 0, stiffness: 400, damping: 30 })
    const my = useSpring(0, { bounce: 0, stiffness: 400, damping: 30 })
    const rotate = useTransform(mx, [-200, 200], [-12, 12])
    const bind = useDrag(({ down, movement: [dx, dy], first }) => {
        if (first) {
            onDragStart?.()
            setLiftedRect(captureLiftRect(cardRef.current))
        }

        if (down) {
            mx.set(dx)
            my.set(dy)
            if (Math.abs(dx) > Math.abs(dy)) {
                setActiveDir(dx > threshold ? 'right' : dx < -threshold ? 'left' : null)
            } else {
                setActiveDir(dy > threshold ? 'down' : dy < -threshold ? 'up' : null)
            }
        } else {
            // Use movement on release, not React state — state can lag behind the last
            // touchmove on mobile, so activeDir is sometimes still null on touchend.
            const absX = Math.abs(dx)
            const absY = Math.abs(dy)
            let finalDir: Direction = null
            if (absX > absY) {
                finalDir = dx > threshold ? 'right' : dx < -threshold ? 'left' : null
            } else {
                finalDir = dy > threshold ? 'down' : dy < -threshold ? 'up' : null
            }
            if (finalDir) {
                mx.set(finalDir === 'left' ? -500 : finalDir === 'right' ? 500 : 0)
                my.set(finalDir === 'up' ? -500 : finalDir === 'down' ? 500 : 0)
                setTimeout(() => {
                    onAnswer(options[finalDir])
                    mx.set(0, false)
                    my.set(0, false)
                    setActiveDir(null)
                    setLiftedRect(null)
                }, 200)
            } else {
                mx.set(0)
                my.set(0)
                setActiveDir(null)
                setLiftedRect(null)
            }
        }
    }, {
        pointer: { capture: true },
        preventScroll: true,
        preventScrollAxis: 'xy',
        filterTaps: true,
    })

    const puckSize = compactUi ? 46 : 52
    /** Labels hug the inner edges of the playfield */
    const edgeInset = compactUi ? 2 : 4
    /** Bottom row sits slightly higher so the ↓ isn’t flush against the card edge */
    const bottomEdgeInset = compactUi ? 8 : 10

    useEffect(() => {
        const timer = window.setTimeout(() => {
            animate(mx, [0, -9, 9, -6, 6, 0], { duration: 0.68, ease: 'easeInOut' })
            animate(my, [0, 7, -7, -4, 4, 0], { duration: 0.68, ease: 'easeInOut' })
        }, 360)
        return () => window.clearTimeout(timer)
    }, [question, mx, my])

    const cardNeo = neoBrutal
        ? {
            background: NB.cardBg,
            borderRadius: '18px',
            border: NB.border,
            boxShadow: NB.shadow,
            padding: '10px',
        }
        : {
            background: 'white',
            borderRadius: '18px',
            border: `2px solid ${activeDir ? 'var(--color-primary)' : 'var(--color-border)'}`,
            borderBottom: `4px solid ${activeDir ? 'var(--color-primary-dark)' : 'var(--color-border-dark)'}`,
            padding: '12px',
        }

    const puckSurface = neoBrutal
        ? {
            background: NB.yellow,
            border: NB.border,
            boxShadow: activeDir ? NB.shadowSm : NB.shadow,
        }
        : {
            background: 'white',
            border: `2px solid ${activeDir ? 'var(--color-primary)' : 'var(--color-border)'}`,
            borderBottom: `4px solid ${activeDir ? 'var(--color-primary-dark)' : 'var(--color-border-dark)'}`,
            boxShadow: activeDir ? '0 6px 0 var(--color-primary-dark)' : '0 4px 0 #d0d0d0',
        }

    const moveIconColor = neoBrutal ? NB.black : 'var(--color-primary)'
    const moveIconSize = compactUi ? 22 : 26

    const cardBox = 'min(300px, calc(100vw - 40px))'

    const cardMotionBase = {
        x: mx,
        y: my,
        rotate,
        ...cardNeo,
        boxSizing: 'border-box' as const,
        position: 'relative' as const,
        overflow: 'hidden' as const,
        cursor: 'default' as const,
        flexShrink: 0,
        ...(neoBrutal && activeDir ? { outline: `3px solid ${NB.green}` } : {}),
    }

    const playfieldProps = {
        options,
        activeDir,
        selectedAnswer,
        neoBrutal,
        edgeInset,
        bottomEdgeInset,
        puckSize,
        puckSurface,
        moveIconColor,
        moveIconSize,
        onAnswer,
    }

    const playfieldInteractive = (
        <SwipeCardPlayfield {...playfieldProps} bind={bind} />
    )

    const playfieldMirror = (
        <SwipeCardPlayfield
            {...playfieldProps}
            labelPickEnabled={false}
            puckInteractive={false}
        />
    )

    return (
        <>
            <LiftPortal rect={liftedRect}>
                <motion.div
                    style={{
                        ...cardMotionBase,
                        width: '100%',
                        height: '100%',
                        maxWidth: 'none',
                    }}
                >
                    {playfieldMirror}
                </motion.div>
            </LiftPortal>
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '340px',
                marginLeft: 'auto',
                marginRight: 'auto',
                padding: '0 min(12px, 3vw)',
                boxSizing: 'border-box',
                overflow: 'visible',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
                ...(neoBrutal ? { fontFamily: NB.font } : {}),
            }} className="animate-pop-in">
                <div style={{
                    width: '100%',
                    textAlign: 'center',
                    userSelect: 'none',
                    pointerEvents: 'none',
                    padding: neoBrutal ? '0 4px' : '0 6px',
                }}>
                    <h2 style={{
                        fontSize: neoBrutal ? '1.22rem' : '1.32rem',
                        fontWeight: neoBrutal ? 900 : '800',
                        lineHeight: 1.35,
                        color: neoBrutal ? NB.black : 'var(--color-text)',
                        margin: 0,
                    }}>
                        {question}
                    </h2>
                    <p style={{
                        fontSize: neoBrutal ? '0.74rem' : '0.68rem',
                        fontWeight: 800,
                        color: neoBrutal ? NB.black : 'var(--color-text-muted)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        opacity: 0.8,
                        marginTop: 8,
                        marginBottom: 0,
                    }}>
                        Drag the card toward an answer or tap a label
                    </p>
                </div>

                <motion.div
                    ref={cardRef}
                    style={{
                        ...cardMotionBase,
                        width: cardBox,
                        height: cardBox,
                        maxWidth: '100%',
                        opacity: liftedRect ? 0 : 1,
                    }}
                >
                    {playfieldInteractive}
                </motion.div>
            </div>
        </>
    )
}
