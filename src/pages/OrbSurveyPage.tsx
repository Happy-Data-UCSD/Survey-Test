import { Link } from 'react-router-dom'
import { OrbSurvey } from './OrbSurvey'
import { ArrowLeft } from 'lucide-react'

export function OrbSurveyPage() {
    return (
        <>
            <Link
                to="/survey"
                style={{
                    position: 'absolute',
                    top: 20,
                    left: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--color-text-muted)',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    zIndex: 25,
                }}
            >
                <ArrowLeft size={18} />
                Back
            </Link>
            <OrbSurvey />
        </>
    )
}
