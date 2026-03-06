import { Link } from 'react-router-dom'
import { ArenaDuelSurvey } from '../components/ArenaDuelSurvey'
import { ArrowLeft } from 'lucide-react'

export function ArenaSurvey() {
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
                    to="/"
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
            </div>
            <div style={{ paddingTop: 64, height: '100%' }}>
                <ArenaDuelSurvey />
            </div>
        </>
    )
}
