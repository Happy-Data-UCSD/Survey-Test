import { useState, useCallback } from 'react'
import { CheckCircle } from 'lucide-react'
import { QuestionDropdown } from './components/QuestionDropdown'
import { SwipeCard } from './components/GameModes/SwipeCard'
import { LikertSlider } from './components/GameModes/LikertSlider'
import { NPSStars } from './components/GameModes/NPSStars'
import { OpenEndedBox } from './components/GameModes/OpenEndedBox'
import { MatrixGrid } from './components/GameModes/MatrixGrid'
import { SpatialTriage } from './components/GameModes/SpatialTriage'
import { NodeConnection } from './components/GameModes/NodeConnection'
import { ConfidenceAllocator } from './components/GameModes/ConfidenceAllocator'
import { useGamifiedSound } from './hooks/useGamifiedSound'

// Define the shape of our diverse survey questions
export type SurveyQuestion =
    | { id: number; type: 'multiple-choice'; question: string; options: { up: string; down: string; left: string; right: string } }
    | { id: number; type: 'likert'; question: string; options: string[] }
    | { id: number; type: 'nps'; question: string; scale: number }
    | { id: number; type: 'open-ended'; question: string }
    | { id: number; type: 'matrix'; question: string; rows: string[]; columns: string[] }
    | { id: number; type: 'spatial-triage'; question: string; options: { topLeft: string; topRight: string; bottomLeft: string; bottomRight: string } }
    | { id: number; type: 'node-connection'; question: string; options: string[] }
    | { id: number; type: 'confidence-allocator'; question: string; options: string[] }

const SURVEY_QUESTIONS: SurveyQuestion[] = [
    {
        id: 1,
        type: 'multiple-choice',
        question: "How do you feel about our new branding?",
        options: { up: "Love it!", down: "Hate it!", left: "Needs work", right: "It's okay" }
    },
    {
        id: 2,
        type: 'likert',
        question: "The software is easy to navigate.",
        options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
    },
    {
        id: 3,
        type: 'nps',
        question: "How likely are you to recommend us?",
        scale: 10
    },
    {
        id: 4,
        type: 'matrix',
        question: "Rate the following aspects:",
        rows: ["Performance", "Design", "Support"],
        columns: ["Poor", "Fair", "Good", "Excellent"]
    },
    {
        id: 5,
        type: 'open-ended',
        question: "What is your biggest daily challenge?"
    },
    {
        id: 6,
        type: 'spatial-triage',
        question: "How would you rate this feature?",
        options: {
            topLeft: "Love it",
            topRight: "It's okay",
            bottomLeft: "Needs work",
            bottomRight: "Hate it"
        }
    },
    {
        id: 7,
        type: 'node-connection',
        question: "What best describes your experience?",
        options: ["Excellent", "Good", "Average", "Needs improvement"]
    },
    {
        id: 8,
        type: 'confidence-allocator',
        question: "Distribute your confidence: Which best explains the result?",
        options: ["Hypothesis A", "Hypothesis B", "Hypothesis C"]
    }
]

export default function App() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [streak, setStreak] = useState(0)
    const [isDone, setIsDone] = useState(false)

    const { playInteraction, playSuccess, playWhoosh } = useGamifiedSound()

    const handleDragStart = useCallback(() => {
        playInteraction()
    }, [playInteraction])

    const handleAnswer = useCallback((answer: string | null) => {
        if (!answer) return

        playWhoosh()
        setStreak(s => s + 1)

        setTimeout(() => {
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
            <QuestionDropdown
                questions={SURVEY_QUESTIONS}
                currentIndex={isDone ? SURVEY_QUESTIONS.length - 1 : currentIndex}
                onSelect={(index) => {
                    setCurrentIndex(index)
                    setIsDone(false)
                }}
            />

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
                paddingTop: '64px',
            }}>

                {!isDone ? (
                    <div
                        key={currentQuestion.id}
                        style={
                            currentQuestion.type === 'spatial-triage'
                                ? { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', width: '100%', alignSelf: 'stretch' }
                                : undefined
                        }
                    >
                        {(() => {
                            switch (currentQuestion.type) {
                                case 'multiple-choice':
                                    return (
                                        <SwipeCard
                                            question={currentQuestion.question}
                                            options={currentQuestion.options}
                                            onAnswer={handleAnswer}
                                            onDragStart={handleDragStart}
                                        />
                                    )
                                case 'likert':
                                    return (
                                        <LikertSlider
                                            question={currentQuestion.question}
                                            options={currentQuestion.options}
                                            onAnswer={handleAnswer}
                                        />
                                    )
                                case 'nps':
                                    return (
                                        <NPSStars
                                            question={currentQuestion.question}
                                            scale={currentQuestion.scale}
                                            onAnswer={handleAnswer}
                                            onInteraction={playInteraction}
                                        />
                                    )
                                case 'open-ended':
                                    return (
                                        <OpenEndedBox
                                            question={currentQuestion.question}
                                            onAnswer={handleAnswer}
                                            onInteraction={playInteraction}
                                        />
                                    )
                                case 'matrix':
                                    return (
                                        <MatrixGrid
                                            question={currentQuestion.question}
                                            rows={currentQuestion.rows}
                                            columns={currentQuestion.columns}
                                            onAnswer={(answers) => handleAnswer(JSON.stringify(answers))}
                                            onInteraction={playInteraction}
                                        />
                                    )
                                case 'spatial-triage':
                                    return (
                                        <div style={{ flex: 1, width: '100%', minHeight: 0, display: 'flex', alignSelf: 'stretch' }}>
                                            <SpatialTriage
                                                question={currentQuestion.question}
                                                options={currentQuestion.options}
                                                onAnswer={handleAnswer}
                                                onDragStart={handleDragStart}
                                            />
                                        </div>
                                    )
                                case 'node-connection':
                                    return (
                                        <NodeConnection
                                            question={currentQuestion.question}
                                            options={currentQuestion.options}
                                            onAnswer={handleAnswer}
                                            onInteraction={playInteraction}
                                        />
                                    )
                                case 'confidence-allocator':
                                    return (
                                        <ConfidenceAllocator
                                            question={currentQuestion.question}
                                            options={currentQuestion.options}
                                            onAnswer={handleAnswer}
                                            onInteraction={playInteraction}
                                        />
                                    )
                                default:
                                    return null
                            }
                        })()}
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
