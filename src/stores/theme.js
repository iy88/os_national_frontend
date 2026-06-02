import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'theme-mode'

function getMediaQuery() {
    if (typeof window === 'undefined' || !window.matchMedia) return null
    return window.matchMedia('(prefers-color-scheme: dark)')
}

function resolveSystem() {
    const mq = getMediaQuery()
    return mq && mq.matches ? 'dark' : 'light'
}

function readPersisted() {
    try {
        const v = localStorage.getItem(STORAGE_KEY)
        return v === 'light' || v === 'dark' || v === 'system' ? v : 'system'
    } catch {
        return 'system'
    }
}

export const useThemeStore = defineStore('theme', () => {
    const mode = ref(readPersisted())
    const systemPref = ref(resolveSystem())
    const effective = ref(mode.value === 'system' ? systemPref.value : mode.value)

    function apply() {
        effective.value = mode.value === 'system' ? systemPref.value : mode.value
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', effective.value)
            document.documentElement.classList.toggle('dark', effective.value === 'dark')
        }
    }

    function setMode(next) {
        if (next !== 'light' && next !== 'dark' && next !== 'system') return
        mode.value = next
        try {
            localStorage.setItem(STORAGE_KEY, next)
        } catch {
            // ignore quota / private mode errors
        }
        apply()
    }

    function toggle() {
        setMode(effective.value === 'dark' ? 'light' : 'dark')
    }

    function init() {
        const mq = getMediaQuery()
        if (mq) {
            const handler = () => {
                systemPref.value = resolveSystem()
                apply()
            }
            if (mq.addEventListener) {
                mq.addEventListener('change', handler)
            } else if (mq.addListener) {
                mq.addListener(handler)
            }
        }
        apply()
    }

    return { mode, systemPref, effective, setMode, toggle, init }
})
