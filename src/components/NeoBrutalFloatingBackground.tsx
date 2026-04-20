import neoDecorSvg from '../assets/neobrutalism-decor.svg?raw'

const svgMarkup = neoDecorSvg.replace(/<\?xml[^?]*\?>\s*/i, '').trim()

/**
 * Background decor extracted from `neobrutalism.svg` (no card/header/smiley/buttons).
 *
 * Two layers cooperate:
 *  - `variant="back"` (default) renders the large center-hugging sprites (diamonds,
 *    big stars) BEHIND the question card.
 *  - `variant="front"` renders the thin edge-hugging sprites (top-right teal arrow,
 *    top-right lines, bottom-left blue arrow) ON TOP of the card.
 *
 * Visibility per layer is controlled by CSS (`display: none` on the groups that
 * belong to the opposite layer) so the two layers together show the full decor
 * set without any sprite being drawn twice.
 */
export function NeoBrutalFloatingBackground({ variant = 'back' }: { variant?: 'back' | 'front' } = {}) {
    return (
        <div className={`nb-bg-float-root nb-bg-${variant}`} aria-hidden>
            <div
                className="nb-bg-decor-svg-wrap"
                dangerouslySetInnerHTML={{ __html: svgMarkup }}
            />
        </div>
    )
}
