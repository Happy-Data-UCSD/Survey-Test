import { useMemo } from 'react'
import { useTypingFire } from './useTypingFire'

/** Two solid fills — warm red / orange core */
const FIRE_RED = '#E63946'
const FIRE_ORANGE = '#F4A02C'

/** Vertical space for a deep bowl-shaped base (+ room above for negative-y peaks). */
export const FIRE_VB_H = 286

/** Ground shadow rests just under deepest part of underside. */
const SHADOW_CY = 272

interface TypingFireProps {
    size?: number
    burstKey?: number
}

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t
}

function clamp01(n: number): number {
    return Math.min(1, Math.max(0, n))
}

/**
 * Plump asymmetric 🔥 — three tongues plus a bulbous underside: wide chord and
 * deep cubic “bowl” controls so the bottom reads spherical, not flat.
 */
export function buildOuterPath(h: number): string {
    const t = clamp01(h)

    const yMain = lerp(20, -18, t)
    const yLeft = lerp(88, 58, t)
    const yRight = lerp(84, 57, t)

    const saddleMidL = (yLeft + yMain) / 2 + 52 - t * 9
    const saddleMidR = (yMain + yRight) / 2 + 50 - t * 9
    const notchR = Math.max(saddleMidR + 18, yRight + 28) - t * 6

    const xMain = lerp(108, 106, t)
    const xLeft = 70
    const xRight = 140

    const vbH = FIRE_VB_H
    // Wide chord sitting above view foot + deep bowl apex for a visibly “squashy” base
    const yChord = 252
    const yBowl = Math.min(vbH - 8, yChord + 26)

    return [
        `M 26 ${yChord}`,
        `C ${64} ${yBowl}, ${136} ${yBowl}, ${174} ${yChord}`,
        /* right flank: ease away from chord with buoyant inward curve — not ruler-straight */
        `C ${192} ${yChord - 2} ${186} ${150} ${xRight} ${yRight}`,
        `C ${132} ${notchR} ${122} ${saddleMidR + 8} ${xMain} ${yMain}`,
        `C ${92} ${saddleMidL} ${82} ${saddleMidL + 16} ${xLeft} ${yLeft}`,
        /* left flank curls back toward base corner rather than plummeting vertically */
        `C ${54} ${yLeft + 42} ${28} ${yChord + 18} ${26} ${yChord}`,
        `Z`,
    ].join(' ')
}

/** Inner orange echoes outer bowl geometry in a narrower band. */
export function buildInnerPath(h: number): string {
    const t = clamp01(h)

    const dYM = (lerp(20, -18, t) - 20) * 0.72
    const yMain = 116 + dYM
    const yLeft = lerp(158, 134, t)
    const yRight = lerp(155, 132, t)

    const saddleML = (yLeft + yMain) / 2 + 38 - t * 6
    const saddleMR = (yMain + yRight) / 2 + 34 - t * 6

    const xM = 109
    const xInnerL = 84
    const xInnerR = 129

    const vbH = FIRE_VB_H
    const yChord = 253
    const yBowl = Math.min(vbH - 14, yChord + 20)

    return [
        `M 56 ${yChord}`,
        `C ${76} ${yBowl}, ${124} ${yBowl}, ${144} ${yChord}`,
        `C ${154} ${yChord - 2} ${154} ${yRight + 12} ${xInnerR} ${yRight}`,
        `C ${120} ${saddleMR} ${114} ${saddleMR + 8} ${xM} ${yMain}`,
        `C ${96} ${saddleML + 10} ${86} ${saddleML + 18} ${xInnerL} ${yLeft}`,
        `C ${72} ${yLeft + 14} ${58} ${yChord + 12} ${56} ${yChord}`,
        `Z`,
    ].join(' ')
}

function SparkField({ visible }: { visible: boolean }) {
    const specs = useMemo(
        () =>
            [
                { x: -72, size: 9, hex: FIRE_RED },
                { x: -28, size: 12, hex: FIRE_ORANGE },
                { x: 18, size: 11, hex: FIRE_RED },
                { x: 58, size: 10, hex: FIRE_ORANGE },
                { x: 78, size: 9, hex: FIRE_ORANGE },
                { x: -90, size: 8, hex: FIRE_RED },
                { x: -48, size: 11, hex: FIRE_ORANGE },
                { x: 40, size: 8, hex: FIRE_RED },
            ] as const,
        []
    )

    if (!visible) return null

    return (
        <div aria-hidden className="tf-spark-root">
            {specs.map((s, i) => (
                <span
                    key={i}
                    className="tf-spark"
                    style={{
                        animation: `tf-spark-rise ${0.91 + (i % 6) * 0.068}s linear infinite`,
                        animationDelay: `${i * 120}ms`,
                        left: '50%',
                        top: '32%',
                        width: s.size,
                        height: s.size,
                        marginLeft: s.x - s.size / 2,
                        marginTop: -Math.floor(s.size / 2),
                        backgroundColor: s.hex,
                    }}
                />
            ))}
        </div>
    )
}

export function TypingFire({ size = 169, burstKey = 0 }: TypingFireProps) {
    const { heat } = useTypingFire()
    const h = clamp01(heat)

    const outer = buildOuterPath(h)
    const inner = buildInnerPath(h)

    const heatScale = 1 + h * 0.5

    const bob = heat < 0.4
    const wiggle = heat >= 0.4
    const sparksOn = heat > 0.6

    const vbW = 200
    const vbH = FIRE_VB_H
    const renderHeight = size * (vbH / vbW)

    const motionClass = bob ? 'tf-motion-bob' : wiggle ? 'tf-motion-wiggle' : ''

    return (
        <div
            className="typing-fire-wrap typing-fire-emoji"
            aria-hidden
            style={{
                width: size,
                height: renderHeight,
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none',
            }}
        >
            <div
                key={`burst-${burstKey}`}
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    animation: burstKey > 0
                        ? 'nb-fire-burst 0.42s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        : undefined,
                }}
            >
                <div className={`tf-motion-slot ${motionClass}`}>
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                            transform: `scale(${heatScale.toFixed(4)})`,
                            transformOrigin: 'bottom center',
                            transition: 'transform 80ms linear',
                        }}
                    >
                        <svg
                            viewBox={`0 0 ${vbW} ${vbH}`}
                            width="100%"
                            height="100%"
                            xmlns="http://www.w3.org/2000/svg"
                            preserveAspectRatio="xMidYMax meet"
                            style={{ display: 'block', overflow: 'visible' }}
                        >
                            <ellipse
                                cx={100}
                                cy={SHADOW_CY}
                                rx={84}
                                ry={11}
                                fill="#000"
                                fillOpacity={0.1}
                            />
                            <path d={outer} fill={FIRE_RED} />
                            <path d={inner} fill={FIRE_ORANGE} />
                        </svg>

                        <SparkField visible={sparksOn} />
                    </div>
                </div>
            </div>
        </div>
    )
}
