import { useState } from 'react'
import { motion } from 'framer-motion'
import { NB } from '../../styles/neobrutal'

interface OpenEndedBoxProps {
    question: string
    onAnswer: (answer: string) => void
    onInteraction: () => void
    selectedAnswer?: string
    neoBrutal?: boolean
}

export function OpenEndedBox({ question, onAnswer, onInteraction, selectedAnswer, neoBrutal }: OpenEndedBoxProps) {
    const [text, setText] = useState(selectedAnswer || "")
    const [committed, setCommitted] = useState(false)
    const [focused, setFocused] = useState(false)

    const handleSubmit = () => {
        if (text.trim().length > 0) {
            setCommitted(true)
            onInteraction()
            onAnswer(text)
        }
    }

    const shell = neoBrutal
        ? {
            background: NB.cardBg,
            borderRadius: '24px',
            border: NB.border,
            boxShadow: NB.shadow,
            fontFamily: NB.font,
        }
        : {
            background: 'white',
            borderRadius: '24px',
            border: '2px solid var(--color-border)',
            borderBottom: '4px solid var(--color-border-dark)',
        }

    return (
        <div style={{ position: 'relative', width: '320px' }} className="animate-pop-in">
            <motion.div
                style={{
                    ...shell,
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    opacity: committed ? 0 : 1,
                }}
            >
                {/* Question */}
                <h2 style={{
                    fontSize: '1.2rem',
                    fontWeight: '800',
                    lineHeight: 1.35,
                    color: neoBrutal ? NB.black : 'var(--color-text)',
                    textAlign: 'center'
                }}>
                    {question}
                </h2>

                {/* Text Area styling to look like a friendly chat bubble or notes area */}
                <div style={{
                    position: 'relative',
                    background: neoBrutal ? '#fff' : '#F9F9F9',
                    borderRadius: '16px',
                    padding: '12px',
                    border: neoBrutal
                        ? (focused ? `3px solid ${NB.green}` : NB.border)
                        : (focused ? '2px solid var(--color-primary)' : '2px solid #E0E0E0'),
                    transition: 'border 0.2s ease',
                    boxShadow: neoBrutal && !focused ? NB.shadowSm : undefined,
                }}>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onFocus={() => { setFocused(true); onInteraction() }}
                        onBlur={() => setFocused(false)}
                        placeholder="Type your answer here..."
                        style={{
                            width: '100%',
                            minHeight: '100px',
                            background: 'transparent',
                            border: 'none',
                            resize: 'none',
                            outline: 'none',
                            fontFamily: 'inherit',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: 'var(--color-text)',
                            lineHeight: 1.5,
                        }}
                    />
                </div>

                {/* Submit button */}
                <motion.button
                    onClick={handleSubmit}
                    whileHover={{ scale: neoBrutal ? 1 : 1.02 }}
                    whileTap={{ scale: neoBrutal ? 1 : 0.98 }}
                    style={neoBrutal ? {
                        padding: '14px',
                        borderRadius: '16px',
                        fontFamily: NB.font,
                        fontWeight: 900,
                        fontSize: '0.9rem',
                        color: NB.black,
                        background: text.trim().length > 0 ? NB.yellow : '#D0D0D0',
                        border: NB.border,
                        boxShadow: text.trim().length > 0 ? NB.shadow : 'none',
                        cursor: text.trim().length > 0 ? 'pointer' : 'not-allowed',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        transition: 'background 0.2s ease',
                    } : {
                        padding: '14px',
                        borderRadius: '16px',
                        fontWeight: '800',
                        fontSize: '0.9rem',
                        color: 'white',
                        background: text.trim().length > 0 ? 'var(--color-primary)' : 'var(--color-border-dark)',
                        border: 'none',
                        borderBottom: text.trim().length > 0 ? '4px solid var(--color-primary-dark)' : '4px solid #B0B0B0',
                        cursor: text.trim().length > 0 ? 'pointer' : 'not-allowed',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        transition: 'background 0.2s ease, border-bottom 0.2s ease'
                    }}
                >
                    Confirm
                </motion.button>
            </motion.div>
        </div>
    )
}
