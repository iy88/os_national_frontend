import { createRouter, createWebHistory } from 'vue-router'
import TravelView from '../views/TravelView.vue'
import DialogueView from '../views/DialogueView.vue'

const routes = [
  {
    path: '/',
    redirect: '/travel'
  },
  {
    path: '/travel',
    name: 'travel',
    component: TravelView
  },
  {
    path: '/dialogue',
    name: 'dialogue',
    component: DialogueView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
