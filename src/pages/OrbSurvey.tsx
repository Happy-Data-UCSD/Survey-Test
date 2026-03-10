import { useState, useCallback } from 'react'
import { CheckCircle } from 'lucide-react'
import { ProgressBar } from '../components/ProgressBar'
import { Companion3D } from '../components/Companion3D'
import { SwipeCard } from '../components/GameModes/SwipeCard'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { useGamifiedSound } from '../hooks/useGamifiedSound'

const SURVEY_QUESTIONS = [
    {
        id: 1,
        question: "How do you feel about our new branding?",
        options: { up: "Love it!", down: "Hate it", left: "Needs work", right: "It's okay" }
    },
    {
        id: 2,
        question: "Which feature would you use most?",
        options: { up: "AI Generation", down: "Templates", left: "Drag & Drop", right: "Analytics" }
    },
    {
        id: 3,
        question: "How often do you create surveys?",
        options: { up: "Daily", down: "Rarely", left: "Weekly", right: "Monthly" }
    },
    {
        id: 4,
        question: "Would you recommend Happy Data?",
        options: { up: "Absolutely", down: "Never", left: "Maybe", right: "Likely" }
    }
]

export function OrbSurvey() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [streak, setStreak] = useState(0)
    const [reaction, setReaction] = useState<'idle' | 'happy'>('idle')
    const [isDone, setIsDone] = useState(false)

    const { playInteraction, playSuccess, playWhoosh } = useGamifiedSound()

    const handleDragStart = useCallback(() => {
        playInteraction()
    }, [playInteraction])

    const handleAnswer = useCallback((_answer: string) => {

        playWhoosh()
        setStreak(s => s + 1)
        setReaction('happy')

        setTimeout(() => {
            setReaction('idle')
            if (currentIndex < SURVEY_QUESTIONS.length - 1) {
                setCurrentIndex(i => i + 1)
            } else {
                setIsDone(true)
                playSuccess()
            }
        }, 600)
    }, [currentIndex, playWhoosh, playSuccess])

    const currentQuestion = SURVEY_QUESTIONS[currentIndex]

    return (
        <>
            <AnimatedBackground isActive={reaction === 'happy'} />

            <ProgressBar
                current={isDone ? SURVEY_QUESTIONS.length : currentIndex}
                total={SURVEY_QUESTIONS.length}
                streak={streak}
            />

            <div style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
                paddingTop: '64px',
            }}>
                <div style={{ marginBottom: '16px' }}>
                    <Companion3D reaction={reaction} />
                </div>

                {!isDone ? (
                    <SwipeCard
                        key={currentQuestion.id}
                        question={currentQuestion.question}
                        options={currentQuestion.options}
                        onAnswer={handleAnswer}
                        onDragStart={handleDragStart}
                    />
                ) : (
                    <div className="animate-pop-in" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '36px 28px',
                        borderRadius: '20px',
                        border: '2px solid var(--color-border)',
                        borderBottom: '4px solid var(--color-border-dark)',
                        background: 'white',
                        width: '300px',
                        textAlign: 'center',
                    }}>
                        <CheckCircle size={52} color="var(--color-primary)" strokeWidth={1.5} />
                        <div>
                            <p style={{
                                fontSize: '0.65rem',
                                fontWeight: '700',
                                color: 'var(--color-text-muted)',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                marginBottom: '4px',
                            }}>
                                Survey Complete
                            </p>
                            <p style={{
                                fontSize: '1.4rem',
                                fontWeight: '900',
                                color: 'var(--color-text)',
                            }}>
                                {streak} question streak
                            </p>
                        </div>
                        <button
                            className="btn-primary"
                            style={{ marginTop: '8px', width: '100%' }}
                            onClick={() => {
                                setCurrentIndex(0)
                                setStreak(0)
                                setIsDone(false)
                                setReaction('idle')
                            }}
                        >
                            Start Over
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}
