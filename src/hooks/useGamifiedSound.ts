import { useCallback } from 'react'

export function useGamifiedSound() {
    const playInteraction = useCallback(() => {
        try {
            if (navigator.vibrate) navigator.vibrate(10) // Small haptic bump
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
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
        } catch (e) { }
    }, [])

    const playSuccess = useCallback(() => {
        try {
            if (navigator.vibrate) navigator.vibrate([20, 50, 20]) // Happy haptic pattern
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
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
        } catch (e) { }
    }, [])

    const playWhoosh = useCallback(() => {
        try {
            if (navigator.vibrate) navigator.vibrate(15) // Swiping vibration
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.type = 'sawtooth'
            osc.frequency.setValueAtTime(100, ctx.currentTime)
            osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2)

            const filter = ctx.createBiquadFilter()
            filter.type = 'lowpass'
            filter.frequency.setValueAtTime(1000, ctx.currentTime)
            filter.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2)

            osc.disconnect()
            osc.connect(filter)
            filter.connect(gain)

            gain.gain.setValueAtTime(0.05, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
            osc.start(ctx.currentTime)
            osc.stop(ctx.currentTime + 0.2)
        } catch (e) { }
    }, [])

    return { playInteraction, playSuccess, playWhoosh }
}
