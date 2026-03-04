interface MultipleChoiceProps {
    question: string
    options: { up: string; down: string; left: string; right: string }
    onAnswer: (answer: string) => void
    onInteraction?: () => void
}

const OPTION_ORDER: (keyof MultipleChoiceProps['options'])[] = ['up', 'down', 'left', 'right']

export function MultipleChoice({ question, options, onAnswer, onInteraction }: MultipleChoiceProps) {
    const optionList = OPTION_ORDER.map((key) => options[key])

    const handleSelect = (option: string) => {
        onInteraction?.()
        onAnswer(option)
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 20,
                maxWidth: 360,
            }}
            className="animate-pop-in"
        >
            <p
                style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: 'var(--color-text)',
                    textAlign: 'center',
                    lineHeight: 1.35,
                    margin: 0,
                }}
            >
                {question}
            </p>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    width: '100%',
                }}
            >
                {optionList.map((opt) => (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelect(opt)}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            padding: '14px 20px',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            textAlign: 'left',
                            border: '2px solid var(--color-border)',
                            borderBottom: '4px solid var(--color-border-dark)',
                            borderRadius: 14,
                            background: 'white',
                            color: 'var(--color-text)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--color-primary)'
                            e.currentTarget.style.color = 'white'
                            e.currentTarget.style.borderColor = 'var(--color-primary-dark)'
                            e.currentTarget.style.borderBottomColor = 'var(--color-primary-dark)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white'
                            e.currentTarget.style.color = 'var(--color-text)'
                            e.currentTarget.style.borderColor = 'var(--color-border)'
                            e.currentTarget.style.borderBottomColor = 'var(--color-border-dark)'
                        }}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    )
}
