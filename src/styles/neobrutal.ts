import type { CSSProperties } from 'react'

/** Neo-brutalism tokens (Figma-aligned: hard shadow, black outline, cream/yellow) */
export const NB = {
    pageBg: '#FDF2E3',
    cardBg: '#FFFBF5',
    yellow: '#FFDE03',
    black: '#000000',
    green: '#6CBD45',
    shadow: '4px 4px 0 0 #000000',
    shadowSm: '3px 3px 0 0 #000000',
    border: '3px solid #000000',
    font: "'Lexend', sans-serif",
    /** Inline styles; layers defined once on :root as --nb-text-readability-shadow */
    textReadabilityShadow: 'var(--nb-text-readability-shadow)',
} as const

export function nbFont(neo: boolean | undefined): CSSProperties {
    return neo ? { fontFamily: NB.font } : {}
}
