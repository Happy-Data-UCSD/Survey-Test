import { ChevronDown } from 'lucide-react'
import type { SurveyQuestion } from '../App'

const TYPE_LABELS: Record<string, string> = {
    'multiple-choice': 'Swipe Card',
    'vanilla-multiple-choice': 'Multiple Choice',
    likert: 'Likert',
    nps: 'NPS',
    'open-ended': 'Open Ended',
    matrix: 'Matrix',
    'spatial-triage': 'Spatial Triage',
    'node-connection': 'Node Connection',
    'confidence-allocator': 'Confidence Allocator',
}

const TYPE_SECTIONS: Record<string, string> = {
    'multiple-choice': 'Choice (pick one)',
    'vanilla-multiple-choice': 'Choice (pick one)',
    'spatial-triage': 'Choice (pick one)',
    'node-connection': 'Choice (pick one)',
    'confidence-allocator': 'Distribution',
    likert: 'Scale / Rating',
    nps: 'Scale / Rating',
    matrix: 'Matrix / Grid',
    'open-ended': 'Open-ended',
}

const SECTION_ORDER = ['Choice (pick one)', 'Distribution', 'Scale / Rating', 'Matrix / Grid', 'Open-ended', 'Other']

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
                    {SECTION_ORDER.map((section) => {
                        const indices = questions
                            .map((q, i) => ({ q, i }))
                            .filter(({ q }) => (TYPE_SECTIONS[q.type] ?? 'Other') === section)
                        if (indices.length === 0) return null
                        return (
                            <optgroup key={section} label={section}>
                                {indices.map(({ q, i }) => (
                                    <option key={q.id} value={i}>
                                        {TYPE_LABELS[q.type] ?? q.type}
                                    </option>
                                ))}
                            </optgroup>
                        )
                    })}
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
