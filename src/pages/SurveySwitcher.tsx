import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Zap, Swords, ListChecks, ChevronDown, Sparkles } from 'lucide-react'

const cardStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    boxSizing: 'border-box' as const,
    width: '200px',
    height: '182px',
    padding: '24px 20px',
    borderRadius: '20px',
    border: '2px solid var(--color-border)',
    borderBottom: '4px solid var(--color-border-dark)',
    background: 'white',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
}

const cardTitleStyle = {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: 'var(--color-text)',
    textAlign: 'center' as const,
    width: '100%',
    lineHeight: 1.2,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
}

const cardDescStyle = {
    fontSize: '0.7rem',
    color: 'var(--color-text-muted)',
    textAlign: 'center' as const,
    width: '100%',
    lineHeight: 1.35,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
}

const dropdownStyle = {
    padding: '12px 40px 12px 16px',
    borderRadius: '12px',
    border: '2px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontSize: '0.9rem',
    fontWeight: '700' as const,
    cursor: 'pointer',
    appearance: 'none' as const,
    minWidth: '200px',
}

export function SurveySwitcher() {
    const [activeCategory, setActiveCategory] = useState<'main' | 'other' | 'components'>('main')

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            gap: '20px',
            paddingTop: '40px',
            background: 'var(--color-background)',
        }}>
            <h1 style={{
                fontSize: '1.1rem',
                fontWeight: '800',
                color: 'var(--color-text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '8px',
            }}>
                Choose Survey
            </h1>

            <div style={{ position: 'relative' }}>
                <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value as 'main' | 'other' | 'components')}
                    style={dropdownStyle}
                >
                    <option value="main">Main</option>
                    <option value="other">Other Surveys</option>
                    <option value="components">All Components</option>
                </select>
                <ChevronDown
                    size={18}
                    style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        color: 'var(--color-text-muted)',
                    }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                {activeCategory === 'main' && (
                    <>
                        <Link
                            to="/test"
                            style={cardStyle}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-primary)'
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(100, 116, 139, 0.2)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-border)'
                                e.currentTarget.style.borderBottomColor = 'var(--color-border-dark)'
                                e.currentTarget.style.boxShadow = 'none'
                            }}
                        >
                            <ClipboardList size={32} color="var(--color-primary)" strokeWidth={2} />
                            <span style={cardTitleStyle}>Test Survey</span>
                            <span style={cardDescStyle}>Demographic questions</span>
                        </Link>
                        <Link
                            to="/test-neobrutalism"
                            style={cardStyle}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#000'
                                e.currentTarget.style.boxShadow = '6px 6px 0 #000'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-border)'
                                e.currentTarget.style.borderBottomColor = 'var(--color-border-dark)'
                                e.currentTarget.style.boxShadow = 'none'
                            }}
                        >
                            <Sparkles size={32} color="#000" strokeWidth={2} />
                            <span style={cardTitleStyle}>Test Survey NeoBrutalism</span>
                            <span style={cardDescStyle}>
                                Same questions & flow, bold neo-brutal UI
                            </span>
                        </Link>
                    </>
                )}

                {activeCategory === 'other' && (
                    <>
                        <Link
                            to="/orb"
                            style={cardStyle}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-primary)'
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(100, 116, 139, 0.2)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-border)'
                                e.currentTarget.style.borderBottomColor = 'var(--color-border-dark)'
                                e.currentTarget.style.boxShadow = 'none'
                            }}
                        >
                            <Zap size={32} color="var(--color-primary)" strokeWidth={2} />
                            <span style={cardTitleStyle}>Orb Survey</span>
                            <span style={cardDescStyle}>Swipe cards to answer</span>
                        </Link>
                        <Link
                            to="/arena"
                            style={cardStyle}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-accent)'
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 150, 0, 0.2)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-border)'
                                e.currentTarget.style.borderBottomColor = 'var(--color-border-dark)'
                                e.currentTarget.style.boxShadow = 'none'
                            }}
                        >
                            <Swords size={32} color="var(--color-accent)" strokeWidth={2} />
                            <span style={cardTitleStyle}>Arena Duel</span>
                            <span style={cardDescStyle}>Drag to pick the winner</span>
                        </Link>
                    </>
                )}

                {activeCategory === 'components' && (
                    <Link
                        to="/all"
                        style={cardStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-text-muted)'
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-border)'
                            e.currentTarget.style.borderBottomColor = 'var(--color-border-dark)'
                            e.currentTarget.style.boxShadow = 'none'
                        }}
                    >
                        <ListChecks size={32} color="var(--color-text-muted)" strokeWidth={2} />
                        <span style={cardTitleStyle}>All Questions</span>
                        <span style={cardDescStyle}>All question types with dropdown</span>
                    </Link>
                )}
            </div>
        </div>
    )
}
