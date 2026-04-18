import { NB } from '../../styles/neobrutal'

interface MultipleChoiceProps {
    question: string
    options: { up: string; down: string; left: string; right: string }
    onAnswer: (answer: string) => void
    onInteraction?: () => void
    selectedAnswer?: string
    neoBrutal?: boolean
}

const OPTION_ORDER: (keyof MultipleChoiceProps['options'])[] = ['up', 'down', 'left', 'right']

export function MultipleChoice({ question, options, onAnswer, onInteraction, selectedAnswer, neoBrutal }: MultipleChoiceProps) {
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
                ...(neoBrutal ? { fontFamily: NB.font } : {}),
            }}
            className="animate-pop-in"
        >
            <p
                style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: neoBrutal ? NB.black : 'var(--color-text)',
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
                {optionList.map((opt) => {
                    const isSelected = selectedAnswer === opt
                    if (neoBrutal) {
                        return (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => handleSelect(opt)}
                                style={{
                                    width: '100%',
                                    padding: '14px 20px',
                                    fontSize: '0.9rem',
                                    fontFamily: NB.font,
                                    fontWeight: 800,
                                    textAlign: 'left',
                                    border: NB.border,
                                    borderRadius: 16,
                                    boxShadow: isSelected ? NB.shadowSm : NB.shadow,
                                    background: isSelected ? NB.black : NB.yellow,
                                    color: isSelected ? '#fff' : NB.black,
                                    cursor: 'pointer',
                                    transition: 'transform 0.08s ease, box-shadow 0.08s ease',
                                }}
                                onMouseDown={(e) => {
                                    e.currentTarget.style.transform = 'translate(3px, 3px)'
                                    e.currentTarget.style.boxShadow = 'none'
                                }}
                                onMouseUp={(e) => {
                                    e.currentTarget.style.transform = ''
                                    e.currentTarget.style.boxShadow = isSelected ? NB.shadowSm : NB.shadow
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = ''
                                    e.currentTarget.style.boxShadow = isSelected ? NB.shadowSm : NB.shadow
                                }}
                            >
                                {opt}
                            </button>
                        )
                    }
                    return (
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
                                border: isSelected ? '2px solid var(--color-primary-dark)' : '2px solid var(--color-border)',
                                borderBottom: isSelected ? '4px solid var(--color-primary-dark)' : '4px solid var(--color-border-dark)',
                                borderRadius: 14,
                                background: isSelected ? 'var(--color-primary)' : 'white',
                                color: isSelected ? 'white' : 'var(--color-text)',
                                cursor: 'pointer',
                                transition: 'all 0.1s ease',
                            }}
                            onMouseEnter={(e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.background = 'var(--color-primary)'
                                    e.currentTarget.style.color = 'white'
                                    e.currentTarget.style.borderColor = 'var(--color-primary-dark)'
                                    e.currentTarget.style.borderBottomColor = 'var(--color-primary-dark)'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.background = 'white'
                                    e.currentTarget.style.color = 'var(--color-text)'
                                    e.currentTarget.style.borderColor = 'var(--color-border)'
                                    e.currentTarget.style.borderBottomColor = 'var(--color-border-dark)'
                                }
                            }}
                        >
                            {opt}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
