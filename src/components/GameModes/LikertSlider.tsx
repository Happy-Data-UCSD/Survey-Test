import { useState, useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useDrag } from '@use-gesture/react'

interface LikertSliderProps {
    question: string
    options: string[]
    onAnswer: (answer: string) => void
    onInteraction?: () => void
    selectedAnswer?: string
}

export function LikertSlider({ question, options, onAnswer, onInteraction, selectedAnswer }: LikertSliderProps) {
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

    const trackWidth = 260
    const thumbWidth = 40
    const dragLimit = trackWidth - thumbWidth
    const initialX = (initialIndex / (options.length - 1)) * dragLimit

    const x = useMotionValue(initialX)

    // Visuals tied to drag
    const backgroundFill = useTransform(x, [0, dragLimit], ['#E5E5E5', 'var(--color-primary)'])
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
                onInteraction?.()
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
    }, { filterTaps: true })

    const handleSubmit = () => {
        if (selectedIndex !== null) {
            setCommitted(true)
            onAnswer(options[selectedIndex])
        }
    }

    return (
        <div style={{ position: 'relative', width: '300px' }} className="animate-pop-in">
            <motion.div
                style={{
                    background: 'white',
                    borderRadius: '20px',
                    border: '2px solid var(--color-border)',
                    borderBottom: '4px solid var(--color-border-dark)',
                    padding: '28px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    opacity: committed ? 0 : 1, // Will fade out when app transitions
                }}
            >
                {/* Question */}
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: '800',
                        lineHeight: 1.35,
                        color: 'var(--color-text)',
                        marginBottom: '8px',
                    }}>
                        {question}
                    </h2>
                    <p style={{
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        color: 'var(--color-text-muted)',
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
                                    backgroundColor: selectedIndex === index ? 'var(--color-primary)' : '#C0C0C0',
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
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
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
                            backgroundColor: 'white',
                            border: '3px solid',
                            borderColor: backgroundFill,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            cursor: 'grab',
                            touchAction: 'none'
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95, cursor: 'grabbing' }}
                    />
                </div>

                {/* Labels for first and last options */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '-8px',
                    paddingLeft: '4px',
                    paddingRight: '4px',
                }}>
                    <span style={{
                        fontSize: '0.6rem',
                        fontWeight: '600',
                        color: 'var(--color-text-muted)',
                        maxWidth: '80px',
                        textAlign: 'left',
                    }}>
                        {options[0]}
                    </span>
                    <span style={{
                        fontSize: '0.6rem',
                        fontWeight: '600',
                        color: 'var(--color-text-muted)',
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
                    style={{
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
