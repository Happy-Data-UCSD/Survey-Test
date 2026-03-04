import { useState } from 'react'
import { motion } from 'framer-motion'

interface NPSStarsProps {
    question: string
    scale: number // e.g. 5 for stars, 10 for standard NPS
    onAnswer: (answer: string) => void
    onInteraction: () => void
}

export function NPSStars({ question, scale, onAnswer, onInteraction }: NPSStarsProps) {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null)
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const [committed, setCommitted] = useState(false)

    // Generate array of options
    const options = Array.from({ length: scale }, (_, i) => i + 1)

    // For large scales (e.g. 10), we display numbers. For 5, we can use a Star icon or simplified design.
    const isLargeScale = scale > 5

    const handleSelect = (index: number) => {
        if (committed) return
        setSelectedIndex(index)
        onInteraction()

        // Auto-submit after a brief satisfying delay for single-tap NPS
        setTimeout(() => {
            setCommitted(true)
            onAnswer(index.toString())
        }, 500)
    }

    return (
        <div style={{ position: 'relative', width: isLargeScale ? '340px' : '300px' }} className="animate-pop-in">
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
                    opacity: committed ? 0 : 1,
                }}
            >
                {/* Question */}
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{
                        fontSize: '1.2rem',
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
                    }}>
                        {isLargeScale ? '0 to 10 rating' : 'Tap to rate'}
                    </p>
                </div>

                {/* Stars / Numbers Container */}
                <div style={{
                    display: 'flex',
                    flexWrap: isLargeScale ? 'wrap' : 'nowrap',
                    justifyContent: 'center',
                    gap: isLargeScale ? '6px' : '10px',
                }}>
                    {options.map((option) => {
                        // For 5-star, color fills up to hover/selection
                        // For 10-point NPS, color is individual button state
                        const isActive = isLargeScale
                            ? selectedIndex === option
                            : (hoverIndex !== null ? option <= hoverIndex : (selectedIndex !== null && option <= selectedIndex));

                        const isNPSDetractor = isLargeScale && option <= 6;
                        const isNPSPassive = isLargeScale && option > 6 && option <= 8;

                        // Give subtle color hints to NPS numbers
                        let npsColor = 'var(--color-primary)';
                        if (isLargeScale && isActive) {
                            if (isNPSDetractor) npsColor = 'var(--color-danger)';
                            if (isNPSPassive) npsColor = 'var(--color-accent)';
                        }

                        return (
                            <motion.button
                                key={option}
                                onMouseEnter={() => setHoverIndex(option)}
                                onMouseLeave={() => setHoverIndex(null)}
                                onClick={() => handleSelect(option)}
                                whileHover={{ scale: 1.15, y: -2 }}
                                whileTap={{ scale: 0.9 }}
                                style={{
                                    width: isLargeScale ? '40px' : '44px',
                                    height: isLargeScale ? '40px' : '44px',
                                    borderRadius: isLargeScale ? '8px' : '50%',
                                    background: isActive ? (isLargeScale ? npsColor : 'var(--color-accent)') : '#F4F4F4',
                                    border: isActive ? `2px solid ${isLargeScale ? npsColor : 'var(--color-accent-dark)'}` : '2px solid #E0E0E0',
                                    borderBottom: isActive ? `4px solid ${isLargeScale ? npsColor : 'var(--color-accent-dark)'}` : '4px solid #D0D0D0',
                                    color: isActive ? 'white' : 'var(--color-text-muted)',
                                    fontWeight: '800',
                                    fontSize: isLargeScale ? '1rem' : '1.2rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    transition: 'background 0.15s ease, color 0.15s ease'
                                }}
                            >
                                {isLargeScale ? option : '★'}
                            </motion.button>
                        )
                    })}
                </div>

                {/* Labels for NPS */}
                {isLargeScale && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Not likely</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Very likely</span>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
