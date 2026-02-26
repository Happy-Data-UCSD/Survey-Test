import { useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useDrag } from '@use-gesture/react'

interface LikertSliderProps {
    question: string
    options: string[]
    onAnswer: (answer: string) => void
    onInteraction: () => void
}

export function LikertSlider({ question, options, onAnswer, onInteraction }: LikertSliderProps) {
    const [committed, setCommitted] = useState(false)
    const [hovered, setHovered] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    // Using useMotionValue directly for more manual control of the drag track
    const x = useMotionValue(0)

    // We assume track width is ~260px (300px container minus padding)
    const trackWidth = 260
    const thumbWidth = 40
    const dragLimit = trackWidth - thumbWidth

    // Visuals tied to drag
    const backgroundFill = useTransform(x, [0, dragLimit], ['#E5E5E5', 'var(--color-primary)'])
    const fillWidth = useTransform(x, (xVal) => `${xVal + thumbWidth / 2}px`)

    // Determine the active index based on the x position
    // Since there are N options, we split the dragLimit into (N-1) segments
    x.on("change", (latestX) => {
        if (!committed) {
            const segmentWidth = dragLimit / (options.length - 1)
            let rawIndex = Math.round(latestX / segmentWidth)
            rawIndex = Math.max(0, Math.min(rawIndex, options.length - 1))

            if (rawIndex !== selectedIndex) {
                setSelectedIndex(rawIndex)
                onInteraction() // Play a soft tick sound when snapping across detents
            }
        }
    })

    const bind = useDrag(({ down, movement: [mx] }) => {
        if (committed) return

        let newX = x.get() + mx
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
            onInteraction()
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
                <div style={{ position: 'relative', height: '40px', display: 'flex', alignItems: 'center' }}>
                    {/* Background Track */}
                    <motion.div style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        height: '14px',
                        borderRadius: '7px',
                        backgroundColor: '#F0F0F0',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                    }} />

                    {/* Colored Active Fill */}
                    <motion.div style={{
                        position: 'absolute',
                        left: 0,
                        height: '14px',
                        borderRadius: '7px',
                        backgroundColor: backgroundFill,
                        width: fillWidth,
                    }} />

                    {/* Draggable Thumb */}
                    <motion.div
                        {...(bind() as any)}
                        style={{
                            x,
                            width: `${thumbWidth}px`,
                            height: `${thumbWidth}px`,
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            border: '3px solid',
                            borderColor: backgroundFill,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            position: 'absolute',
                            cursor: 'grab',
                            touchAction: 'none'
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95, cursor: 'grabbing' }}
                    />
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
