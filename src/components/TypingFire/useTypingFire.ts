import { useContext } from 'react'
import { TypingFireContext } from './TypingFireProvider'
import type { TypingFireValue } from './TypingFireProvider'

// Inert fallback so consumers can render outside the provider safely (no-op).
const FALLBACK: TypingFireValue = {
    heat: 0,
    totalChars: 0,
    bonusScore: 0,
    registerKeystroke: () => {},
    confirm: () => 0,
    reset: () => {},
}

/**
 * Public hook for the typing-velocity fire mechanic.
 *
 * Wire any text input/textarea to {@link TypingFireValue.registerKeystroke}
 * inside its `onChange` (passing the number of characters added), and call
 * {@link TypingFireValue.confirm} when the input is committed to award the
 * finishing-strong bonus.
 */
export function useTypingFire(): TypingFireValue {
    const ctx = useContext(TypingFireContext)
    return ctx ?? FALLBACK
}
