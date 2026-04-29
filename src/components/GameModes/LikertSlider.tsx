import { useState, useRef, useLayoutEffect, useEffect, useMemo } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useDrag } from '@use-gesture/react'
import { NB } from '../../styles/neobrutal'

interface LikertSliderProps {
    question: string
    options: string[]
    onAnswer: (answer: string) => void
    onInteraction?: () => void
    selectedAnswer?: string
    neoBrutal?: boolean
}

export function LikertSlider({ question, options, onAnswer, onInteraction, selectedAnswer, neoBrutal }: LikertSliderProps) {
    const [committed, setCommitted] = useState(false)
    const [hovered, setHovered] = useState(false)
    const middleIndex = Math.floor(options.length / 2)
    
    const getInitialIndex = () => {
        if (selectedAnswer) {
            const idx = options.indexOf(selectedAnswer)
            return idx >= 0 ? idx : middleIndex
        }
        return middleIndex
    }
    const initialIndex = getInitialIndex()
    const [selectedIndex, setSelectedIndex] = useState<number | null>(initialIndex)

    const thumbWidth = 40
    const shellRef = useRef<HTMLDivElement>(null)
    const [trackWidth, setTrackWidth] = useState(260)

    useLayoutEffect(() => {
        const el = shellRef.current
        if (!el) return
        const measure = () => {
            const w = el.offsetWidth
            const inner = Math.max(160, Math.min(260, w - 40))
            setTrackWidth(inner)
        }
        measure()
        const ro = new ResizeObserver(measure)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const dragLimit = useMemo(() => trackWidth - thumbWidth, [trackWidth, thumbWidth])
    const selectedIndexRef = useRef(selectedIndex)
    selectedIndexRef.current = selectedIndex

    const x = useMotionValue(
        options.length < 2
            ? 0
            : (initialIndex / (options.length - 1)) * Math.max(0, 260 - thumbWidth)
    )

    useEffect(() => {
        const lim = dragLimit
        if (lim <= 0 || options.length < 2) return
        const idx = selectedIndexRef.current ?? middleIndex
        const seg = lim / (options.length - 1)
        x.set(Math.min(lim, Math.max(0, idx * seg)))
    }, [dragLimit, options.length, middleIndex, trackWidth, x])

    // Visuals tied to drag
    const fillEnd = neoBrutal ? NB.green : 'var(--color-primary)'
    const backgroundFill = useTransform(x, [0, dragLimit], ['#E5E5E5', fillEnd])
    const fillWidth = useTransform(x, (xVal) => `${xVal}px`)

    // Determine the active index based on the x position
    // Since there are N options, we split the dragLimit into (N-1) segments
    x.on("change", (latestX) => {
        if (!committed) {
            const segmentWidth = dragLimit / (options.length - 1)
            let rawIndex = Math.round(latestX / segmentWidth)
            rawIndex = Math.max(0, Math.min(rawIndex, options.length - 1))

            if (rawIndex !== selectedIndex) {
                setSelectedIndex(rawIndex)
            }
        }
    })

    const startXRef = useRef(0)
    const bind = useDrag(({ down, movement: [mx], first }) => {
        if (committed) return

        if (first) startXRef.current = x.get()
        let newX = startXRef.current + mx
        newX = Math.max(0, Math.min(newX, dragLimit))

        if (down) {
            x.set(newX)
        } else {
            // Snap to nearest detent on release
            const segmentWidth = dragLimit / (options.length - 1)
            const snapIndex = Math.round(newX / segmentWidth)
            const snapX = snapIndex * segmentWidth

            x.set(snapX)
            setSelectedIndex(snapIndex)
            onInteraction?.()
        }
    }, { filterTaps: true, preventScroll: true })

    const handleSubmit = () => {
        if (selectedIndex !== null) {
            setCommitted(true)
            onAnswer(options[selectedIndex])
        }
    }

    const shell = neoBrutal
        ? {
            background: NB.cardBg,
            borderRadius: '20px',
            border: NB.border,
            boxShadow: NB.shadow,
            fontFamily: NB.font,
        }
        : {
            background: 'white',
            borderRadius: '20px',
            border: '2px solid var(--color-border)',
            borderBottom: '4px solid var(--color-border-dark)',
        }

    return (
        <div
            ref={shellRef}
            style={{ position: 'relative', width: '100%', maxWidth: '300px', ...(neoBrutal ? { fontFamily: NB.font } : {}) }}
            className="animate-pop-in"
        >
            <motion.div
                className="game-mode-card-shell"
                style={{
                    ...shell,
                    padding: '28px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    opacity: committed ? 0 : 1, // Will fade out when app transitions
                }}
            >
                {/* Question */}
                <div style={{ textAlign: 'center' }}>
                    <h2
                        className="game-mode-question-title"
                        style={{
                        fontSize: '1.25rem',
                        fontWeight: '800',
                        lineHeight: 1.35,
                        color: neoBrutal ? NB.black : 'var(--color-text)',
                        marginBottom: '8px',
                    }}
                    >
                        {question}
                    </h2>
                    <p style={{
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        color: neoBrutal ? NB.black : 'var(--color-text-muted)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        minHeight: '12px'
                    }}>
                        {selectedIndex !== null ? options[selectedIndex] : 'Slide to select'}
                    </p>
                </div>

                {/* Slider Track */}
                <div style={{ 
                    position: 'relative', 
                    height: '56px', 
                    display: 'flex', 
                    alignItems: 'center',
                    paddingLeft: `${thumbWidth / 2}px`,
                    paddingRight: `${thumbWidth / 2}px`,
                }}>
                    {/* Tick Marks - on top */}
                    {options.map((_, index) => {
                        const tickX = (index / (options.length - 1)) * dragLimit
                        return (
                            <div
                                key={index}
                                style={{
                                    position: 'absolute',
                                    left: `${tickX + thumbWidth / 2}px`,
                                    top: '0px',
                                    transform: 'translateX(-50%)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                }}
                            >
                                <div style={{
                                    width: '2px',
                                    height: '8px',
                                    backgroundColor: selectedIndex === index ? (neoBrutal ? NB.green : 'var(--color-primary)') : '#C0C0C0',
                                    borderRadius: '1px',
                                    transition: 'background-color 0.2s ease',
                                }} />
                            </div>
                        )
                    })}

                    {/* Background Track */}
                    <div style={{
                        position: 'absolute',
                        left: `${thumbWidth / 2}px`,
                        right: `${thumbWidth / 2}px`,
                        top: '50%',
                        marginTop: '-7px',
                        height: '14px',
                        borderRadius: '7px',
                        backgroundColor: '#F0F0F0',
                        boxShadow: neoBrutal ? 'none' : 'inset 0 2px 4px rgba(0,0,0,0.05)',
                        border: neoBrutal ? `2px solid ${NB.black}` : undefined,
                    }} />

                    {/* Colored Active Fill */}
                    <motion.div style={{
                        height: '14px',
                        borderRadius: '7px',
                        position: 'absolute',
                        left: `${thumbWidth / 2}px`,
                        top: '50%',
                        marginTop: '-7px',
                        backgroundColor: backgroundFill,
                        width: fillWidth,
                    }} />

                    {/* Draggable Thumb - centered on track */}
                    <motion.div
                        {...(bind() as any)}
                        tabIndex={0}
                        style={{
                            x,
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            marginTop: `-${thumbWidth / 2}px`,
                            width: `${thumbWidth}px`,
                            height: `${thumbWidth}px`,
                            borderRadius: '50%',
                            cursor: 'grab',
                            touchAction: 'none',
                            ...(neoBrutal
                                ? {
                                    backgroundColor: NB.yellow,
                                    border: `3px solid ${NB.black}`,
                                    boxShadow: NB.shadowSm,
                                }
                                : {
                                    backgroundColor: 'white',
                                    border: '3px solid',
                                    borderColor: backgroundFill,
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                }),
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95, cursor: 'grabbing' }}
                    />
                </div>

                {/* Labels for first and last options */}
                <div
                    className="likert-endcap-labels"
                    style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '-8px',
                    paddingLeft: '4px',
                    paddingRight: '4px',
                }}
                >
                    <span style={{
                        fontSize: '0.6rem',
                        fontWeight: neoBrutal ? 800 : '600',
                        color: neoBrutal ? NB.black : 'var(--color-text-muted)',
                        maxWidth: '80px',
                        textAlign: 'left',
                    }}>
                        {options[0]}
                    </span>
                    <span style={{
                        fontSize: '0.6rem',
                        fontWeight: neoBrutal ? 800 : '600',
                        color: neoBrutal ? NB.black : 'var(--color-text-muted)',
                        maxWidth: '80px',
                        textAlign: 'right',
                    }}>
                        {options[options.length - 1]}
                    </span>
                </div>

                {/* Submit button specifically for confirming the slider */}
                <button
                    onClick={handleSubmit}
                    disabled={selectedIndex === null}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    style={neoBrutal ? {
                        padding: '12px',
                        borderRadius: '14px',
                        fontFamily: NB.font,
                        fontWeight: 900,
                        fontSize: '0.9rem',
                        color: NB.black,
                        background: selectedIndex !== null ? NB.yellow : '#D0D0D0',
                        border: NB.border,
                        boxShadow: selectedIndex !== null ? NB.shadow : 'none',
                        cursor: selectedIndex !== null ? 'pointer' : 'not-allowed',
                        textTransform: 'uppercase',
                        transform: hovered && selectedIndex !== null ? 'translate(-1px,-1px)' : 'none',
                        transition: 'all 0.1s ease',
                    } : {
                        padding: '12px',
                        borderRadius: '12px',
                        fontWeight: '800',
                        fontSize: '0.9rem',
                        color: 'white',
                        background: selectedIndex !== null ? 'var(--color-primary)' : 'var(--color-border-dark)',
                        border: 'none',
                        borderBottom: selectedIndex !== null ? '4px solid var(--color-primary-dark)' : '4px solid #B0B0B0',
                        cursor: selectedIndex !== null ? 'pointer' : 'not-allowed',
                        textTransform: 'uppercase',
                        transform: hovered && selectedIndex !== null ? 'translateY(-2px)' : 'none',
                        transition: 'all 0.1s ease',
                    }}
                >
                    Confirm
                </button>
            </motion.div>
        </div>
    )
}
