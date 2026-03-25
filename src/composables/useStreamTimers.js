import {ref} from 'vue'

export function useStreamTimers() {
    const streamIntervalRef = ref(null)
    const streamTimeoutRef = ref(null)
    const thinkingTimeoutRef = ref(null)

    const clearStreamTimers = () => {
        if (thinkingTimeoutRef.value) {
            clearTimeout(thinkingTimeoutRef.value)
            thinkingTimeoutRef.value = null
        }
        if (streamIntervalRef.value) {
            clearInterval(streamIntervalRef.value)
            streamIntervalRef.value = null
        }
        if (streamTimeoutRef.value) {
            clearTimeout(streamTimeoutRef.value)
            streamTimeoutRef.value = null
        }
    }

    return {
        streamIntervalRef,
        streamTimeoutRef,
        thinkingTimeoutRef,
        clearStreamTimers
    }
}
