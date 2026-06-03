import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import {getTravelRecommendationDetail, getTravelRecommendations} from '../api'

export const useRecommendationStore = defineStore('recommendation', () => {
    // State
    const list = ref([])
    const byId = ref({})          // id -> 推荐详情
    const isLoading = ref(false)
    const error = ref(null)
    const loaded = ref(false)

    // Getters
    const displayNameMap = computed(() => {
        const m = {}
        list.value.forEach(item => {
            if (item.id != null && item.displayName) {
                m[item.id] = item.displayName
            }
        })
        return m
    })

    // Actions
    const fetchAll = async (force = false) => {
        if (loaded.value && !force) return
        isLoading.value = true
        error.value = null
        try {
            const result = await getTravelRecommendations()
            if (result?.success && Array.isArray(result.recommendations)) {
                list.value = result.recommendations
                const map = {}
                result.recommendations.forEach(item => {
                    if (item.id != null) {
                        map[item.id] = item
                    }
                })
                byId.value = map
                loaded.value = true
            } else {
                error.value = result?.message || '获取旅行推荐失败'
            }
        } catch (e) {
            error.value = e?.message || '获取旅行推荐失败'
            throw e
        } finally {
            isLoading.value = false
        }
    }

    const fetchById = async (recId) => {
        // 优先使用列表缓存
        const cached = byId.value[recId]
        if (cached) return cached
        try {
            const result = await getTravelRecommendationDetail(recId)
            if (result?.success && result.recommendation) {
                byId.value = {...byId.value, [recId]: result.recommendation}
                return result.recommendation
            }
        } catch (e) {
            error.value = e?.message || '获取旅行推荐详情失败'
            throw e
        }
        return null
    }

    return {
        list,
        byId,
        isLoading,
        error,
        loaded,
        displayNameMap,
        fetchAll,
        fetchById
    }
})
