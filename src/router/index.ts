import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: () => import('@/components/layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: { title: '数据总览', icon: 'DataLine' },
        },
        {
          path: 'players',
          name: 'Players',
          component: () => import('@/views/PlayersView.vue'),
          meta: { title: '玩家管理', icon: 'User' },
        },
        {
          path: 'games',
          name: 'Games',
          component: () => import('@/views/GamesView.vue'),
          meta: { title: '游戏配置', icon: 'Setting' },
        },
        {
          path: 'orders',
          name: 'Orders',
          component: () => import('@/views/OrdersView.vue'),
          meta: { title: '订单管理', icon: 'List' },
        },
        {
          path: 'admins',
          name: 'Admins',
          component: () => import('@/views/AdminsView.vue'),
          meta: { title: '管理员设置', icon: 'UserFilled' },
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('@/views/ProfileView.vue'),
          meta: { title: '个人信息', icon: 'User' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// Route guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth !== false && !authStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && authStore.isLoggedIn) {
    next({ path: '/dashboard' })
  } else {
    next()
  }
})

export default router
