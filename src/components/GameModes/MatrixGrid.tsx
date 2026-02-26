import { useState } from 'react'
import { motion } from 'framer-motion'

interface MatrixGridProps {
    question: string
    rows: string[]
    columns: string[]
    onAnswer: (answers: Record<string, string>) => void
    onInteraction: () => void
}

export function MatrixGrid({ question, rows, columns, onAnswer, onInteraction }: MatrixGridProps) {
    // State to track which column is selected for each row
    const [selections, setSelections] = useState<Record<string, string>>({})
    const [committed, setCommitted] = useState(false)

    const handleSelect = (row: string, col: string) => {
        setSelections(prev => ({ ...prev, [row]: col }))
        onInteraction()
    }

    const isComplete = rows.every(row => selections[row])

    const handleSubmit = () => {
        if (isComplete) {
            setCommitted(true)
            onAnswer(selections)
        }
    }

    return (
        <div style={{ position: 'relative', width: '380px' }} className="animate-pop-in">
            <motion.div
                style={{
                    background: 'white',
                    borderRadius: '24px',
                    border: '2px solid var(--color-border)',
                    borderBottom: '4px solid var(--color-border-dark)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    opacity: committed ? 0 : 1,
                }}
            >
                <h2 style={{
                    fontSize: '1.2rem',
                    fontWeight: '800',
                    lineHeight: 1.35,
                    color: 'var(--color-text)',
                    textAlign: 'center'
                }}>
                    {question}
                </h2>

                {/* Matrix Grid Representation */}
                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Header Row (Columns) */}
                        <div style={{ display: 'flex', paddingLeft: '100px', gap: '8px' }}>
                            {columns.map(col => (
                                <div key={col} style={{
                                    flex: 1,
                                    textAlign: 'center',
                                    fontSize: '0.6rem',
                                    fontWeight: '800',
                                    color: 'var(--color-text-muted)',
                                    textTransform: 'uppercase'
                                }}>
                                    {col}
                                </div>
                            ))}
                        </div>

                        {/* Data Rows */}
                        {rows.map((row, rIdx) => (
                            <div key={row} style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: rIdx % 2 === 0 ? '#F9F9F9' : 'transparent',
                                padding: '8px',
                                borderRadius: '12px'
                            }}>
                                {/* Row Label */}
                                <div style={{
                                    width: '92px',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    color: 'var(--color-text)'
                                }}>
                                    {row}
                                </div>

                                {/* Radio Choices */}
                                <div style={{ display: 'flex', flex: 1, gap: '8px' }}>
                                    {columns.map(col => {
                                        const isSelected = selections[row] === col
                                        return (
                                            <motion.button
                                                key={`${row}-${col}`}
                                                onClick={() => handleSelect(row, col)}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                style={{
                                                    flex: 1,
                                                    height: '28px',
                                                    borderRadius: '8px',
                                                    background: isSelected ? 'var(--color-primary)' : 'white',
                                                    border: isSelected ? '2px solid var(--color-primary-dark)' : '2px solid #E0E0E0',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                {/* Inner dot for radio feel */}
                                                {isSelected && (
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />
                                                )}
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <motion.button
                    onClick={handleSubmit}
                    whileHover={isComplete ? { scale: 1.02 } : {}}
                    whileTap={isComplete ? { scale: 0.98 } : {}}
                    style={{
                        padding: '14px',
                        borderRadius: '16px',
                        fontWeight: '800',
                        fontSize: '0.9rem',
                        color: 'white',
                        background: isComplete ? 'var(--color-primary)' : 'var(--color-border-dark)',
                        border: 'none',
                        borderBottom: isComplete ? '4px solid var(--color-primary-dark)' : '4px solid #B0B0B0',
                        cursor: isComplete ? 'pointer' : 'not-allowed',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        transition: 'all 0.2s ease'
                    }}
                >
                    Submit Layout
                </motion.button>
            </motion.div>
        </div>
    )
}
