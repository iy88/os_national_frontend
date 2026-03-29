import {createApp} from 'vue'
import {createPinia} from 'pinia'
import ElementPlus, {ElMessage} from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import App from './App.vue'
import router from './router'

const GLOBAL_MESSAGE_DURATION = 1000
const MESSAGE_TYPES = ['success', 'warning', 'info', 'error']

// 统一收敛消息提示时长；若调用方显式传入 duration，则保持原配置。
MESSAGE_TYPES.forEach((type) => {
	const original = ElMessage[type]
	if (typeof original !== 'function') return

	ElMessage[type] = (options, appContext) => {
		if (typeof options === 'string') {
			return original(
				{
					message: options,
					duration: GLOBAL_MESSAGE_DURATION
				},
				appContext
			)
		}

		if (options && typeof options === 'object' && options.duration === undefined) {
			return original(
				{
					...options,
					duration: GLOBAL_MESSAGE_DURATION
				},
				appContext
			)
		}

		return original(options, appContext)
	}
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
