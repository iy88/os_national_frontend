import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

const apiTarget = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    server: {
        allowedHosts: ['ali.iy88.site'],
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            '/email': {
                target: apiTarget,
                changeOrigin: true
            },
            '/user': {
                target: apiTarget,
                changeOrigin: true
            },
            '/health': {
                target: apiTarget,
                changeOrigin: true
            }
        }
    },
})

