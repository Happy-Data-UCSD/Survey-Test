import { useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { useDrag } from '@use-gesture/react'

export type Direction = 'up' | 'down' | 'left' | 'right' | null

interface SwipeCardProps {
    question: string
    options: {
        up: string
        down: string
        left: string
        right: string
    }
    onAnswer: (dir: Direction) => void
    onDragStart?: () => void
}

export function SwipeCard({ question, options, onAnswer, onDragStart }: SwipeCardProps) {
    // Unused state removed
    const [activeDir, setActiveDir] = useState<Direction>(null)

    // Motion values
    const mx = useSpring(0, { bounce: 0, stiffness: 400, damping: 30 })
    const my = useSpring(0, { bounce: 0, stiffness: 400, damping: 30 })

    const rotate = useTransform(mx, [-200, 200], [-15, 15])

    const threshold = 100

    const bind = useDrag(({ down, movement: [dx, dy], first }) => {
        if (first && onDragStart) onDragStart()

        if (down) {
            mx.set(dx)
            my.set(dy)

            // Determine dominant direction
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > threshold) setActiveDir('right')
                else if (dx < -threshold) setActiveDir('left')
                else setActiveDir(null)
            } else {
                if (dy > threshold) setActiveDir('down')
                else if (dy < -threshold) setActiveDir('up')
                else setActiveDir(null)
            }
        } else {
            // Release
            let finalDir = activeDir
            if (finalDir) {
                // Swipe away
                let toX = 0, toY = 0
                if (finalDir === 'left') toX = -500
                if (finalDir === 'right') toX = 500
                if (finalDir === 'up') toY = -500
                if (finalDir === 'down') toY = 500
                mx.set(toX)
                my.set(toY)
                setTimeout(() => {
                    onAnswer(finalDir)
                    // Reset
                    mx.set(0, false)
                    my.set(0, false)
                    setActiveDir(null)
                }, 200)
            } else {
                // Snap back
                mx.set(0)
                my.set(0)
            }
        }
    })

    // Visual cues for direction options
    const Label = ({ dir, label, active }: { dir: string, label: string, active: boolean }) => {
        const isTopBottom = dir === 'up' || dir === 'down'
        return (
            <div style={{
                position: 'absolute',
                [dir === 'up' ? 'top' : dir === 'down' ? 'bottom' : 'top']: dir === 'up' ? '-40px' : dir === 'down' ? '-40px' : '50%',
                [dir === 'left' ? 'left' : dir === 'right' ? 'right' : 'left']: isTopBottom ? '50%' : '-40px',
                transform: isTopBottom ? 'translateX(-50%)' : 'translateY(-50%)',
                opacity: active ? 1 : 0.3,
                scale: active ? 1.2 : 1,
                transition: 'all 0.2s',
                fontWeight: 'bold',
                color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                background: 'rgba(255,255,255,0.8)',
                padding: '4px 12px',
                borderRadius: '12px',
                boxShadow: active ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                pointerEvents: 'none'
            }}>
                {label}
            </div>
        )
    }

    return (
        <div style={{ position: 'relative', width: '300px', height: '400px' }} className="animate-pop-in">
            <motion.div
                {...(bind() as any)}
                style={{
                    x: mx,
                    y: my,
                    rotate,
                    width: '100%',
                    height: '100%',
                    background: 'white',
                    borderRadius: '24px',
                    boxShadow: 'var(--shadow-glass)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '32px',
                    cursor: 'grab',
                    touchAction: 'none',
                    border: '2px solid',
                    borderColor: activeDir ? 'var(--color-primary)' : 'transparent',
                }}
                whileTap={{ cursor: 'grabbing', scale: 0.98 }}
            >
                <h2 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '20px' }}>{question}</h2>
                <div style={{ fontSize: '3rem', color: 'var(--color-primary)' }}>🤔</div>

                <Label dir="up" label={`⬆️ ${options.up}`} active={activeDir === 'up'} />
                <Label dir="down" label={`⬇️ ${options.down}`} active={activeDir === 'down'} />
                <Label dir="left" label={`⬅️ ${options.left}`} active={activeDir === 'left'} />
                <Label dir="right" label={`➡️ ${options.right}`} active={activeDir === 'right'} />
            </motion.div>
        </div>
    )
}
