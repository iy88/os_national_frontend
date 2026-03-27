import {ref} from 'vue'

export function useStreamTimers() {
    const streamIntervalRef = ref(null)
    const streamTimeoutRef = ref(null)
    const thinkingTimeoutRef = ref(null)
    const streamingCancelRef = ref(null) // SSE 连接取消函数

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

    // 取消 SSE 流式输出
    // abortFetch: 是否中止 fetch 请求，默认 true
    const cancelStreaming = (abortFetch = true) => {
        if (streamingCancelRef.value) {
            streamingCancelRef.value(abortFetch)
            streamingCancelRef.value = null
        }
        clearStreamTimers()
    }

    return {
        streamIntervalRef,
        streamTimeoutRef,
        thinkingTimeoutRef,
        streamingCancelRef,
        clearStreamTimers,
        cancelStreaming
    }
}
