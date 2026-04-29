import { useState } from 'react'
import { motion } from 'framer-motion'
import { NB } from '../../styles/neobrutal'

interface NPSStarsProps {
    question: string
    scale: number // e.g. 5 for stars, 10 for standard NPS
    onAnswer: (answer: string) => void
    onInteraction: () => void
    selectedAnswer?: string
    neoBrutal?: boolean
}

export function NPSStars({ question, scale, onAnswer, onInteraction, selectedAnswer, neoBrutal }: NPSStarsProps) {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null)
    const initialSelection = selectedAnswer ? parseInt(selectedAnswer, 10) : null
    const [selectedIndex, setSelectedIndex] = useState<number | null>(initialSelection)
    const [committed, setCommitted] = useState(false)

    // For large scales (e.g. 10), we display numbers. For 5, we can use a Star icon or simplified design.
    const isLargeScale = scale > 5

    // Generate array of options (0-10 for NPS, 1-5 for stars)
    const options = isLargeScale 
        ? Array.from({ length: scale + 1 }, (_, i) => i) 
        : Array.from({ length: scale }, (_, i) => i + 1)

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
        <div style={{ position: 'relative', width: '100%', maxWidth: isLargeScale ? '420px' : '300px' }} className="animate-pop-in">
            <motion.div
                className="game-mode-card-shell"
                style={{
                    ...shell,
                    padding: '28px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    opacity: committed ? 0 : 1,
                }}
            >
                {/* Question */}
                <div style={{ textAlign: 'center' }}>
                    <h2
                        className="game-mode-question-title"
                        style={{
                        fontSize: '1.2rem',
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
                    }}>
                        {isLargeScale ? '0 to 10 rating' : 'Tap to rate'}
                    </p>
                </div>

                {/* Stars / Numbers Container */}
                <div style={
                    neoBrutal && isLargeScale
                        ? {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(11, minmax(0, 1fr))',
                            gap: '3px',
                            width: '100%',
                            paddingLeft: '2px',
                            paddingRight: '2px',
                            boxSizing: 'border-box',
                        }
                        : {
                            display: 'flex',
                            flexWrap: 'nowrap',
                            justifyContent: isLargeScale ? 'space-between' : 'center',
                            gap: isLargeScale ? '4px' : '10px',
                        }
                }>
                    {options.map((option) => {
                        // For 5-star, color fills up to hover/selection
                        // For 10-point NPS, color is individual button state
                        const isSelected = selectedIndex === option;
                        const isHovered = hoverIndex === option;
                        const isActive = isLargeScale
                            ? isSelected || isHovered
                            : (hoverIndex !== null ? option <= hoverIndex : (selectedIndex !== null && option <= selectedIndex));

                        // Gradient color from red (0) -> yellow (5) -> green (10)
                        const hue = (option / 10) * 120;
                        const npsColor = `hsl(${hue}, 70%, 45%)`;
                        const npsColorDark = `hsl(${hue}, 70%, 35%)`;

                        if (neoBrutal) {
                            const nbActive = isLargeScale
                                ? isActive
                                : (hoverIndex !== null ? option <= hoverIndex : (selectedIndex !== null && option <= selectedIndex))
                            return (
                                <motion.button
                                    key={option}
                                    onMouseEnter={() => setHoverIndex(option)}
                                    onMouseLeave={() => setHoverIndex(null)}
                                    onClick={() => handleSelect(option)}
                                    whileHover={{ scale: 1.06, y: -1 }}
                                    whileTap={{ scale: 0.94 }}
                                    style={{
                                        width: isLargeScale ? '100%' : 44,
                                        height: isLargeScale ? 30 : 44,
                                        minWidth: isLargeScale ? 0 : undefined,
                                        borderRadius: isLargeScale ? '8px' : '50%',
                                        background: nbActive ? NB.black : NB.yellow,
                                        border: NB.border,
                                        boxShadow: nbActive ? NB.shadowSm : NB.shadow,
                                        color: nbActive ? '#fff' : NB.black,
                                        fontFamily: NB.font,
                                        fontWeight: '900',
                                        fontSize: isLargeScale ? (option >= 10 ? '0.65rem' : '0.7rem') : '1.2rem',
                                        fontVariantNumeric: 'tabular-nums',
                                        lineHeight: 1,
                                        padding: 0,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        transition: 'background 0.15s ease, color 0.15s ease',
                                        flexShrink: 0,
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    {isLargeScale ? option : '★'}
                                </motion.button>
                            )
                        }
                        return (
                            <motion.button
                                key={option}
                                onMouseEnter={() => setHoverIndex(option)}
                                onMouseLeave={() => setHoverIndex(null)}
                                onClick={() => handleSelect(option)}
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.9 }}
                                style={{
                                    width: isLargeScale ? '32px' : '44px',
                                    height: isLargeScale ? '32px' : '44px',
                                    borderRadius: isLargeScale ? '8px' : '50%',
                                    background: isActive ? (isLargeScale ? npsColor : 'var(--color-accent)') : '#F4F4F4',
                                    border: isActive ? `2px solid ${isLargeScale ? npsColorDark : 'var(--color-accent-dark)'}` : '2px solid #E0E0E0',
                                    borderBottom: isActive ? `3px solid ${isLargeScale ? npsColorDark : 'var(--color-accent-dark)'}` : '3px solid #D0D0D0',
                                    color: isActive ? 'white' : 'var(--color-text-muted)',
                                    fontWeight: '800',
                                    fontSize: isLargeScale ? '0.85rem' : '1.2rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    transition: 'background 0.15s ease, color 0.15s ease',
                                    flexShrink: 0,
                                }}
                            >
                                {isLargeScale ? option : '★'}
                            </motion.button>
                        )
                    })}
                </div>

                {/* Labels for NPS */}
                {isLargeScale && (
                    <div
                        className="nps-scale-endcaps"
                        style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: neoBrutal ? '0 2px' : '0 4px',
                        boxSizing: 'border-box',
                    }}
                    >
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: neoBrutal ? NB.black : 'var(--color-text-muted)', textTransform: 'uppercase' }}>Not likely</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: neoBrutal ? NB.black : 'var(--color-text-muted)', textTransform: 'uppercase' }}>Very likely</span>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
