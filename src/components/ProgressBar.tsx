import { Flame } from 'lucide-react'

export function ProgressBar({ current, total, streak }: { current: number, total: number, streak: number }) {
    const percentage = Math.min(100, Math.max(0, (current / total) * 100));

    return (
        <div className="glass-nav glass">
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Simple gray background track */}
                <div style={{
                    width: '100%',
                    height: '16px',
                    backgroundColor: '#E5E7EB',
                    borderRadius: '8px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Active progress track */}
                    <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: 'var(--color-secondary)',
                        borderRadius: '8px',
                        transition: 'width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }} />
                </div>
            </div>

            {/* Streak Counter */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginLeft: '20px',
                color: streak > 0 ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                gap: '4px'
            }} className={streak > 0 ? 'animate-pop-in' : ''} key={streak}>
                <Flame fill={streak > 0 ? 'var(--color-primary)' : 'transparent'} />
                {streak}
            </div>
        </div>
    )
}
