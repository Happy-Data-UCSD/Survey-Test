import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { NB } from '../../styles/neobrutal'

interface ConfidenceAllocatorProps {
    question: string
    options: string[]
    onAnswer: (answer: string) => void
    onInteraction?: () => void
    selectedAnswer?: string
    neoBrutal?: boolean
}

function equalSplit(n: number): number[] {
    const base = Math.floor(100 / n / 5) * 5
    if (base === 0) return Array.from({ length: n }, (_, i) => (i === 0 ? 100 : 0))
    const result = Array(n).fill(base)
    result[n - 1] = 100 - base * (n - 1)
    return result
}

const roundTo5 = (v: number) => Math.round(Math.max(0, Math.min(100, v)) / 5) * 5

const TAU = 2 * Math.PI

function normRad(a: number): number {
    let r = a % TAU
    if (r < 0) r += TAU
    return r
}

/** Clockwise angle from top [0, 2π) — continuous around the circle (no t∈[0,1) seam). */
function pointerCwRadFromTop(clientX: number, clientY: number, el: SVGSVGElement): number {
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = clientX - cx
    const dy = clientY - cy
    return normRad(Math.atan2(dy, dx) + Math.PI / 2)
}

function cwDistClockwise(from: number, to: number): number {
    let d = to - from
    if (d < 0) d += TAU
    return d
}

function circularDist(a: number, b: number): number {
    const d = cwDistClockwise(a, b)
    return Math.min(d, TAU - d)
}

/**
 * Pair arc runs clockwise from thetaStart for spanRad radians (may wrap past 2π).
 * Maps pointer angle to fraction [0,1] along that arc; snaps in gaps between slices.
 *
 * Uses clockwise distance from thetaStart only: a point lies on the arc iff that
 * distance is ≤ span (covers wrap across 0 without splitting into two angle ranges).
 */
function fractionAlongPairArc(thetaStart: number, spanRad: number, thetaMouse: number): number {
    const Ts = normRad(thetaStart)
    const Tm = normRad(thetaMouse)
    const span = spanRad

    if (span <= 1e-12) return 0

    const d = cwDistClockwise(Ts, Tm)
    if (d <= span + 1e-7) {
        return Math.min(1, Math.max(0, d / span))
    }
    return nearestArcEndpointF(Ts, span, Tm)
}

function nearestArcEndpointF(thetaStart: number, spanRad: number, thetaMouse: number): number {
    const Ts = normRad(thetaStart)
    const Tm = normRad(thetaMouse)
    const Te = normRad(Ts + spanRad)
    const d0 = circularDist(Tm, Ts)
    const d1 = circularDist(Tm, Te)
    return d0 <= d1 ? 0 : 1
}

const SLICE_COLORS_NB = [NB.yellow, NB.green, '#7EB6FF', '#FF9B6A', '#C4A7FF', '#5DD5C8'] as const
const SLICE_COLORS_DEFAULT = [
    'var(--color-primary)',
    'var(--color-primary-light, #5B8DEF)',
    '#7EB6FF',
    '#E8964A',
    '#9B7FD5',
    '#3DB8A8',
] as const

function slicePath(cx: number, cy: number, r: number, t0: number, t1: number): string {
    if (t1 - t0 < 1e-6) return ''
    const a0 = -Math.PI / 2 + t0 * 2 * Math.PI
    const a1 = -Math.PI / 2 + t1 * 2 * Math.PI
    const x0 = cx + r * Math.cos(a0)
    const y0 = cy + r * Math.sin(a0)
    const x1 = cx + r * Math.cos(a1)
    const y1 = cy + r * Math.sin(a1)
    const large = a1 - a0 > Math.PI ? 1 : 0
    return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`
}

function boundaryUnitPosition(alloc: number[], boundaryIndex: number): number {
    let s = 0
    for (let i = 0; i < boundaryIndex; i++) s += alloc[i]
    return s / 100
}

/**
 * Square viewBox: margin for leader lines + labels.
 * foreignObject sizes are user units — tuned so scaled boxes stay ~70–90px wide on phones.
 * Pie radius is maximized within VB − leaders − label width (symmetric; avoids clipping).
 */
const CHART_VB = 1000
const CHART_CX = CHART_VB / 2
const CHART_CY = CHART_VB / 2
const CHART_R = 500
/** Rim → elbow → stub toward label (SVG user units). */
const LEADER_RIM = 12
const LEADER_OUT = 24
const LEADER_STUB = 20
/** Label boxes in vb — px size scales with SVG; room for padding + 2–3 lines. */
const LABEL_OFO_W = 320
const LABEL_OFO_H = 120
const LABEL_SAFE_MARGIN = 12
const PCT_FONT_SCALE = CHART_VB / 400
const PCT_INNER_FONT_MAX = Math.round(30 * PCT_FONT_SCALE)
const PCT_INNER_FONT_MIN = Math.round(18 * PCT_FONT_SCALE)

export function ConfidenceAllocator({ question, options, onAnswer, onInteraction, selectedAnswer, neoBrutal }: ConfidenceAllocatorProps) {
    const parseInitialAllocations = (): number[] => {
        if (selectedAnswer) {
            try {
                const record: Record<string, number> = JSON.parse(selectedAnswer)
                return options.map(opt => record[opt] ?? 0)
            } catch {
                return equalSplit(options.length)
            }
        }
        return equalSplit(options.length)
    }
    const [chartState, setChartState] = useState(() => ({
        allocations: parseInitialAllocations(),
        angleOffsetRad: 0,
    }))
    const [committed, setCommitted] = useState(false)
    const [dragBoundary, setDragBoundary] = useState<number | null>(null)
    const svgRef = useRef<SVGSVGElement | null>(null)
    const allocations = chartState.allocations
    const angleOffsetRad = chartState.angleOffsetRad

    const total = useMemo(() => allocations.reduce((a, b) => a + b, 0), [allocations])
    const isComplete = total === 100

    const colors = neoBrutal ? SLICE_COLORS_NB : SLICE_COLORS_DEFAULT

    const applyBoundaryDrag = useCallback(
        (boundaryB: number, thetaMouse: number) => {
            const n = options.length
            if (n < 2) return
            /** Boundary between last and first slice (12 o’clock); same physical edge when n===2 is handled by b=1 only */
            const isWrap = boundaryB === n && n >= 3
            if (!isWrap && (boundaryB < 1 || boundaryB >= n)) return

            setChartState(prevState => {
                const prev = prevState.allocations
                let leftIdx: number
                let rightIdx: number
                let tStart: number

                if (isWrap) {
                    leftIdx = n - 1
                    rightIdx = 0
                    tStart = boundaryUnitPosition(prev, n - 1)
                } else {
                    const b = boundaryB
                    leftIdx = b - 1
                    rightIdx = b
                    tStart = boundaryUnitPosition(prev, b - 1)
                }

                const pairTotal = prev[leftIdx] + prev[rightIdx]
                if (pairTotal <= 0) return prevState

                const span = pairTotal / 100
                if (span <= 0) return prevState

                const thetaStart = normRad(prevState.angleOffsetRad + tStart * TAU)
                const thetaSpan = span * TAU
                const f = fractionAlongPairArc(thetaStart, thetaSpan, thetaMouse)

                let newLeft = roundTo5(f * pairTotal)
                newLeft = Math.max(0, Math.min(pairTotal, newLeft))
                const newRight = pairTotal - newLeft
                const next = [...prev]
                next[leftIdx] = newLeft
                next[rightIdx] = newRight
                let nextOffset = prevState.angleOffsetRad
                if (isWrap) {
                    const firstSliceDeltaRad = ((newRight - prev[rightIdx]) / 100) * TAU
                    // Compensate seam movement so non-adjacent boundaries stay visually anchored.
                    nextOffset = normRad(nextOffset - firstSliceDeltaRad)
                }
                return { allocations: next, angleOffsetRad: nextOffset }
            })
        },
        [options.length],
    )

    useEffect(() => {
        if (dragBoundary == null) return
        const onMove = (e: PointerEvent) => {
            if (!svgRef.current) return
            const theta = pointerCwRadFromTop(e.clientX, e.clientY, svgRef.current)
            applyBoundaryDrag(dragBoundary, theta)
        }
        const onUp = () => {
            setDragBoundary(null)
            onInteraction?.()
        }
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
        window.addEventListener('pointercancel', onUp)
        return () => {
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onUp)
            window.removeEventListener('pointercancel', onUp)
        }
    }, [dragBoundary, applyBoundaryDrag, onInteraction])

    const handleSubmit = () => {
        if (!isComplete) return
        setCommitted(true)
        const record: Record<string, number> = {}
        options.forEach((opt, i) => { record[opt] = allocations[i] })
        onAnswer(JSON.stringify(record))
    }

    const cx = CHART_CX
    const cy = CHART_CY
    const r = CHART_R
    const stroke = neoBrutal ? NB.black : 'var(--color-border-dark)'

    let cum = 0
    const slices: { path: string; color: string; t0: number; t1: number }[] = []
    const sliceInnerPct: { key: string; lx: number; ly: number; pct: number; fontSize: number }[] = []
    const callouts: {
        key: string
        d: string
        foX: number
        foY: number
        textAlign: 'left' | 'right' | 'center'
        label: string
    }[] = []
    const labelInnerR = r * 0.48
    const rRim = r + LEADER_RIM
    const rOut = r + LEADER_OUT

    for (let i = 0; i < options.length; i++) {
        const t0 = angleOffsetRad / TAU + cum / 100
        cum += allocations[i]
        const t1 = angleOffsetRad / TAU + cum / 100
        const path = slicePath(cx, cy, r, t0, t1)
        if (path) {
            slices.push({
                path,
                color: colors[i % colors.length],
                t0,
                t1,
            })
        }
        const pct = allocations[i]
        if (pct > 0) {
            const tMid = (t0 + t1) / 2
            const ang = -Math.PI / 2 + tMid * 2 * Math.PI
            const cos = Math.cos(ang)
            const sin = Math.sin(ang)
            const pctFont = pct < 15
                ? PCT_INNER_FONT_MIN
                : Math.min(PCT_INNER_FONT_MAX, Math.round((17 + Math.round(pct / 8)) * PCT_FONT_SCALE))
            sliceInnerPct.push({
                key: `pct-${i}`,
                lx: cx + labelInnerR * cos,
                ly: cy + labelInnerR * sin,
                pct,
                fontSize: pctFont,
            })
        }

        const tMidAll = (t0 + t1) / 2
        const angL = -Math.PI / 2 + tMidAll * 2 * Math.PI
        const cosA = Math.cos(angL)
        const sinA = Math.sin(angL)
        const p0x = cx + rRim * cosA
        const p0y = cy + rRim * sinA
        const p1x = cx + rOut * cosA
        const p1y = cy + rOut * sinA
        let p2x: number
        let p2y: number
        let foX: number
        let foY: number
        let textAlign: 'left' | 'right' | 'center'

        if (Math.abs(cosA) >= Math.abs(sinA)) {
            const dir = cosA >= 0 ? 1 : -1
            p2x = p1x + dir * LEADER_STUB
            p2y = p1y
            if (dir > 0) {
                foX = p2x + 4
                foY = p2y - LABEL_OFO_H / 2
                textAlign = 'left'
            } else {
                foX = p2x - LABEL_OFO_W - 4
                foY = p2y - LABEL_OFO_H / 2
                textAlign = 'right'
            }
        } else {
            const dir = sinA >= 0 ? 1 : -1
            p2x = p1x
            p2y = p1y + dir * LEADER_STUB
            foX = p2x - LABEL_OFO_W / 2
            if (dir > 0) {
                foY = p2y + 4
                textAlign = 'center'
            } else {
                foY = p2y - LABEL_OFO_H - 4
                textAlign = 'center'
            }
        }
        foX = Math.max(LABEL_SAFE_MARGIN, Math.min(CHART_VB - LABEL_OFO_W - LABEL_SAFE_MARGIN, foX))
        foY = Math.max(LABEL_SAFE_MARGIN, Math.min(CHART_VB - LABEL_OFO_H - LABEL_SAFE_MARGIN, foY))

        callouts.push({
            key: `callout-${i}`,
            d: `M ${p0x} ${p0y} L ${p1x} ${p1y} L ${p2x} ${p2y}`,
            foX,
            foY,
            textAlign,
            label: options[i],
        })
    }

    const handles: { key: string; bx: number; by: number; boundaryIndex: number }[] = []
    if (options.length > 1) {
        for (let b = 1; b < options.length; b++) {
            const tu = angleOffsetRad / TAU + boundaryUnitPosition(allocations, b)
            const ang = -Math.PI / 2 + tu * 2 * Math.PI
            const hr = r + 4
            handles.push({
                key: `i-${b}`,
                bx: cx + hr * Math.cos(ang),
                by: cy + hr * Math.sin(ang),
                boundaryIndex: b,
            })
        }
        if (options.length >= 3) {
            const tu = angleOffsetRad / TAU
            const ang = -Math.PI / 2 + tu * 2 * Math.PI
            const hr = r + 4
            handles.push({
                key: 'wrap',
                bx: cx + hr * Math.cos(ang),
                by: cy + hr * Math.sin(ang),
                boundaryIndex: options.length,
            })
        }
    }

    const innerPctFill = '#ffffff'
    const innerPctStroke = 'rgba(0,0,0,0.5)'

    return (
        <div
            className="animate-pop-in confidence-allocator-root"
            style={{
                position: 'relative',
                width: '100%',
                maxWidth: '100%',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                gap: 'clamp(8px, 1.8cqh, 16px)',
                opacity: committed ? 0 : 1,
                fontFamily: neoBrutal ? NB.font : undefined,
                justifyContent: 'flex-start',
                paddingLeft: 'max(4px, env(safe-area-inset-left))',
                paddingRight: 'max(4px, env(safe-area-inset-right))',
                boxSizing: 'border-box',
            }}
        >
            <div
                style={{
                    textAlign: 'center',
                    width: '100%',
                    paddingTop: 0,
                    flexShrink: 0,
                }}
            >
                <h2
                    className="game-mode-question-title"
                    style={{
                        fontSize: 'clamp(1.18rem, 2.1cqh, 1.45rem)',
                        fontWeight: '800',
                        lineHeight: 1.35,
                        color: neoBrutal ? NB.black : 'var(--color-text)',
                        margin: '0 0 6px',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                        hyphens: 'auto',
                    }}
                >
                    {question}
                </h2>
                <p style={{
                    fontSize: 'clamp(0.74rem, 1.2cqh, 0.9rem)',
                    fontWeight: '800',
                    color: neoBrutal ? NB.black : 'var(--color-text-muted)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    lineHeight: 1.3,
                    margin: 0,
                }}>
                    {isComplete ? '100% allocated' : 'Drag rim to split neighbors'}
                </p>
            </div>

            <div
                className="confidence-allocator-chart-wrap"
                style={{
                    width: '100%',
                    minWidth: 0,
                    flex: '1 1 0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 0,
                    containerType: 'size',
                    containerName: 'allocator-chart',
                    paddingTop: 'clamp(6px, 1cqh, 14px)',
                    paddingBottom: 'clamp(6px, 1cqh, 14px)',
                    boxSizing: 'border-box',
                    overflow: 'visible',
                }}
            >
                <div
                    className="confidence-allocator-chart-inner"
                    style={{
                        width: 'min(100%, clamp(280px, 88cqh, 560px))',
                        aspectRatio: '1 / 1',
                        maxHeight: '100%',
                    }}
                >
                <svg
                    ref={svgRef}
                    viewBox={`0 0 ${CHART_VB} ${CHART_VB}`}
                    preserveAspectRatio="xMidYMid meet"
                    role="img"
                    aria-label="Confidence allocation pie chart. Drag handles on the rim to adjust slices."
                    style={{
                        width: '100%',
                        height: '100%',
                        touchAction: 'none',
                        userSelect: 'none',
                        display: 'block',
                        overflow: 'visible',
                    }}
                >
                    {slices.map((s, i) => (
                        <path
                            key={i}
                            d={s.path}
                            fill={s.color}
                            stroke={stroke}
                            strokeWidth={neoBrutal ? 3 : 2}
                            strokeLinejoin="round"
                        />
                    ))}
                    <g pointerEvents="none" aria-hidden>
                        {callouts.map(c => (
                            <path
                                key={c.key}
                                d={c.d}
                                fill="none"
                                stroke={stroke}
                                strokeWidth={neoBrutal ? 3 : 2.5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                vectorEffect="nonScalingStroke"
                            />
                        ))}
                    </g>
                    {sliceInnerPct.map(p => (
                        <text
                            key={p.key}
                            x={p.lx}
                            y={p.ly}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={innerPctFill}
                            stroke={innerPctStroke}
                            strokeWidth={neoBrutal ? 4 : 3.5}
                            paintOrder="stroke fill"
                            style={{
                                fontFamily: neoBrutal ? NB.font : 'inherit',
                                fontSize: p.fontSize,
                                fontWeight: 900,
                                pointerEvents: 'none',
                            }}
                        >
                            {p.pct}%
                        </text>
                    ))}
                    {handles.map(h => (
                        <g key={h.key}>
                            <circle
                                cx={h.bx}
                                cy={h.by}
                                r={30}
                                fill="transparent"
                                style={{ cursor: dragBoundary === h.boundaryIndex ? 'grabbing' : 'grab' }}
                                onPointerDown={e => {
                                    e.currentTarget.setPointerCapture(e.pointerId)
                                    setDragBoundary(h.boundaryIndex)
                                    onInteraction?.()
                                }}
                            />
                            <circle
                                cx={h.bx}
                                cy={h.by}
                                r={18}
                                fill={neoBrutal ? NB.cardBg : 'white'}
                                stroke={stroke}
                                strokeWidth={neoBrutal ? 3 : 2}
                                style={{
                                    pointerEvents: 'none',
                                }}
                            />
                        </g>
                    ))}
                    <g pointerEvents="none">
                        {callouts.map(c => (
                            <foreignObject
                                key={`fo-${c.key}`}
                                x={c.foX}
                                y={c.foY}
                                width={LABEL_OFO_W}
                                height={LABEL_OFO_H}
                            >
                                <div
                                    style={{
                                        margin: 0,
                                        padding: neoBrutal ? '8px 10px' : '7px 9px',
                                        fontSize: 'clamp(19px, 5.2vmin, 28px)',
                                        fontWeight: 900,
                                        fontFamily: neoBrutal ? NB.font : 'inherit',
                                        color: neoBrutal ? NB.black : 'var(--color-text)',
                                        textAlign: 'center',
                                        lineHeight: 1.2,
                                        letterSpacing: '-0.015em',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'normal',
                                        wordBreak: 'normal',
                                        overflowWrap: 'anywhere',
                                        boxSizing: 'border-box',
                                        height: '100%',
                                        maxHeight: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: neoBrutal ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.94)',
                                        borderRadius: neoBrutal ? 12 : 10,
                                        border: neoBrutal ? `2px solid ${NB.black}` : '1px solid rgba(0,0,0,0.12)',
                                        boxShadow: neoBrutal
                                            ? `4px 4px 0 ${NB.black}`
                                            : '0 2px 10px rgba(0,0,0,0.08)',
                                        textShadow: 'none',
                                    }}
                                >
                                    {c.label}
                                </div>
                            </foreignObject>
                        ))}
                    </g>
                </svg>
                </div>
            </div>

            <p
                className="confidence-allocator-sr-only"
                style={{
                    position: 'absolute',
                    width: 1,
                    height: 1,
                    padding: 0,
                    margin: -1,
                    overflow: 'hidden',
                    clip: 'rect(0, 0, 0, 0)',
                    whiteSpace: 'nowrap',
                    border: 0,
                }}
            >
                {options.map((opt, i) => `${opt}, ${allocations[i]} percent. `).join('')}
            </p>

            <button
                type="button"
                onClick={handleSubmit}
                disabled={!isComplete}
                style={neoBrutal ? {
                    width: '100%',
                    padding: '13px 12px',
                    borderRadius: '14px',
                    fontFamily: NB.font,
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    color: NB.black,
                    background: isComplete ? NB.yellow : '#D0D0D0',
                    border: NB.border,
                    boxShadow: isComplete ? NB.shadow : 'none',
                    cursor: isComplete ? 'pointer' : 'not-allowed',
                    textTransform: 'uppercase',
                    transition: 'all 0.1s ease',
                } : {
                    width: '100%',
                    padding: '13px 12px',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '0.95rem',
                    color: 'white',
                    background: isComplete ? 'var(--color-primary)' : 'var(--color-border-dark)',
                    border: 'none',
                    borderBottom: isComplete ? '4px solid var(--color-primary-dark)' : '4px solid #B0B0B0',
                    cursor: isComplete ? 'pointer' : 'not-allowed',
                    textTransform: 'uppercase',
                    transition: 'all 0.1s ease',
                }}
            >
                Confirm
            </button>
        </div>
    )
}
