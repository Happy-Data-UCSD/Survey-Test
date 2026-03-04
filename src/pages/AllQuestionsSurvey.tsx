import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import { QuestionDropdown } from '../components/QuestionDropdown'
import { SwipeCard } from '../components/GameModes/SwipeCard'
import { LikertSlider } from '../components/GameModes/LikertSlider'
import { NPSStars } from '../components/GameModes/NPSStars'
import { OpenEndedBox } from '../components/GameModes/OpenEndedBox'
import { MatrixGrid } from '../components/GameModes/MatrixGrid'
import { SpatialTriage } from '../components/GameModes/SpatialTriage'
import { NodeConnection } from '../components/GameModes/NodeConnection'
import { ConfidenceAllocator } from '../components/GameModes/ConfidenceAllocator'
import { MultipleChoice } from '../components/GameModes/MultipleChoice'
import { useGamifiedSound } from '../hooks/useGamifiedSound'
import { SURVEY_QUESTIONS } from '../types/survey'

export function AllQuestionsSurvey() {
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
                    to="/survey"
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
                    <QuestionDropdown
                        questions={SURVEY_QUESTIONS}
                        currentIndex={isDone ? SURVEY_QUESTIONS.length - 1 : currentIndex}
                        onSelect={(index) => {
                            setCurrentIndex(index)
                            setIsDone(false)
                        }}
                    />
                </div>
            </div>

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
                        {currentQuestion.type === 'multiple-choice' && (
                            <SwipeCard
                                question={currentQuestion.question}
                                options={currentQuestion.options}
                                onAnswer={handleAnswer}
                                onDragStart={handleDragStart}
                            />
                        )}
                        {currentQuestion.type === 'vanilla-multiple-choice' && (
                            <MultipleChoice
                                question={currentQuestion.question}
                                options={currentQuestion.options}
                                onAnswer={handleAnswer}
                                onInteraction={playInteraction}
                            />
                        )}
                        {currentQuestion.type === 'likert' && (
                            <LikertSlider
                                question={currentQuestion.question}
                                options={currentQuestion.options}
                                onAnswer={handleAnswer}
                                onInteraction={playInteraction}
                            />
                        )}
                        {currentQuestion.type === 'nps' && (
                            <NPSStars
                                question={currentQuestion.question}
                                scale={currentQuestion.scale}
                                onAnswer={handleAnswer}
                                onInteraction={playInteraction}
                            />
                        )}
                        {currentQuestion.type === 'open-ended' && (
                            <OpenEndedBox
                                question={currentQuestion.question}
                                onAnswer={handleAnswer}
                                onInteraction={playInteraction}
                            />
                        )}
                        {currentQuestion.type === 'matrix' && (
                            <MatrixGrid
                                question={currentQuestion.question}
                                rows={currentQuestion.rows}
                                columns={currentQuestion.columns}
                                onAnswer={(answers) => handleAnswer(JSON.stringify(answers))}
                                onInteraction={playInteraction}
                            />
                        )}
                        {currentQuestion.type === 'spatial-triage' && (
                            <div style={{ flex: 1, width: '100%', minHeight: 0, display: 'flex', alignSelf: 'stretch' }}>
                                <SpatialTriage
                                    question={currentQuestion.question}
                                    options={currentQuestion.options}
                                    onAnswer={handleAnswer}
                                    onDragStart={handleDragStart}
                                />
                            </div>
                        )}
                        {currentQuestion.type === 'node-connection' && (
                            <NodeConnection
                                question={currentQuestion.question}
                                options={currentQuestion.options}
                                onAnswer={handleAnswer}
                                onInteraction={playInteraction}
                            />
                        )}
                        {currentQuestion.type === 'confidence-allocator' && (
                            <ConfidenceAllocator
                                question={currentQuestion.question}
                                options={currentQuestion.options}
                                onAnswer={handleAnswer}
                                onInteraction={playInteraction}
                            />
                        )}
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
                        <Link
                            to="/survey"
                            className="btn-primary"
                            style={{ marginTop: '8px', width: '100%', textDecoration: 'none', textAlign: 'center', color: 'inherit' }}
                        >
                            Back to Surveys
                        </Link>
                    </div>
                )}
            </div>
        </>
    )
}
