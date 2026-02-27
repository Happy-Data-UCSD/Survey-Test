import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { AnimatedBackground } from './AnimatedBackground'
import { useGamifiedSound } from '../hooks/useGamifiedSound'
import { Copy, Check } from 'lucide-react'
import type { ArenaItem, MatchupLog } from '../types/arena'

const DEFAULT_ITEMS: ArenaItem[] = [
    { id: '1', label: 'AI Generation', description: 'Create content with AI assistance' },
    { id: '2', label: 'Templates', description: 'Pre-built designs to start fast' },
    { id: '3', label: 'Drag & Drop', description: 'Build flows by dragging blocks' },
    { id: '4', label: 'Analytics', description: 'Track responses and insights' },
    { id: '5', label: 'Integrations', description: 'Connect to your tools' },
    { id: '6', label: 'Collaboration', description: 'Work together in real time' },
    { id: '7', label: 'Custom Branding', description: 'Match your brand identity' },
    { id: '8', label: 'Mobile-First', description: 'Optimized for small screens' },
]

function shuffle<T>(arr: T[]): T[] {
    const out = [...arr]
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]]
    }
    return out
}

const ADVANCE_DELAY = 700
const ORB_LANE_WIDTH = 48

export function ArenaDuelSurvey({ items = DEFAULT_ITEMS }: { items?: ArenaItem[] }) {
    const { playInteraction, playWhoosh, playSuccess } = useGamifiedSound()

    const [round, setRound] = useState(0)
    const [bracket, setBracket] = useState<ArenaItem[][]>(() => [shuffle(items)])
    const [matchupIndex, setMatchupIndex] = useState(0)
    const [matchupLog, setMatchupLog] = useState<MatchupLog[]>([])
    const [chosenSide, setChosenSide] = useState<'left' | 'right' | null>(null)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [isComplete, setIsComplete] = useState(false)
    const [champion, setChampion] = useState<ArenaItem | null>(null)
    const [runnerUp, setRunnerUp] = useState<ArenaItem | null>(null)
    const [pairKey, setPairKey] = useState(0)

    const currentRoundItems = bracket[round] ?? []
    const pair = useMemo(() => {
        const i = matchupIndex * 2
        const left = currentRoundItems[i]
        const right = currentRoundItems[i + 1]
        return left && right ? { left, right } : null
    }, [currentRoundItems, matchupIndex])

    const totalMatchupsInRound = Math.floor(currentRoundItems.length / 2)
    const totalMatchups = useMemo(() => {
        let total = 0
        let n = items.length
        while (n > 1) {
            total += Math.floor(n / 2)
            n = Math.ceil(n / 2)
        }
        return total
    }, [items.length])
    const completedMatchups = matchupLog.length

    const advance = useCallback((updatedLog: MatchupLog[]) => {
        const nextIndex = matchupIndex + 1
        const pairsInRound = Math.floor(currentRoundItems.length / 2)

        if (nextIndex < pairsInRound) {
            setMatchupIndex(nextIndex)
            setChosenSide(null)
            setIsTransitioning(false)
            setPairKey(k => k + 1)
            return
        }

        const newWinners: ArenaItem[] = []
        for (let i = 0; i < currentRoundItems.length; i += 2) {
            const l = currentRoundItems[i]
            const r = currentRoundItems[i + 1]
            if (l && r) {
                const entry = updatedLog.find(
                    m => (m.leftId === l.id && m.rightId === r.id) ||
                         (m.leftId === r.id && m.rightId === l.id)
                )
                if (entry) {
                    newWinners.push(l.id === entry.winnerId ? l : r)
                }
            }
        }

        if (newWinners.length === 1) {
            setChampion(newWinners[0])
            const lastEntry = updatedLog[updatedLog.length - 1]!
            const loserItem = lastEntry.leftId === newWinners[0].id
                ? currentRoundItems.find(c => c.id === lastEntry.rightId)
                : currentRoundItems.find(c => c.id === lastEntry.leftId)
            setRunnerUp(loserItem ?? null)
            setIsComplete(true)
            playSuccess()
        } else {
            setBracket(prev => [...prev, newWinners])
            setRound(r => r + 1)
            setMatchupIndex(0)
            setChosenSide(null)
            setIsTransitioning(false)
            setPairKey(k => k + 1)
        }
    }, [matchupIndex, currentRoundItems, playSuccess])

    const handleChoose = useCallback((side: 'left' | 'right') => {
        if (!pair || chosenSide || isTransitioning) return
        playInteraction()

        const loserSide = side === 'left' ? 'right' : 'left'
        const winner = side === 'left' ? pair.left : pair.right
        const loser = loserSide === 'left' ? pair.left : pair.right

        setChosenSide(side)
        setIsTransitioning(true)

        const logEntry: MatchupLog = {
            round: round + 1,
            leftId: pair.left.id,
            rightId: pair.right.id,
            winnerId: winner.id,
            eliminatedId: loser.id,
            timestamp: Date.now(),
        }
        const updatedLog = [...matchupLog, logEntry]
        setMatchupLog(updatedLog)

        setTimeout(() => playWhoosh(), 100)
        setTimeout(() => advance(updatedLog), ADVANCE_DELAY)
    }, [pair, chosenSide, isTransitioning, round, matchupLog, playInteraction, playWhoosh, advance])

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (chosenSide || isTransitioning || !pair) return
            if (e.key === 'ArrowLeft' || e.key === '1') handleChoose('left')
            if (e.key === 'ArrowRight' || e.key === '2') handleChoose('right')
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [chosenSide, isTransitioning, pair, handleChoose])

    const restart = useCallback(() => {
        setBracket([shuffle(items)])
        setRound(0)
        setMatchupIndex(0)
        setMatchupLog([])
        setChosenSide(null)
        setIsTransitioning(false)
        setIsComplete(false)
        setChampion(null)
        setRunnerUp(null)
        setPairKey(0)
    }, [items])

    return (
        <>
            <AnimatedBackground isActive={false} />
            <div style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
            }}>
                <AnimatePresence mode="wait">
                    {!isComplete ? (
                        <motion.div
                            key="arena"
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                width: '100%',
                            }}
                        >
                            {/* ── Top HUD ── */}
                            <div style={{
                                padding: '12px 16px 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                flexShrink: 0,
                            }}>
                                <div style={{
                                    flex: 1,
                                    height: '6px',
                                    backgroundColor: 'var(--color-border)',
                                    borderRadius: '3px',
                                    overflow: 'hidden',
                                }}>
                                    <motion.div
                                        animate={{ width: `${(completedMatchups / totalMatchups) * 100}%` }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        style={{
                                            height: '100%',
                                            backgroundColor: 'var(--color-primary)',
                                            borderRadius: '3px',
                                        }}
                                    />
                                </div>
                                <span style={{
                                    fontSize: '0.68rem',
                                    fontWeight: '800',
                                    color: 'var(--color-text-muted)',
                                    whiteSpace: 'nowrap',
                                }}>
                                    Round {round + 1} · {matchupIndex + 1}/{totalMatchupsInRound || 1}
                                </span>
                            </div>

                            {/* ── Arena area ── */}
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0 16px 32px',
                                gap: '18px',
                            }}>
                                {/* Compact header */}
                                <p style={{
                                    fontSize: '0.65rem',
                                    fontWeight: '800',
                                    color: 'var(--color-text-muted)',
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    textAlign: 'center',
                                }}>
                                    Tap to choose
                                </p>

                                {/* Card pair with orb lane */}
                                <div style={{
                                    width: '100%',
                                    maxWidth: '420px',
                                    position: 'relative',
                                }}>
                                    <AnimatePresence mode="wait">
                                        {pair && (
                                            <motion.div
                                                key={pairKey}
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -12 }}
                                                transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: `1fr ${ORB_LANE_WIDTH}px 1fr`,
                                                    alignItems: 'stretch',
                                                    width: '100%',
                                                }}
                                            >
                                                <ChoiceCard
                                                    item={pair.left}
                                                    side="left"
                                                    chosenSide={chosenSide}
                                                    disabled={isTransitioning}
                                                    onChoose={() => handleChoose('left')}
                                                />

                                                {/* Center lane — orb lives here */}
                                                <div style={{
                                                    position: 'relative',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    <DashOrb chosenSide={chosenSide} />
                                                </div>

                                                <ChoiceCard
                                                    item={pair.right}
                                                    side="right"
                                                    chosenSide={chosenSide}
                                                    disabled={isTransitioning}
                                                    onChoose={() => handleChoose('right')}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Subtext */}
                                <p style={{
                                    fontSize: '0.58rem',
                                    fontWeight: '600',
                                    color: 'var(--color-text-muted)',
                                    opacity: 0.55,
                                    textAlign: 'center',
                                }}>
                                    Tap the feature you prefer
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <ChampionScreen
                            key="champion"
                            champion={champion!}
                            runnerUp={runnerUp}
                            matchupLog={matchupLog}
                            onRestart={restart}
                        />
                    )}
                </AnimatePresence>
            </div>
        </>
    )
}

/* ── Mini Orb (2D replica of Companion3D mascot) ── */

function MiniOrbCharacter({ happy }: { happy: boolean }) {
    const bg = happy ? '#7AC70C' : '#FCAC18'
    const shadow = happy ? 'rgba(88, 204, 2, 0.4)' : 'rgba(252, 172, 24, 0.35)'

    return (
        <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: `radial-gradient(circle at 38% 35%, ${happy ? '#a4e65c' : '#ffd966'} 0%, ${bg} 60%, ${happy ? '#46a302' : '#E28900'} 100%)`,
            boxShadow: `0 0 14px ${shadow}, inset 0 -3px 6px rgba(0,0,0,0.12), inset 0 2px 3px rgba(255,255,255,0.25)`,
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Left eye */}
            <div style={{
                position: 'absolute',
                top: '34%',
                left: '26%',
                width: '22%',
                height: '22%',
                borderRadius: '50%',
                background: 'white',
                boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
            }}>
                <div style={{
                    position: 'absolute',
                    top: '28%',
                    left: '32%',
                    width: '40%',
                    height: '40%',
                    borderRadius: '50%',
                    background: '#1C1C1E',
                }} />
            </div>
            {/* Right eye */}
            <div style={{
                position: 'absolute',
                top: '34%',
                right: '26%',
                width: '22%',
                height: '22%',
                borderRadius: '50%',
                background: 'white',
                boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
            }}>
                <div style={{
                    position: 'absolute',
                    top: '28%',
                    left: '32%',
                    width: '40%',
                    height: '40%',
                    borderRadius: '50%',
                    background: '#1C1C1E',
                }} />
            </div>
            {/* Highlight */}
            <div style={{
                position: 'absolute',
                top: '12%',
                left: '22%',
                width: '24%',
                height: '18%',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.35)',
                filter: 'blur(2px)',
            }} />
        </div>
    )
}

/* ── Dash Orb with character ── */

const ORB_SIZE = 40

function DashOrb({ chosenSide }: { chosenSide: 'left' | 'right' | null }) {
    const rawX = useMotionValue(0)
    const x = useSpring(rawX, { stiffness: 550, damping: 20, mass: 0.45 })
    const rawScale = useMotionValue(1)
    const scale = useSpring(rawScale, { stiffness: 500, damping: 18 })
    const rawRotate = useMotionValue(0)
    const rotate = useSpring(rawRotate, { stiffness: 400, damping: 16 })

    useEffect(() => {
        if (!chosenSide) {
            rawX.set(0)
            rawScale.set(1)
            rawRotate.set(0)
            return
        }

        const dashDist = chosenSide === 'left' ? -58 : 58
        rawX.set(dashDist)
        rawScale.set(1.2)
        rawRotate.set(chosenSide === 'left' ? -15 : 15)

        const bounce = setTimeout(() => {
            rawScale.set(0.88)
            rawRotate.set(chosenSide === 'left' ? 5 : -5)
        }, 150)

        const ret = setTimeout(() => {
            rawX.set(0)
            rawScale.set(1)
            rawRotate.set(0)
        }, 300)

        return () => {
            clearTimeout(bounce)
            clearTimeout(ret)
        }
    }, [chosenSide, rawX, rawScale, rawRotate])

    return (
        <motion.div
            style={{
                x,
                scale,
                rotate,
                width: ORB_SIZE,
                height: ORB_SIZE,
                zIndex: 10,
                pointerEvents: 'none',
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
            }}
        >
            <MiniOrbCharacter happy={chosenSide !== null} />
        </motion.div>
    )
}

/* ── Choice Card ── */

const loserVariants = {
    idle: { scale: 1, rotate: 0, opacity: 1, filter: 'blur(0px)' },
    loserLeft: {
        scale: 0.85,
        rotate: -3,
        opacity: 0,
        filter: 'blur(3px)',
        transition: { duration: 0.24, ease: 'easeIn' },
    },
    loserRight: {
        scale: 0.85,
        rotate: 3,
        opacity: 0,
        filter: 'blur(3px)',
        transition: { duration: 0.24, ease: 'easeIn' },
    },
}

const winnerVariants = {
    idle: { scale: 1 },
    chosen: {
        scale: [1, 1.05, 1.0],
        transition: {
            scale: { duration: 0.26, times: [0, 0.45, 1], ease: 'easeOut' },
        },
    },
}

interface ChoiceCardProps {
    item: ArenaItem
    side: 'left' | 'right'
    chosenSide: 'left' | 'right' | null
    disabled: boolean
    onChoose: () => void
}

function ChoiceCard({ item, side, chosenSide, disabled, onChoose }: ChoiceCardProps) {
    const isWinner = chosenSide === side
    const isLoser = chosenSide !== null && chosenSide !== side
    const [showRipple, setShowRipple] = useState(false)

    useEffect(() => {
        if (isWinner) {
            setShowRipple(true)
            const t = setTimeout(() => setShowRipple(false), 350)
            return () => clearTimeout(t)
        }
    }, [isWinner])

    const animateState = isLoser
        ? (side === 'left' ? 'loserLeft' : 'loserRight')
        : isWinner
            ? 'chosen'
            : 'idle'

    const idle = !chosenSide && !disabled

    return (
        <motion.div
            variants={isLoser ? loserVariants : winnerVariants}
            initial="idle"
            animate={animateState}
            onClick={() => { if (idle) onChoose() }}
            role="button"
            tabIndex={0}
            aria-label={`Choose ${item.label}`}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    if (idle) onChoose()
                }
            }}
            style={{
                position: 'relative',
                minHeight: '150px',
                background: 'white',
                borderRadius: '16px',
                border: `2px solid ${isWinner ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderBottom: `4px solid ${isWinner ? 'var(--color-primary-dark)' : 'var(--color-border-dark)'}`,
                padding: '16px 14px 14px',
                cursor: idle ? 'pointer' : 'default',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                overflow: 'hidden',
                userSelect: 'none',
                boxShadow: isWinner
                    ? '0 0 24px rgba(88, 204, 2, 0.25)'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                outline: 'none',
            }}
            whileHover={idle ? {
                scale: 1.025,
                borderColor: 'var(--color-primary-light)',
                boxShadow: '0 4px 20px rgba(88, 204, 2, 0.15)',
            } : undefined}
            whileTap={idle ? { scale: 0.97 } : undefined}
            whileFocus={idle ? {
                borderColor: 'var(--color-primary-light)',
                boxShadow: '0 0 0 3px rgba(88, 204, 2, 0.2)',
            } : undefined}
        >
            {/* Ripple on winner card */}
            <AnimatePresence>
                {showRipple && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0.3 }}
                        animate={{ scale: 3.5, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '50px',
                            height: '50px',
                            marginTop: '-25px',
                            marginLeft: '-25px',
                            borderRadius: '50%',
                            background: 'var(--color-primary-light)',
                            pointerEvents: 'none',
                            zIndex: 2,
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Glow ring on winner */}
            {isWinner && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: [0, 0.5, 0.25], scale: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        position: 'absolute',
                        inset: -3,
                        borderRadius: '19px',
                        border: '2px solid var(--color-primary)',
                        boxShadow: '0 0 18px rgba(88, 204, 2, 0.3)',
                        pointerEvents: 'none',
                    }}
                />
            )}

            <h3 style={{
                fontSize: '0.95rem',
                fontWeight: '800',
                color: 'var(--color-text)',
                lineHeight: 1.3,
            }}>
                {item.label}
            </h3>
            <p style={{
                fontSize: '0.68rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.45,
                flex: 1,
            }}>
                {item.description}
            </p>
        </motion.div>
    )
}

/* ── Champion Screen ── */

interface ChampionScreenProps {
    champion: ArenaItem
    runnerUp: ArenaItem | null
    matchupLog: MatchupLog[]
    onRestart: () => void
}

function ChampionScreen({ champion, runnerUp, matchupLog, onRestart }: ChampionScreenProps) {
    const [copied, setCopied] = useState(false)

    const copyResults = useCallback(() => {
        const data = JSON.stringify({ champion, runnerUp, matchupLog }, null, 2)
        navigator.clipboard.writeText(data).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }, [champion, runnerUp, matchupLog])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                flex: 1,
                padding: '0 16px',
                gap: '20px',
            }}
        >
            {/* Orb celebration */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 18 }}
                style={{ width: 56, height: 56 }}
            >
                <MiniOrbCharacter happy />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '28px 24px',
                    borderRadius: '20px',
                    border: '2px solid var(--color-primary)',
                    borderBottom: '4px solid var(--color-primary-dark)',
                    background: 'white',
                    width: '100%',
                    maxWidth: '320px',
                    textAlign: 'center',
                    boxShadow: '0 0 40px rgba(88, 204, 2, 0.2), 0 8px 32px rgba(0,0,0,0.08)',
                }}
            >
                <motion.span
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.3 }}
                    style={{
                        fontSize: '0.6rem',
                        fontWeight: '700',
                        color: 'var(--color-text-muted)',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                    }}
                >
                    Champion Priority
                </motion.span>
                <motion.h2
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.45, type: 'spring', stiffness: 300, damping: 20 }}
                    style={{
                        fontSize: '1.45rem',
                        fontWeight: '900',
                        color: 'var(--color-primary)',
                    }}
                >
                    {champion.label}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}
                >
                    {champion.description}
                </motion.p>

                {runnerUp && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.65 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}
                    >
                        <span style={{
                            fontSize: '0.55rem',
                            fontWeight: '700',
                            color: 'var(--color-text-muted)',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                        }}>
                            Runner-up
                        </span>
                        <span style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--color-text)' }}>
                            {runnerUp.label}
                        </span>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.75 }}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        width: '100%',
                        marginTop: '6px',
                    }}
                >
                    <button className="btn-primary" style={{ width: '100%' }} onClick={onRestart}>
                        Restart
                    </button>
                    <button
                        onClick={copyResults}
                        style={{
                            background: 'none',
                            border: '2px solid var(--color-border)',
                            borderBottom: '3px solid var(--color-border-dark)',
                            borderRadius: 'var(--radius-md)',
                            padding: '10px 16px',
                            fontFamily: 'inherit',
                            fontWeight: '700',
                            fontSize: '0.75rem',
                            color: copied ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'color 0.2s',
                        }}
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy JSON Results'}
                    </button>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}
