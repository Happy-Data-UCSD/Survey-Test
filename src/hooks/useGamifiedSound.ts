import { useCallback } from 'react'
import Snd from 'snd-lib'

let sndSingleton: Snd | null = null

function getSnd(): Snd | null {
    if (typeof window === 'undefined') return null
    if (!sndSingleton) {
        sndSingleton = new Snd({
            preloadSoundKit: Snd.KITS.SND01,
            muteOnWindowBlur: true,
        })
    }
    return sndSingleton
}

/** SND01 (sine) via [snd-lib](https://snd.dev/) — falls back to short Web Audio tones if playback fails. */
function synthTap() {
    try {
        if (navigator.vibrate) navigator.vibrate(10)
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(400, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1)
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.1)
    } catch { /* ignore */ }
}

function synthCelebration() {
    try {
        if (navigator.vibrate) navigator.vibrate([20, 50, 20])
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'square'
        osc.frequency.setValueAtTime(600, ctx.currentTime)
        osc.frequency.setValueAtTime(800, ctx.currentTime + 0.1)
        osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.2)
        gain.gain.setValueAtTime(0.05, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.3)
    } catch { /* ignore */ }
}

function synthSwipe() {
    try {
        if (navigator.vibrate) navigator.vibrate(15)
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const filter = ctx.createBiquadFilter()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(100, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2)
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(1000, ctx.currentTime)
        filter.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2)
        osc.connect(filter)
        filter.connect(gain)
        gain.connect(ctx.destination)
        gain.gain.setValueAtTime(0.05, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.2)
    } catch { /* ignore */ }
}

export function useGamifiedSound() {
    const playTap = useCallback(() => {
        const s = getSnd()
        try {
            if (s) {
                if (navigator.vibrate) navigator.vibrate(10)
                s.playTap()
            } else synthTap()
        } catch {
            synthTap()
        }
    }, [])

    const playSelect = useCallback(() => {
        const s = getSnd()
        try {
            if (s) {
                if (navigator.vibrate) navigator.vibrate(10)
                s.playSelect()
            } else synthTap()
        } catch {
            synthTap()
        }
    }, [])

    const playButton = useCallback(() => {
        const s = getSnd()
        try {
            if (s) {
                if (navigator.vibrate) navigator.vibrate(10)
                s.playButton()
            } else synthTap()
        } catch {
            synthTap()
        }
    }, [])

    /** Keystroke feedback — no vibrate (too noisy per key). */
    const playType = useCallback(() => {
        const s = getSnd()
        try {
            if (s) s.playType()
            else synthTap()
        } catch {
            synthTap()
        }
    }, [])

    const playSwipe = useCallback(() => {
        const s = getSnd()
        try {
            if (s) {
                if (navigator.vibrate) navigator.vibrate(15)
                s.playSwipe()
            } else synthSwipe()
        } catch {
            synthSwipe()
        }
    }, [])

    const playCelebration = useCallback(() => {
        const s = getSnd()
        try {
            if (s) {
                if (navigator.vibrate) navigator.vibrate([20, 50, 20])
                s.playCelebration()
            } else synthCelebration()
        } catch {
            synthCelebration()
        }
    }, [])

    /** @deprecated Use playSwipe */
    const playWhoosh = playSwipe
    /** @deprecated Use playCelebration */
    const playSuccess = playCelebration

    return {
        playTap,
        playSelect,
        playButton,
        playType,
        playSwipe,
        playCelebration,
        playWhoosh,
        playSuccess,
    }
}
