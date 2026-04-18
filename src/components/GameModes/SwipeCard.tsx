import { useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { useDrag } from '@use-gesture/react'
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

function OptionPill({ dir, label, active, selected, neoBrutal }: { dir: string; label: string; active: boolean; selected: boolean; neoBrutal?: boolean }) {
    const highlighted = active || selected
    const color = neoBrutal ? NB.black : 'var(--color-text)'

    return (
        <div style={{
            opacity: highlighted ? 1 : 0.35,
            color: color,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s ease',
            pointerEvents: 'none',
            userSelect: 'none',
            transform: highlighted ? 'scale(1.15)' : 'scale(1)',
            fontWeight: '900',
            fontFamily: neoBrutal ? NB.font : 'inherit',
            maxWidth: '90px',
            textAlign: 'center',
        }}>
            {dir === 'up' && <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{ARROWS[dir]}</span>}
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', wordWrap: 'break-word', width: '100%' }}>{label}</span>
            {dir !== 'up' && <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{ARROWS[dir]}</span>}
        </div>
    )
}

export function SwipeCard({ question, options, onAnswer, onDragStart, selectedAnswer, neoBrutal }: SwipeCardProps) {
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
                    onAnswer(options[finalDir])
                    mx.set(0, false)
                    my.set(0, false)
                    setActiveDir(null)
                }, 200)
            } else {
                mx.set(0)
                my.set(0)
            }
        }
    }, { preventScroll: true, preventScrollAxis: 'xy' })

    const cardNeo = neoBrutal
        ? {
            background: NB.cardBg,
            borderRadius: '20px',
            border: NB.border,
            boxShadow: NB.shadow,
            padding: '28px 22px',
        }
        : {
            background: 'white',
            borderRadius: '20px',
            border: `2px solid ${activeDir ? 'var(--color-primary)' : 'var(--color-border)'}`,
            borderBottom: `4px solid ${activeDir ? 'var(--color-primary-dark)' : 'var(--color-border-dark)'}`,
            padding: '28px 22px',
        }

    return (
        <div style={{ position: 'relative', width: '320px', height: '420px', ...neoBrutal ? { fontFamily: NB.font } : {} }} className="animate-pop-in">
            <motion.div
                {...(bind() as any)}
                style={{
                    x: mx,
                    y: my,
                    rotate,
                    ...cardNeo,
                    cursor: 'grab',
                    touchAction: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    ...(neoBrutal && activeDir ? { outline: `3px solid ${NB.green}` } : {}),
                }}
                whileTap={{ cursor: 'grabbing' }}
            >
                {/* Top Option */}
                <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)' }}>
                    <OptionPill dir="up" label={options.up} active={activeDir === 'up'} selected={selectedAnswer === options.up} neoBrutal={neoBrutal} />
                </div>

                {/* Question (Centered) */}
                <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    width: '65%',
                    textAlign: 'center', 
                    userSelect: 'none',
                    pointerEvents: 'none'
                }}>
                    <h2 style={{
                        fontSize: '1.4rem',
                        fontWeight: '800',
                        lineHeight: 1.35,
                        color: neoBrutal ? NB.black : 'var(--color-text)',
                        marginBottom: '12px',
                    }}>
                        {question}
                    </h2>
                    <p style={{
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        color: neoBrutal ? NB.black : 'var(--color-text-muted)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        opacity: 0.6,
                    }}>
                        swipe to answer
                    </p>
                </div>

                {/* Left Option */}
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    <OptionPill dir="left" label={options.left} active={activeDir === 'left'} selected={selectedAnswer === options.left} neoBrutal={neoBrutal} />
                </div>

                {/* Right Option */}
                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    <OptionPill dir="right" label={options.right} active={activeDir === 'right'} selected={selectedAnswer === options.right} neoBrutal={neoBrutal} />
                </div>

                {/* Bottom Option */}
                <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)' }}>
                    <OptionPill dir="down" label={options.down} active={activeDir === 'down'} selected={selectedAnswer === options.down} neoBrutal={neoBrutal} />
                </div>
            </motion.div>
        </div>
    )
}
