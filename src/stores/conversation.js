import {defineStore} from 'pinia'
import {ref, computed} from 'vue'
import {getChatSessions, getChatSession} from '../api'

export const useConversationStore = defineStore('conversation', () => {
    // State
    const sessions = ref([])
    const currentSessionId = ref(null)
    const currentMessages = ref([])
    const isLoading = ref(false)
    const error = ref(null)
    const hasIncompleteMessage = ref(false) // 当前会话是否有未完成消息
    const incompleteMid = ref(null) // 未完成消息的 mid

    // Getters
    const currentSession = computed(() =>
        sessions.value.find(s => s.sid === currentSessionId.value)
    )

    // Group sessions by date
    const groupedSessions = computed(() => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

        const groups = {
            today: [],
            yesterday: [],
            earlier: []
        }

        sessions.value.forEach(session => {
            const sessionDate = new Date(session.updatedAt)
            const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate())

            if (sessionDay.getTime() === today.getTime()) {
                groups.today.push(session)
            } else if (sessionDay.getTime() === yesterday.getTime()) {
                groups.yesterday.push(session)
            } else {
                groups.earlier.push(session)
            }
        })

        // Sort each group by updatedAt descending
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        })

        return groups
    })

    // Actions
    const fetchSessions = async () => {
        isLoading.value = true
        error.value = null
        try {
            const result = await getChatSessions()
            if (result.success) {
                sessions.value = result.sessions
            }
        } catch (e) {
            error.value = e.message
        } finally {
            isLoading.value = false
        }
    }

    const fetchSessionDetail = async (sid) => {
        isLoading.value = true
        error.value = null
        try {
            // 从会话列表中查找该会话的 hasIncompleteMessage 状态
            const sessionFromList = sessions.value.find(s => s.sid === sid)
            const incompleteFlag = sessionFromList?.hasIncompleteMessage || false

            const result = await getChatSession(sid)
            if (result.success) {
                currentSessionId.value = sid
                hasIncompleteMessage.value = incompleteFlag

                const messages = result.session.messages.map(msg => ({
                    type: msg.role === 'user' ? 'user' : 'character',
                    content: msg.content,
                    mid: msg.mid,
                    createdAt: msg.createdAt,
                    completed: true  // 历史消息已完成，可显示操作按钮
                }))

                currentMessages.value = messages

                // 如果有未完成消息，找到最后一条 AI 消息的 mid
                if (incompleteFlag) {
                    const lastAiMsg = [...messages].reverse().find(m => m.type === 'character')
                    incompleteMid.value = lastAiMsg?.mid || null
                } else {
                    incompleteMid.value = null
                }
            }
        } catch (e) {
            error.value = e.message
        } finally {
            isLoading.value = false
        }
    }

    const selectSession = (sid) => {
        if (sid !== currentSessionId.value) {
            fetchSessionDetail(sid)
        }
    }

    const createNewSession = () => {
        currentSessionId.value = null
        currentMessages.value = []
        hasIncompleteMessage.value = false
        incompleteMid.value = null
    }

    // 更新会话标题
    const updateSessionTitle = (sid, title) => {
        const session = sessions.value.find(s => s.sid === sid)
        if (session) {
            session.title = title
        }
    }

    // Add streaming message
    const addStreamingMessage = (mid) => {
        currentMessages.value.push({
            type: 'character',
            content: '',
            mid
        })
    }

    // Append content to streaming message
    const appendToMessage = (index, content) => {
        if (currentMessages.value[index]) {
            currentMessages.value[index].content += content
        }
    }

    // Finalize streaming message
    const finalizeMessage = (title) => {
        if (title && currentSessionId.value) {
            const session = sessions.value.find(s => s.sid === currentSessionId.value)
            if (session) {
                session.title = title
            }
        }
        fetchSessions()
    }

    return {
        sessions,
        currentSessionId,
        currentMessages,
        isLoading,
        error,
        hasIncompleteMessage,
        incompleteMid,
        currentSession,
        groupedSessions,
        fetchSessions,
        fetchSessionDetail,
        selectSession,
        createNewSession,
        updateSessionTitle,
        addStreamingMessage,
        appendToMessage,
        finalizeMessage
    }
})
