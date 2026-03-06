import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

interface ConfidenceAllocatorProps {
    question: string
    options: string[]
    onAnswer: (answer: string) => void
    onInteraction?: () => void
    selectedAnswer?: string
}

function equalSplit(n: number): number[] {
    const base = Math.floor(100 / n / 10) * 10
    if (base === 0) return Array.from({ length: n }, (_, i) => (i === 0 ? 100 : 0))
    const result = Array(n).fill(base)
    result[n - 1] = 100 - base * (n - 1)
    return result
}

const roundTo10 = (v: number) => Math.round(Math.max(0, Math.min(100, v)) / 10) * 10

export function ConfidenceAllocator({ question, options, onAnswer, onInteraction, selectedAnswer }: ConfidenceAllocatorProps) {
    const parseInitialAllocations = (): number[] => {
        if (selectedAnswer) {
            try {
                const record: Record<string, number> = JSON.parse(selectedAnswer)
                return options.map(opt => record[opt] ?? 0)
            } catch {
                return equalSplit(options.length)
            }
        }
        return equalSplit(options.length)
    }
    const [allocations, setAllocations] = useState<number[]>(parseInitialAllocations)
    const [committed, setCommitted] = useState(false)

    const total = useMemo(() => allocations.reduce((a, b) => a + b, 0), [allocations])
    const isComplete = total === 100

    const handleChange = (index: number, value: number) => {
        onInteraction?.()
        setAllocations(prev => {
            const next = [...prev]
            next[index] = roundTo10(value)
            return next
        })
    }

    const handleSubmit = () => {
        if (!isComplete) return
        setCommitted(true)
        const record: Record<string, number> = {}
        options.forEach((opt, i) => { record[opt] = allocations[i] })
        onAnswer(JSON.stringify(record))
    }

    return (
        <div style={{ position: 'relative', width: '320px' }} className="animate-pop-in">
            <motion.div
                style={{
                    background: 'white',
                    borderRadius: '20px',
                    border: '2px solid var(--color-border)',
                    borderBottom: '4px solid var(--color-border-dark)',
                    padding: '28px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    opacity: committed ? 0 : 1,
                }}
            >
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
                        minHeight: '12px',
                    }}>
                        {isComplete ? '100% allocated' : 'Distribute 100% across all options'}
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {options.map((opt, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '700',
                                    color: 'var(--color-text)',
                                }}>
                                    {opt}
                                </span>
                                <span style={{
                                    fontSize: '0.85rem',
                                    fontWeight: '800',
                                    color: 'var(--color-primary)',
                                    minWidth: '36px',
                                    textAlign: 'right',
                                }}>
                                    {allocations[i]}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                step={10}
                                value={allocations[i]}
                                onChange={(e) => handleChange(i, Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    accentColor: 'var(--color-primary)',
                                    cursor: 'pointer',
                                }}
                            />
                        </div>
                    ))}
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '4px',
                }}>
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: isComplete ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    }}>
                        Total: {total}%
                    </span>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!isComplete}
                    style={{
                        padding: '12px',
                        borderRadius: '12px',
                        fontWeight: '800',
                        fontSize: '0.9rem',
                        color: 'white',
                        background: isComplete ? 'var(--color-primary)' : 'var(--color-border-dark)',
                        border: 'none',
                        borderBottom: isComplete ? '4px solid var(--color-primary-dark)' : '4px solid #B0B0B0',
                        cursor: isComplete ? 'pointer' : 'not-allowed',
                        textTransform: 'uppercase',
                        transition: 'all 0.1s ease',
                    }}
                >
                    Confirm
                </button>
            </motion.div>
        </div>
    )
}
