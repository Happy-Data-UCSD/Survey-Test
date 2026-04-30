import { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, CircleAlert, ArrowLeft, ChevronLeft, ChevronRight, Send, Flame } from 'lucide-react'
import { NB } from '../styles/neobrutal'
import { SwipeCard } from '../components/GameModes/SwipeCard'
import { MultipleChoice } from '../components/GameModes/MultipleChoice'
import { LikertSlider } from '../components/GameModes/LikertSlider'
import { OpenEndedBox } from '../components/GameModes/OpenEndedBox'
import { MatrixGrid } from '../components/GameModes/MatrixGrid'
import { NPSStars } from '../components/GameModes/NPSStars'
import { SpatialTriage } from '../components/GameModes/SpatialTriage'
import { NodeConnection } from '../components/GameModes/NodeConnection'
import { ConfidenceAllocator } from '../components/GameModes/ConfidenceAllocator'
import { SurveyQuestion } from '../types/survey'
import { NeoBrutalFloatingBackground } from '../components/NeoBrutalFloatingBackground'
import { useGamifiedSound } from '../hooks/useGamifiedSound'
import neoLogo from '../assets/neologo.svg'
type SparkVec = { dx: number; dy: number; rotate: number; size: number }
const SPARK_VECTORS: SparkVec[] = [
    { dx: -22, dy: -24, rotate: -25, size: 12 },
    { dx: 0,   dy: -30, rotate: 0,   size: 14 },
    { dx: 22,  dy: -24, rotate: 25,  size: 12 },
    { dx: 18,  dy: -6,  rotate: 45,  size: 10 },
]

function FlameSparks({ burstKey }: { burstKey: number }) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (burstKey === 0) return
        setVisible(true)
        const t = setTimeout(() => setVisible(false), 750)
        return () => clearTimeout(t)
    }, [burstKey])

    if (!visible) return null

    return (
        <>
            {SPARK_VECTORS.map((v, i) => (
                <span
                    key={`${burstKey}-${i}`}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: -v.size / 2,
                        marginLeft: -v.size / 2,
                        pointerEvents: 'none',
                        // CSS custom props consumed by nb-spark-out
                        ['--dx' as never]: `${v.dx}px`,
                        ['--dy' as never]: `${v.dy}px`,
                        animation: 'nb-spark-out 0.7s ease-out forwards',
                        transform: `rotate(${v.rotate}deg)`,
                    }}
                >
                    <Flame size={v.size} fill="#FF6B35" color="#000" strokeWidth={2} />
                </span>
            ))}
        </>
    )
}

const DEMOGRAPHIC_QUESTIONS: SurveyQuestion[] = [
    {
        id: 0,
        type: 'open-ended',
        question: "What is your full name?"
    },
    {
        id: 1,
        type: 'multiple-choice',
        question: "What is your age range?",
        options: { up: "18-24", down: "45+", left: "25-34", right: "35-44" }
    },
    {
        id: 2,
        type: 'vanilla-multiple-choice',
        question: "What is your gender?",
        options: { up: "Male", down: "Female", left: "Non-binary", right: "Prefer not to say" }
    },
    {
        id: 3,
        type: 'spatial-triage',
        question: "What is your highest level of education?",
        options: { topLeft: "High School", topRight: "Bachelor's", bottomLeft: "Master's/PhD", bottomRight: "Other" }
    },
    {
        id: 4,
        type: 'node-connection',
        question: "What is your current employment status?",
        options: ["Full-time", "Part-time", "Student", "Self-employed", "Unemployed"]
    },
    {
        id: 5,
        type: 'likert',
        question: "I am satisfied with my current work-life balance.",
        options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
    },
    {
        id: 6,
        type: 'confidence-allocator',
        question: "How do you typically spend your free time?",
        options: ["Exercise/Sports", "Reading/Learning", "Socializing", "Entertainment"]
    },
    {
        id: 7,
        type: 'matrix',
        question: "How important are the following to you?",
        rows: ["Career Growth", "Family Time", "Financial Security", "Health"],
        columns: ["Not Important", "Somewhat Important", "Very Important"]
    },
    {
        id: 8,
        type: 'nps',
        question: "How satisfied are you with your current life situation?",
        scale: 10
    },
    {
        id: 9,
        type: 'open-ended',
        question: "What city or region do you currently live in?"
    }
]

export function TestSurvey({ neoBrutal = false }: { neoBrutal?: boolean }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [streak, setStreak] = useState(0)
    const [isDone, setIsDone] = useState(false)
    const [isOnSubmitPage, setIsOnSubmitPage] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [burstKey, setBurstKey] = useState(0)

    const { playCelebration, playSwipe, playTap, playSelect, playButton, playType } = useGamifiedSound()

    const goBack = useCallback(() => {
        if (currentIndex > 0) {
            playSwipe()
            setCurrentIndex(i => i - 1)
        }
    }, [currentIndex, playSwipe])

    const goForward = useCallback(() => {
        if (currentIndex < DEMOGRAPHIC_QUESTIONS.length - 1) {
            playSwipe()
            setCurrentIndex(i => i + 1)
        }
    }, [currentIndex, playSwipe])

    const handleAnswer = useCallback((answer: string | null) => {
        if (!answer) return

        const questionId = DEMOGRAPHIC_QUESTIONS[currentIndex].id
        const prior = answers[questionId]
        const hadPriorAnswer = prior !== undefined && prior !== ''

        setAnswers(prev => ({ ...prev, [questionId]: answer }))

        if (!hadPriorAnswer) {
            setStreak(s => s + 1)
            if (neoBrutal) {
                setBurstKey(k => k + 1)
                playCelebration()
            }
        }

        if (neoBrutal) {
            playSwipe()
        }

        setTimeout(() => {
            if (currentIndex < DEMOGRAPHIC_QUESTIONS.length - 1) {
                setCurrentIndex(i => i + 1)
            } else {
                setIsOnSubmitPage(true)
            }
        }, 300)
    }, [answers, currentIndex, neoBrutal, playCelebration, playSwipe])

    const handleSubmit = useCallback(() => {
        playButton()
        setIsSubmitting(true)
        const url = import.meta.env.VITE_GOOGLE_SHEETS_WEB_APP_URL
        if (url) {
            fetch(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(answers),
            }).finally(() => {
                setIsSubmitting(false)
                setIsOnSubmitPage(false)
                setIsDone(true)
            })
        } else {
            setTimeout(() => {
                setIsSubmitting(false)
                setIsOnSubmitPage(false)
                setIsDone(true)
            }, 1000)
        }
    }, [answers, playButton])

    const goBackFromSubmit = useCallback(() => {
        playSwipe()
        setIsOnSubmitPage(false)
    }, [playSwipe])

    const goToQuestionFromReview = useCallback((index: number) => {
        playSwipe()
        setCurrentIndex(index)
        setIsOnSubmitPage(false)
    }, [playSwipe])

    const currentQuestion = DEMOGRAPHIC_QUESTIONS[currentIndex]
    const currentAnswer = answers[currentQuestion.id]
    const questionCount = DEMOGRAPHIC_QUESTIONS.length
    /** Top bar: first-time answer momentum (not question position; that's in the bottom nav). */
    const momentumPercent = Math.min(100, (streak / questionCount) * 100)

    const shellBg = neoBrutal ? NB.pageBg : undefined
    const isSpatialTriage = currentQuestion.type === 'spatial-triage'
    const isConfidenceAllocator = currentQuestion.type === 'confidence-allocator'

    return (
        <>
            {neoBrutal ? (
                <header style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '0 14px',
                    borderBottom: `3px solid ${NB.black}`,
                    background: NB.pageBg,
                    zIndex: 20,
                    fontFamily: NB.font,
                }}>
                    <Link
                        to="/"
                        aria-label="Back"
                        style={{
                            border: NB.border,
                            borderRadius: 12,
                            background: '#fff',
                            boxShadow: NB.shadowSm,
                            width: 44,
                            height: 44,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none',
                            color: NB.black,
                            flexShrink: 0,
                        }}
                    >
                        <ArrowLeft size={22} strokeWidth={3} />
                    </Link>
                    <div
                        role="progressbar"
                        aria-valuenow={streak}
                        aria-valuemin={0}
                        aria-valuemax={questionCount}
                        aria-label="Answer momentum"
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            minWidth: 0,
                            minHeight: 40,
                            padding: '5px 8px 5px 7px',
                            borderRadius: 14,
                            border: NB.border,
                            background: '#fff',
                            boxShadow: NB.shadowSm,
                            boxSizing: 'border-box',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                flexShrink: 0,
                            }}
                            aria-hidden
                        >
                            <div
                                style={{
                                    position: 'relative',
                                    width: 28,
                                    height: 28,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <span
                                    key={`flame-${burstKey}`}
                                    style={{
                                        display: 'inline-flex',
                                        transformOrigin: 'center',
                                        animation: burstKey > 0 ? 'nb-flame-pop 0.55s ease-out' : undefined,
                                    }}
                                >
                                    <Flame size={22} fill="#FF6B35" color="#000" strokeWidth={2} />
                                </span>
                                <FlameSparks burstKey={burstKey} />
                            </div>
                            <span style={{
                                fontWeight: 900,
                                fontSize: '1rem',
                                color: NB.black,
                                minWidth: '2ch',
                                fontVariantNumeric: 'tabular-nums',
                            }}>{streak}</span>
                        </div>
                        <div
                            style={{
                                flex: 1,
                                height: 14,
                                borderRadius: 999,
                                background: NB.black,
                                padding: 3,
                                boxSizing: 'border-box',
                                minWidth: 0,
                            }}
                        >
                            <div style={{
                                height: '100%',
                                width: `${momentumPercent}%`,
                                borderRadius: 999,
                                background: 'linear-gradient(90deg, #FF9F43 0%, #FF6B35 42%, #E85D04 100%)',
                                transition: 'width 0.25s ease',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28)',
                            }} />
                        </div>
                    </div>
                </header>
            ) : (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                    borderBottom: '2px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    zIndex: 20,
                }}>
                    <Link
                        to="/"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--color-text-muted)',
                            textDecoration: 'none',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                        }}
                    >
                        <ArrowLeft size={18} />
                        Back
                    </Link>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <span style={{
                            fontSize: '0.9rem',
                            fontWeight: '700',
                            color: 'var(--color-text)',
                        }}>
                            Test Survey
                        </span>
                    </div>
                    <div style={{ width: '58px' }} />
                </div>
            )}

            <div style={{
                position: neoBrutal ? 'relative' : undefined,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
                minHeight: 0,
                paddingTop: '64px',
                background: shellBg,
                ...(neoBrutal ? { fontFamily: NB.font } : {}),
            }}>
                {neoBrutal ? <NeoBrutalFloatingBackground /> : null}
                <div
                    className={neoBrutal ? 'neo-brutal-on-bg' : undefined}
                    style={{
                    position: 'relative',
                    zIndex: neoBrutal ? 6 : undefined,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    flex: 1,
                    minHeight: 0,
                }}
                >
                {!isDone && !isOnSubmitPage ? (
                    <>
                        {neoBrutal && (
                            <div
                                className="test-survey-neo-logo-wrap"
                                style={isConfidenceAllocator ? { paddingTop: 6, paddingBottom: 10 } : undefined}
                            >
                                <img
                                    key={`logo-${burstKey}`}
                                    className="test-survey-neo-logo"
                                    src={neoLogo}
                                    alt="Neo"
                                    width={112}
                                    height={112}
                                    draggable={false}
                                    style={{
                                        width: isConfidenceAllocator ? 92 : undefined,
                                        height: isConfidenceAllocator ? 92 : undefined,
                                        animation: burstKey > 0
                                            ? 'nb-logo-burst 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                            : 'nb-logo-idle 2.8s ease-in-out infinite',
                                    }}
                                />
                            </div>
                        )}
                        <div className="test-survey-question-scroll">
                            <div
                                key={currentQuestion.id}
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: currentQuestion.type === 'confidence-allocator' ? 'flex-start' : 'center',
                                    ...(
                                        isSpatialTriage
                                        || currentQuestion.type === 'node-connection'
                                        || currentQuestion.type === 'confidence-allocator'
                                            ? { flex: 1, minHeight: 0, alignSelf: 'stretch' }
                                            : {}
                                    ),
                                }}
                            >
                                {currentQuestion.type === 'multiple-choice' && (
                                    <SwipeCard
                                        question={currentQuestion.question}
                                        options={currentQuestion.options}
                                        onAnswer={handleAnswer}
                                        onDragStart={playTap}
                                        selectedAnswer={currentAnswer}
                                        neoBrutal={neoBrutal}
                                    />
                                )}
                                {currentQuestion.type === 'vanilla-multiple-choice' && (
                                    <MultipleChoice
                                        question={currentQuestion.question}
                                        options={currentQuestion.options}
                                        onAnswer={handleAnswer}
                                        onInteraction={playSelect}
                                        selectedAnswer={currentAnswer}
                                        neoBrutal={neoBrutal}
                                    />
                                )}
                                {currentQuestion.type === 'likert' && (
                                    <LikertSlider
                                        question={currentQuestion.question}
                                        options={currentQuestion.options}
                                        onAnswer={handleAnswer}
                                        onInteraction={playSelect}
                                        selectedAnswer={currentAnswer}
                                        neoBrutal={neoBrutal}
                                    />
                                )}
                                {currentQuestion.type === 'nps' && (
                                    <NPSStars
                                        question={currentQuestion.question}
                                        scale={currentQuestion.scale}
                                        onAnswer={handleAnswer}
                                        onInteraction={playSelect}
                                        selectedAnswer={currentAnswer}
                                        neoBrutal={neoBrutal}
                                    />
                                )}
                                {currentQuestion.type === 'open-ended' && (
                                    <OpenEndedBox
                                        question={currentQuestion.question}
                                        onAnswer={handleAnswer}
                                        onInteraction={playButton}
                                        onFocus={playTap}
                                        onType={playType}
                                        selectedAnswer={currentAnswer}
                                        neoBrutal={neoBrutal}
                                    />
                                )}
                                {currentQuestion.type === 'matrix' && (
                                    <MatrixGrid
                                        question={currentQuestion.question}
                                        rows={currentQuestion.rows}
                                        columns={currentQuestion.columns}
                                        onAnswer={(answers) => handleAnswer(JSON.stringify(answers))}
                                        onInteraction={playSelect}
                                        selectedAnswer={currentAnswer}
                                        neoBrutal={neoBrutal}
                                    />
                                )}
                                {currentQuestion.type === 'spatial-triage' && (
                                    <div style={{ flex: 1, width: '100%', minHeight: 0, display: 'flex', alignSelf: 'stretch' }}>
                                        <SpatialTriage
                                            question={currentQuestion.question}
                                            options={currentQuestion.options}
                                            onAnswer={handleAnswer}
                                            selectedAnswer={currentAnswer}
                                            neoBrutal={neoBrutal}
                                        />
                                    </div>
                                )}
                                {currentQuestion.type === 'node-connection' && (
                                    <div
                                        style={{
                                            flex: 1,
                                            width: '100%',
                                            minHeight: 0,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <NodeConnection
                                            question={currentQuestion.question}
                                            options={currentQuestion.options}
                                            onAnswer={handleAnswer}
                                            onInteraction={playSelect}
                                            selectedAnswer={currentAnswer}
                                            neoBrutal={neoBrutal}
                                        />
                                    </div>
                                )}
                                {currentQuestion.type === 'confidence-allocator' && (
                                    <div
                                        style={{
                                            flex: 1,
                                            width: '100%',
                                            minHeight: 0,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignSelf: 'stretch',
                                            justifyContent: 'flex-start',
                                            paddingTop: 0,
                                        }}
                                    >
                                        <ConfidenceAllocator
                                            question={currentQuestion.question}
                                            options={currentQuestion.options}
                                            onAnswer={handleAnswer}
                                            onInteraction={playSelect}
                                            selectedAnswer={currentAnswer}
                                            neoBrutal={neoBrutal}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div
                            className="test-survey-bottom-nav"
                            style={{
                            flexShrink: 0,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '16px',
                            width: '100%',
                            minHeight: 72,
                            paddingTop: 8,
                            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
                        }}
                        >
                            <button
                                onClick={goBack}
                                disabled={currentIndex === 0}
                                style={neoBrutal ? {
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 52,
                                    height: 52,
                                    borderRadius: 14,
                                    border: NB.border,
                                    background: '#fff',
                                    boxShadow: currentIndex === 0 ? 'none' : NB.shadowSm,
                                    cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                                    opacity: currentIndex === 0 ? 0.4 : 1,
                                } : {
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    border: '2px solid var(--color-border)',
                                    background: 'white',
                                    cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                                    opacity: currentIndex === 0 ? 0.4 : 1,
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <ChevronLeft size={24} color={neoBrutal ? NB.black : 'var(--color-text-muted)'} strokeWidth={neoBrutal ? 3 : 2} />
                            </button>
                            <span style={{
                                fontSize: '0.85rem',
                                fontWeight: neoBrutal ? 900 : '700',
                                color: neoBrutal ? NB.black : 'var(--color-text-muted)',
                                minWidth: '72px',
                                textAlign: 'center',
                                fontFamily: neoBrutal ? NB.font : undefined,
                            }}>
                                {currentIndex + 1} / {DEMOGRAPHIC_QUESTIONS.length}
                            </span>
                            <button
                                onClick={goForward}
                                disabled={currentIndex === DEMOGRAPHIC_QUESTIONS.length - 1}
                                style={neoBrutal ? {
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 52,
                                    height: 52,
                                    borderRadius: 14,
                                    border: NB.border,
                                    background: '#fff',
                                    boxShadow: currentIndex === DEMOGRAPHIC_QUESTIONS.length - 1 ? 'none' : NB.shadowSm,
                                    cursor: currentIndex === DEMOGRAPHIC_QUESTIONS.length - 1 ? 'not-allowed' : 'pointer',
                                    opacity: currentIndex === DEMOGRAPHIC_QUESTIONS.length - 1 ? 0.4 : 1,
                                } : {
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    border: '2px solid var(--color-border)',
                                    background: 'white',
                                    cursor: currentIndex === DEMOGRAPHIC_QUESTIONS.length - 1 ? 'not-allowed' : 'pointer',
                                    opacity: currentIndex === DEMOGRAPHIC_QUESTIONS.length - 1 ? 0.4 : 1,
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <ChevronRight size={24} color={neoBrutal ? NB.black : 'var(--color-text-muted)'} strokeWidth={neoBrutal ? 3 : 2} />
                            </button>
                        </div>
                    </>
                ) : isOnSubmitPage ? (
                    <div style={{
                        flex: 1,
                        width: '100%',
                        minHeight: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <div className="animate-pop-in" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '24px',
                        padding: '40px 32px',
                        borderRadius: '22px',
                        ...(neoBrutal ? {
                            border: NB.border,
                            boxShadow: NB.shadow,
                            background: NB.cardBg,
                            fontFamily: NB.font,
                        } : {
                            border: '2px solid var(--color-border)',
                            borderBottom: '4px solid var(--color-border-dark)',
                            background: 'white',
                        }),
                        width: '400px',
                        maxWidth: 'calc(100% - 24px)',
                        maxHeight: 'min(78dvh, calc(100dvh - 64px - 96px - 24px))',
                        textAlign: 'center',
                    }}>
                        <div>
                            <p style={{
                                fontSize: '0.7rem',
                                fontWeight: '800',
                                color: neoBrutal ? NB.black : 'var(--color-text-muted)',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                marginBottom: '6px',
                            }}>
                                Ready to Submit
                            </p>
                            <p style={{
                                fontSize: '1.45rem',
                                fontWeight: '900',
                                color: neoBrutal ? NB.black : 'var(--color-text)',
                            }}>
                                Review Your Answers
                            </p>
                        </div>

                        <div style={{
                            width: '100%',
                            maxHeight: '360px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            padding: '4px',
                        }}>
                            {DEMOGRAPHIC_QUESTIONS.map((q, idx) => {
                                const answer = answers[q.id]
                                const isAnswered = Boolean(answer)
                                const renderAnswer = () => {
                                    if (!answer) {
                                        return (
                                            <span style={{ fontStyle: 'italic', color: neoBrutal ? 'rgba(0,0,0,0.45)' : 'var(--color-text-muted)', fontWeight: 500 }}>
                                                Tap to answer
                                            </span>
                                        )
                                    }
                                    if (q.type === 'matrix' || q.type === 'confidence-allocator') {
                                        try {
                                            const parsed = JSON.parse(answer)
                                            return (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    {Object.entries(parsed).map(([key, value]) => (
                                                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                                                            <span style={{ color: neoBrutal ? NB.black : 'var(--color-text)' }}>{key}:</span>
                                                            <span style={{ color: neoBrutal ? NB.green : 'var(--color-primary)' }}>
                                                                {q.type === 'confidence-allocator' ? `${value}%` : String(value)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        } catch {
                                            return answer
                                        }
                                    }
                                    if ((q.type === 'multiple-choice' || q.type === 'vanilla-multiple-choice') && q.options) {
                                        const opts = q.options as Record<string, string>
                                        return opts[answer] || answer
                                    }
                                    if (q.type === 'spatial-triage' && q.options) {
                                        const opts = q.options as Record<string, string>
                                        return opts[answer] || answer
                                    }
                                    return answer
                                }
                                return (
                                    <button
                                        type="button"
                                        key={q.id}
                                        onClick={() => goToQuestionFromReview(idx)}
                                        style={{
                                            textAlign: 'left',
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            font: 'inherit',
                                            background: neoBrutal
                                                ? (isAnswered ? '#fff' : '#fff8f0')
                                                : (isAnswered ? 'var(--color-surface)' : 'rgba(251, 191, 36, 0.12)'),
                                            border: neoBrutal
                                                ? `2px solid ${isAnswered ? NB.black : '#d97706'}`
                                                : `1px solid ${isAnswered ? 'var(--color-border)' : 'rgba(217, 119, 6, 0.45)'}`,
                                            boxShadow: neoBrutal ? NB.shadowSm : undefined,
                                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                            <span style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden>
                                                {isAnswered ? (
                                                    <CheckCircle
                                                        size={18}
                                                        color={neoBrutal ? NB.green : 'var(--color-primary)'}
                                                        strokeWidth={neoBrutal ? 2.5 : 2}
                                                    />
                                                ) : (
                                                    <CircleAlert
                                                        size={18}
                                                        color={neoBrutal ? '#d97706' : '#d97706'}
                                                        strokeWidth={neoBrutal ? 2.5 : 2}
                                                    />
                                                )}
                                            </span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: '800',
                                                    color: neoBrutal ? NB.black : 'var(--color-text-muted)',
                                                    marginBottom: '4px',
                                                }}>
                                                    Q{idx + 1}{isAnswered ? '' : ' · Skipped'}
                                                </p>
                                                <p style={{
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    color: neoBrutal ? NB.black : 'var(--color-text)',
                                                    marginBottom: '6px',
                                                    lineHeight: '1.3',
                                                }}>
                                                    {q.question}
                                                </p>
                                                <div style={{
                                                    fontSize: '0.8rem',
                                                    color: neoBrutal ? NB.green : 'var(--color-primary)',
                                                    fontWeight: '600',
                                                }}>
                                                    {renderAnswer()}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            width: '100%',
                            marginTop: '4px',
                        }}>
                            <button
                                onClick={goBackFromSubmit}
                                style={neoBrutal ? {
                                    flex: 1,
                                    padding: '14px 20px',
                                    borderRadius: '14px',
                                    border: NB.border,
                                    background: '#fff',
                                    boxShadow: NB.shadowSm,
                                    fontSize: '0.85rem',
                                    fontFamily: NB.font,
                                    fontWeight: 800,
                                    color: NB.black,
                                    cursor: 'pointer',
                                } : {
                                    flex: 1,
                                    padding: '14px 20px',
                                    borderRadius: '12px',
                                    border: '2px solid var(--color-border)',
                                    background: 'white',
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    color: 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                Go Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={neoBrutal ? undefined : 'btn-primary'}
                                style={neoBrutal ? {
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    opacity: isSubmitting ? 0.7 : 1,
                                    padding: '14px 20px',
                                    borderRadius: '14px',
                                    border: NB.border,
                                    background: NB.yellow,
                                    boxShadow: NB.shadow,
                                    fontFamily: NB.font,
                                    fontWeight: 900,
                                    color: NB.black,
                                    cursor: 'pointer',
                                } : {
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    opacity: isSubmitting ? 0.7 : 1,
                                }}
                            >
                                {isSubmitting ? (
                                    'Submitting...'
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Submit
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    </div>
                ) : (
                    <div style={{
                        flex: 1,
                        width: '100%',
                        minHeight: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <div className="animate-pop-in" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '36px 28px',
                        borderRadius: '20px',
                        ...(neoBrutal ? {
                            border: NB.border,
                            boxShadow: NB.shadow,
                            background: NB.cardBg,
                            fontFamily: NB.font,
                        } : {
                            border: '2px solid var(--color-border)',
                            borderBottom: '4px solid var(--color-border-dark)',
                            background: 'white',
                        }),
                        width: '300px',
                        textAlign: 'center',
                    }}>
                        <CheckCircle size={52} color={neoBrutal ? NB.green : 'var(--color-primary)'} strokeWidth={neoBrutal ? 2.5 : 1.5} />
                        <div>
                            <p style={{
                                fontSize: '0.65rem',
                                fontWeight: '800',
                                color: neoBrutal ? NB.black : 'var(--color-text-muted)',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                marginBottom: '4px',
                            }}>
                                Survey Complete
                            </p>
                            <p style={{
                                fontSize: '1.4rem',
                                fontWeight: '900',
                                color: neoBrutal ? NB.black : 'var(--color-text)',
                            }}>
                                Thank you for your response!
                            </p>
                        </div>
                        <Link
                            to="/"
                            className={neoBrutal ? undefined : 'btn-primary'}
                            style={neoBrutal ? {
                                marginTop: '8px',
                                width: '100%',
                                textDecoration: 'none',
                                textAlign: 'center',
                                padding: '14px 20px',
                                borderRadius: '14px',
                                border: NB.border,
                                background: NB.yellow,
                                boxShadow: NB.shadow,
                                fontFamily: NB.font,
                                fontWeight: 900,
                                color: NB.black,
                            } : { marginTop: '8px', width: '100%', textDecoration: 'none', textAlign: 'center', color: 'white' }}
                        >
                            Back to Surveys
                        </Link>
                    </div>
                    </div>
                )}
                </div>
            </div>
        </>
    )
}
