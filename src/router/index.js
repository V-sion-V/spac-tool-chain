import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ()=>import('@/views/HomeView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: ()=>import("@/views/Login.vue")
    },
    {
      path: '/npc',
      name: 'npc',
      component: ()=>import("@/views/NpcManager.vue")
    },
    {
      path: '/dialog/:id',
      name: 'dialog',
      component: ()=>import("@/views/DialogDiagram.vue")
    }
  ]
})

export default router
