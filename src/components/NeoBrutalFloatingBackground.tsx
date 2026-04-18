import neoDecorSvg from '../assets/neobrutalism-decor.svg?raw'

const svgMarkup = neoDecorSvg.replace(/<\?xml[^?]*\?>\s*/i, '').trim()

/** Background decor extracted from `neobrutalism.svg` (no card/header/smiley/buttons). */
export function NeoBrutalFloatingBackground() {
    return (
        <div className="nb-bg-float-root" aria-hidden>
            <div
                className="nb-bg-decor-svg-wrap"
                dangerouslySetInnerHTML={{ __html: svgMarkup }}
            />
        </div>
    )
}
