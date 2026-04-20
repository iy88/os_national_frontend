import { reactive, readonly } from 'vue'

const cache = reactive(new Map())

export function useImageCache() {
  const getAvatar = (characterId, avatarToken) => {
    const key = String(characterId)
    if (cache.has(key)) {
      return cache.get(key).url
    }
    if (avatarToken) {
      const url = `/file/image/fetch?token=${avatarToken}`
      cache.set(key, { url, loading: true, error: false })
      const img = new Image()
      img.onload = () => { if (cache.has(key)) cache.get(key).loading = false }
      img.onerror = () => {
        if (cache.has(key)) {
          cache.get(key).error = true
          cache.get(key).loading = false
        }
      }
      img.src = url
    }
    return null
  }

  const preloadAvatars = (characters) => {
    characters.forEach(({ id, avatarToken }) => {
      if (avatarToken && !cache.has(String(id))) {
        getAvatar(id, avatarToken)
      }
    })
  }

  const invalidate = (characterId) => cache.delete(String(characterId))

  return { getAvatar, preloadAvatars, invalidate, cache: readonly(cache) }
}