import { Link } from 'react-router-dom'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { Zap, Swords } from 'lucide-react'

const cardStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '12px',
    padding: '24px 20px',
    borderRadius: '20px',
    border: '2px solid var(--color-border)',
    borderBottom: '4px solid var(--color-border-dark)',
    background: 'white',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '200px',
}

export function SurveySwitcher() {
    return (
        <>
            <AnimatedBackground isActive={false} />
            <div style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
                gap: '20px',
                paddingTop: '64px',
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                    <Link
                        to="/survey/orb"
                        style={cardStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-primary)'
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(88, 204, 2, 0.2)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = ''
                            e.currentTarget.style.boxShadow = ''
                        }}
                    >
                        <Zap size={32} color="var(--color-primary)" strokeWidth={2} />
                        <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-text)' }}>
                            Orb Survey
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                            Swipe cards to answer
                        </span>
                    </Link>
                    <Link
                        to="/survey/arena"
                        style={cardStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-accent)'
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 150, 0, 0.2)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = ''
                            e.currentTarget.style.boxShadow = ''
                        }}
                    >
                        <Swords size={32} color="var(--color-accent)" strokeWidth={2} />
                        <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-text)' }}>
                            Arena Duel
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                            Drag to pick the winner
                        </span>
                    </Link>
                </div>
            </div>
        </>
    )
}
