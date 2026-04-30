import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

/** Above neo foreground decor (5) and headers; below modal overlays if added later */
export const QUESTION_LIFT_PORTAL_Z = 10050

export type LiftedRect = {
    left: number
    top: number
    width: number
    height: number
}

export function captureLiftRect(el: HTMLElement | null): LiftedRect | null {
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { left: r.left, top: r.top, width: r.width, height: r.height }
}

/** Fixed-position mirror above overflow ancestors; children should be non-interactive */
export function LiftPortal({
    rect,
    children,
}: {
    rect: LiftedRect | null
    children: ReactNode
}) {
    if (!rect) return null
    return createPortal(
        <div
            style={{
                position: 'fixed',
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
                zIndex: QUESTION_LIFT_PORTAL_Z,
                pointerEvents: 'none',
            }}
        >
            {children}
        </div>,
        document.body,
    )
}
