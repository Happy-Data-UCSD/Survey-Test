import { Flame } from 'lucide-react'

export function ProgressBar({ current, total, streak }: { current: number, total: number, streak: number }) {
    const percentage = Math.min(100, Math.max(0, (current / total) * 100))

    return (
        <div className="nav-bar">
            <div style={{
                flex: 1,
                height: '14px',
                backgroundColor: 'var(--color-border)',
                borderRadius: '7px',
                overflow: 'hidden',
            }}>
                <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '7px',
                    boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.12)',
                    transition: 'width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }} />
            </div>

            <div
                key={streak}
                className={streak > 0 ? 'animate-pop-in' : ''}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontWeight: '800',
                    fontSize: '1.05rem',
                    color: streak > 0 ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    minWidth: '48px',
                    justifyContent: 'flex-end',
                }}
            >
                <Flame
                    size={18}
                    strokeWidth={2.5}
                    color={streak > 0 ? 'var(--color-accent)' : 'var(--color-text-muted)'}
                    fill={streak > 0 ? 'var(--color-accent)' : 'none'}
                />
                {streak}
            </div>
        </div>
    )
}
