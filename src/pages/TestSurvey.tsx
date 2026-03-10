import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, ArrowLeft, ChevronLeft, ChevronRight, Send } from 'lucide-react'
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

export function TestSurvey() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [_streak, setStreak] = useState(0)
    const [isDone, setIsDone] = useState(false)
    const [isOnSubmitPage, setIsOnSubmitPage] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [answers, setAnswers] = useState<Record<number, string>>({})

    const goBack = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(i => i - 1)
        }
    }, [currentIndex])

    const goForward = useCallback(() => {
        if (currentIndex < DEMOGRAPHIC_QUESTIONS.length - 1) {
            setCurrentIndex(i => i + 1)
        }
    }, [currentIndex])

    const handleAnswer = useCallback((answer: string | null) => {
        if (!answer) return

        const questionId = DEMOGRAPHIC_QUESTIONS[currentIndex].id
        setAnswers(prev => ({ ...prev, [questionId]: answer }))
        setStreak(s => s + 1)

        setTimeout(() => {
            if (currentIndex < DEMOGRAPHIC_QUESTIONS.length - 1) {
                setCurrentIndex(i => i + 1)
            } else {
                setIsOnSubmitPage(true)
            }
        }, 300)
    }, [currentIndex])

    const handleSubmit = useCallback(() => {
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
    }, [answers])

    const goBackFromSubmit = useCallback(() => {
        setIsOnSubmitPage(false)
    }, [])

    const currentQuestion = DEMOGRAPHIC_QUESTIONS[currentIndex]
    const currentAnswer = answers[currentQuestion.id]

    return (
        <>
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

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
                paddingTop: '64px',
                paddingBottom: '80px',
            }}>
                {!isDone && !isOnSubmitPage ? (
                    <>
                        <div
                            key={currentQuestion.id}
                            style={
                                currentQuestion.type === 'spatial-triage'
                                    ? { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', width: '100%', alignSelf: 'stretch' }
                                    : undefined
                            }
                        >
                            {currentQuestion.type === 'multiple-choice' && (
                                <SwipeCard
                                    question={currentQuestion.question}
                                    options={currentQuestion.options}
                                    onAnswer={handleAnswer}
                                    onDragStart={() => {}}
                                    selectedAnswer={currentAnswer}
                                />
                            )}
                            {currentQuestion.type === 'vanilla-multiple-choice' && (
                                <MultipleChoice
                                    question={currentQuestion.question}
                                    options={currentQuestion.options}
                                    onAnswer={handleAnswer}
                                    onInteraction={() => {}}
                                    selectedAnswer={currentAnswer}
                                />
                            )}
                            {currentQuestion.type === 'likert' && (
                                <LikertSlider
                                    question={currentQuestion.question}
                                    options={currentQuestion.options}
                                    onAnswer={handleAnswer}
                                    onInteraction={() => {}}
                                    selectedAnswer={currentAnswer}
                                />
                            )}
                            {currentQuestion.type === 'nps' && (
                                <NPSStars
                                    question={currentQuestion.question}
                                    scale={currentQuestion.scale}
                                    onAnswer={handleAnswer}
                                    onInteraction={() => {}}
                                    selectedAnswer={currentAnswer}
                                />
                            )}
                            {currentQuestion.type === 'open-ended' && (
                                <OpenEndedBox
                                    question={currentQuestion.question}
                                    onAnswer={handleAnswer}
                                    onInteraction={() => {}}
                                    selectedAnswer={currentAnswer}
                                />
                            )}
                            {currentQuestion.type === 'matrix' && (
                                <MatrixGrid
                                    question={currentQuestion.question}
                                    rows={currentQuestion.rows}
                                    columns={currentQuestion.columns}
                                    onAnswer={(answers) => handleAnswer(JSON.stringify(answers))}
                                    onInteraction={() => {}}
                                    selectedAnswer={currentAnswer}
                                />
                            )}
                            {currentQuestion.type === 'spatial-triage' && (
                                <div style={{ flex: 1, width: '100%', minHeight: 0, display: 'flex', alignSelf: 'stretch' }}>
                                    <SpatialTriage
                                        question={currentQuestion.question}
                                        options={currentQuestion.options}
                                        onAnswer={handleAnswer}
                                        onDragStart={() => {}}
                                        selectedAnswer={currentAnswer}
                                    />
                                </div>
                            )}
                            {currentQuestion.type === 'node-connection' && (
                                <NodeConnection
                                    question={currentQuestion.question}
                                    options={currentQuestion.options}
                                    onAnswer={handleAnswer}
                                    onInteraction={() => {}}
                                    selectedAnswer={currentAnswer}
                                />
                            )}
                            {currentQuestion.type === 'confidence-allocator' && (
                                <ConfidenceAllocator
                                    question={currentQuestion.question}
                                    options={currentQuestion.options}
                                    onAnswer={handleAnswer}
                                    onInteraction={() => {}}
                                    selectedAnswer={currentAnswer}
                                />
                            )}
                        </div>

                        <div style={{
                            position: 'absolute',
                            bottom: 24,
                            left: 0,
                            right: 0,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '16px',
                        }}>
                            <button
                                onClick={goBack}
                                disabled={currentIndex === 0}
                                style={{
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
                                <ChevronLeft size={24} color="var(--color-text-muted)" />
                            </button>
                            <span style={{
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                color: 'var(--color-text-muted)',
                                minWidth: '60px',
                                textAlign: 'center',
                            }}>
                                {currentIndex + 1} / {DEMOGRAPHIC_QUESTIONS.length}
                            </span>
                            <button
                                onClick={goForward}
                                disabled={currentIndex === DEMOGRAPHIC_QUESTIONS.length - 1}
                                style={{
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
                                <ChevronRight size={24} color="var(--color-text-muted)" />
                            </button>
                        </div>
                    </>
                ) : isOnSubmitPage ? (
                    <div className="animate-pop-in" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px',
                        padding: '32px 24px',
                        borderRadius: '20px',
                        border: '2px solid var(--color-border)',
                        borderBottom: '4px solid var(--color-border-dark)',
                        background: 'white',
                        width: '340px',
                        maxHeight: '70vh',
                        textAlign: 'center',
                    }}>
                        <div>
                            <p style={{
                                fontSize: '0.65rem',
                                fontWeight: '700',
                                color: 'var(--color-text-muted)',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                marginBottom: '4px',
                            }}>
                                Ready to Submit
                            </p>
                            <p style={{
                                fontSize: '1.3rem',
                                fontWeight: '900',
                                color: 'var(--color-text)',
                            }}>
                                Review Your Answers
                            </p>
                        </div>

                        <div style={{
                            width: '100%',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            padding: '4px',
                        }}>
                            {DEMOGRAPHIC_QUESTIONS.map((q, idx) => {
                                const answer = answers[q.id]
                                const renderAnswer = () => {
                                    if (!answer) {
                                        return <span style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>Skipped</span>
                                    }
                                    if (q.type === 'matrix' || q.type === 'confidence-allocator') {
                                        try {
                                            const parsed = JSON.parse(answer)
                                            return (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    {Object.entries(parsed).map(([key, value]) => (
                                                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                                                            <span style={{ color: 'var(--color-text)' }}>{key}:</span>
                                                            <span style={{ color: 'var(--color-primary)' }}>
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
                                    <div key={q.id} style={{
                                        textAlign: 'left',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        background: 'var(--color-surface)',
                                        border: '1px solid var(--color-border)',
                                    }}>
                                        <p style={{
                                            fontSize: '0.7rem',
                                            fontWeight: '700',
                                            color: 'var(--color-text-muted)',
                                            marginBottom: '4px',
                                        }}>
                                            Q{idx + 1}
                                        </p>
                                        <p style={{
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            color: 'var(--color-text)',
                                            marginBottom: '6px',
                                            lineHeight: '1.3',
                                        }}>
                                            {q.question}
                                        </p>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--color-primary)',
                                            fontWeight: '600',
                                        }}>
                                            {renderAnswer()}
                                        </div>
                                    </div>
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
                                style={{
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
                                className="btn-primary"
                                style={{
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
                                Thank you for your response!
                            </p>
                        </div>
                        <Link
                            to="/"
                            className="btn-primary"
                            style={{ marginTop: '8px', width: '100%', textDecoration: 'none', textAlign: 'center', color: 'white' }}
                        >
                            Back to Surveys
                        </Link>
                    </div>
                )}
            </div>
        </>
    )
}
