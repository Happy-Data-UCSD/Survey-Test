import { createContext, useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

// Tuning constants — adjust these to retune the mechanic.
export const MAX_CPS = 6        // chars/sec required for full flame
export const WINDOW_MS = 1500   // rolling window for speed calculation
export const TICK_MS = 80       // animation update interval
export const RAMP_RATE = 0.5    // fraction of remaining gap closed per tick when target > current
export const DECAY_RATE = 0.04  // absolute drop per tick when target < current

export interface TypingFireValue {
    /** Eased heat 0..1 driving the visual fire. */
    heat: number
    /** Cumulative characters typed across the whole session. */
    totalChars: number
    /** Cumulative bonus points awarded on confirms. */
    bonusScore: number
    /** Call once per character typed (count > 1 for paste). */
    registerKeystroke: (count?: number) => void
    /**
     * Award a finishing bonus = floor(currentInputChars * heat) and reset the
     * per-input char counter. Returns the bonus that was awarded.
     */
    confirm: () => number
    /** Wipe everything (chars, bonus, heat, window). */
    reset: () => void
}

export const TypingFireContext = createContext<TypingFireValue | null>(null)

export function TypingFireProvider({ children }: { children: ReactNode }) {
    // Rolling window of keystroke timestamps (ms via performance.now)
    const keystrokesRef = useRef<number[]>([])
    // Per-input char counter — used by confirm() for the finishing bonus.
    const sessionCharsRef = useRef<number>(0)
    // Latest eased heat — kept in a ref too so the tick loop can read without re-binding.
    const heatRef = useRef<number>(0)

    const [heat, setHeat] = useState(0)
    const [totalChars, setTotalChars] = useState(0)
    const [bonusScore, setBonusScore] = useState(0)

    // Single global tick loop: prune window, compute target heat, ease toward it.
    useEffect(() => {
        const id = window.setInterval(() => {
            const now = (typeof performance !== 'undefined' ? performance.now() : Date.now())
            const cutoff = now - WINDOW_MS
            const stamps = keystrokesRef.current
            // Trim stale entries from the front (timestamps are monotonic).
            let dropTo = 0
            while (dropTo < stamps.length && stamps[dropTo] < cutoff) dropTo++
            if (dropTo > 0) stamps.splice(0, dropTo)

            const cps = stamps.length / (WINDOW_MS / 1000)
            const target = Math.min(1, Math.max(0, cps / MAX_CPS))

            const cur = heatRef.current
            let next: number
            if (target > cur) {
                next = cur + (target - cur) * RAMP_RATE
            } else {
                next = Math.max(target, cur - DECAY_RATE)
            }
            if (next < 0.001) next = 0

            if (Math.abs(next - cur) > 0.0005) {
                heatRef.current = next
                setHeat(next)
            }
        }, TICK_MS)
        return () => window.clearInterval(id)
    }, [])

    const registerKeystroke = useCallback((count: number = 1) => {
        // Cap pastes so a 2k-char dump doesn't pin heat to 1.0 for ages.
        const safeCount = Math.max(0, Math.min(Math.floor(count), 16))
        if (safeCount === 0) return
        const now = (typeof performance !== 'undefined' ? performance.now() : Date.now())
        const stamps = keystrokesRef.current
        for (let i = 0; i < safeCount; i++) stamps.push(now)
        sessionCharsRef.current += safeCount
        setTotalChars(c => c + safeCount)
    }, [])

    const confirm = useCallback(() => {
        const bonus = Math.floor(sessionCharsRef.current * heatRef.current)
        sessionCharsRef.current = 0
        if (bonus > 0) setBonusScore(s => s + bonus)
        return bonus
    }, [])

    const reset = useCallback(() => {
        keystrokesRef.current = []
        sessionCharsRef.current = 0
        heatRef.current = 0
        setHeat(0)
        setTotalChars(0)
        setBonusScore(0)
    }, [])

    const value: TypingFireValue = { heat, totalChars, bonusScore, registerKeystroke, confirm, reset }
    return <TypingFireContext.Provider value={value}>{children}</TypingFireContext.Provider>
}
