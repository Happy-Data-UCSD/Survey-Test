import { useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { useDrag } from '@use-gesture/react'

export type Direction = 'up' | 'down' | 'left' | 'right' | null

interface SwipeCardProps {
    question: string
    options: { up: string; down: string; left: string; right: string }
    onAnswer: (answer: Direction) => void
    onDragStart?: () => void
}

const ARROWS: Record<string, string> = { up: '↑', down: '↓', left: '←', right: '→' }

function OptionPill({ dir, label, active }: { dir: string; label: string; active: boolean }) {
    return (
        <div style={{
            width: '80px',
            height: '65px',
            padding: '6px 4px',
            borderRadius: '12px',
            background: active ? 'var(--color-primary)' : '#F4F4F4',
            border: `2px solid ${active ? 'var(--color-primary-dark)' : '#E0E0E0'}`,
            borderBottom: `4px solid ${active ? 'var(--color-primary-dark)' : 'var(--color-border-dark)'}`,
            color: active ? 'white' : 'var(--color-text-muted)',
            fontWeight: '800',
            fontSize: '0.65rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2px',
            transition: 'all 0.12s ease',
            pointerEvents: 'none',
            userSelect: 'none',
            overflow: 'hidden',
        }}>
            <span style={{ fontSize: '1.2rem', opacity: active ? 1 : 0.6, lineHeight: 1 }}>
                {ARROWS[dir]}
            </span>
            <span style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
                textAlign: 'center'
            }}>
                {label}
            </span>
        </div>
    )
}

export function SwipeCard({ question, options, onAnswer, onDragStart }: SwipeCardProps) {
    const [activeDir, setActiveDir] = useState<Direction>(null)

    const mx = useSpring(0, { bounce: 0, stiffness: 400, damping: 30 })
    const my = useSpring(0, { bounce: 0, stiffness: 400, damping: 30 })
    const rotate = useTransform(mx, [-200, 200], [-12, 12])

    const threshold = 100

    const bind = useDrag(({ down, movement: [dx, dy], first }) => {
        if (first && onDragStart) onDragStart()

        if (down) {
            mx.set(dx)
            my.set(dy)
            if (Math.abs(dx) > Math.abs(dy)) {
                setActiveDir(dx > threshold ? 'right' : dx < -threshold ? 'left' : null)
            } else {
                setActiveDir(dy > threshold ? 'down' : dy < -threshold ? 'up' : null)
            }
        } else {
            const finalDir = activeDir
            if (finalDir) {
                mx.set(finalDir === 'left' ? -500 : finalDir === 'right' ? 500 : 0)
                my.set(finalDir === 'up' ? -500 : finalDir === 'down' ? 500 : 0)
                setTimeout(() => {
                    onAnswer(finalDir)
                    mx.set(0, false)
                    my.set(0, false)
                    setActiveDir(null)
                }, 200)
            } else {
                mx.set(0)
                my.set(0)
            }
        }
    })

    return (
        <div style={{ position: 'relative', width: '300px' }} className="animate-pop-in">
            <motion.div
                {...(bind() as any)}
                style={{
                    x: mx,
                    y: my,
                    rotate,
                    background: 'white',
                    borderRadius: '20px',
                    border: `2px solid ${activeDir ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderBottom: `4px solid ${activeDir ? 'var(--color-primary-dark)' : 'var(--color-border-dark)'}`,
                    padding: '28px 22px',
                    cursor: 'grab',
                    touchAction: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                }}
                whileTap={{ cursor: 'grabbing' }}
            >
                {/* Question */}
                <div style={{ textAlign: 'center', userSelect: 'none' }}>
                    <h2 style={{
                        fontSize: '1.3rem',
                        fontWeight: '800',
                        lineHeight: 1.35,
                        color: 'var(--color-text)',
                        marginBottom: '8px',
                        userSelect: 'none',
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
                        swipe to answer
                    </p>
                </div>

                {/* Option grid: D-Pad Layout (cross) */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto auto auto',
                    gridTemplateRows: 'auto auto auto',
                    gap: '6px',
                    width: '100%',
                    justifyContent: 'center',
                    justifyItems: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{ gridColumn: '2 / 3', gridRow: '1 / 2' }}>
                        <OptionPill dir="up" label={options.up} active={activeDir === 'up'} />
                    </div>

                    <div style={{ gridColumn: '1 / 2', gridRow: '2 / 3' }}>
                        <OptionPill dir="left" label={options.left} active={activeDir === 'left'} />
                    </div>

                    {/* Center empty space could hold an icon or stay blank */}
                    <div style={{ gridColumn: '2 / 3', gridRow: '2 / 3', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-border)', opacity: 0.5 }}></div>

                    <div style={{ gridColumn: '3 / 4', gridRow: '2 / 3' }}>
                        <OptionPill dir="right" label={options.right} active={activeDir === 'right'} />
                    </div>

                    <div style={{ gridColumn: '2 / 3', gridRow: '3 / 4' }}>
                        <OptionPill dir="down" label={options.down} active={activeDir === 'down'} />
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
