import { ChevronDown } from 'lucide-react'
import type { SurveyQuestion } from '../App'

const TYPE_LABELS: Record<string, string> = {
    'multiple-choice': 'Multiple Choice',
    likert: 'Likert',
    nps: 'NPS',
    'open-ended': 'Open Ended',
    matrix: 'Matrix',
}

export function QuestionDropdown({
    questions,
    currentIndex,
    onSelect,
}: {
    questions: SurveyQuestion[]
    currentIndex: number
    onSelect: (index: number) => void
}) {
    return (
        <div className="nav-bar" style={{ gap: '12px' }}>
            <label
                htmlFor="question-select"
                style={{
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: 'var(--color-text-muted)',
                    whiteSpace: 'nowrap',
                }}
            >
                Question:
            </label>
            <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                <select
                    id="question-select"
                    value={currentIndex}
                    onChange={(e) => onSelect(Number(e.target.value))}
                    style={{
                        width: '100%',
                        padding: '8px 32px 8px 12px',
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        border: '2px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text)',
                        cursor: 'pointer',
                        appearance: 'none',
                        fontFamily: 'inherit',
                    }}
                >
                    {questions.map((q, i) => (
                        <option key={q.id} value={i}>
                            {i + 1}. {TYPE_LABELS[q.type] ?? q.type}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    size={18}
                    style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        color: 'var(--color-text-muted)',
                    }}
                />
            </div>
        </div>
    )
}
