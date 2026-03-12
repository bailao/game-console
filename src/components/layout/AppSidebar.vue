<template>
  <el-menu
    :default-active="activeRoute"
    class="sidebar-menu"
    :collapse="collapsed"
    background-color="#001529"
    text-color="#ffffffa6"
    active-text-color="#ffffff"
    router
  >
    <el-menu-item
      v-for="item in menuItems"
      :key="item.path"
      :index="item.path"
    >
      <el-icon><component :is="item.icon" /></el-icon>
      <template #title>{{ item.title }}</template>
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineProps<{
  collapsed: boolean
}>()

const route = useRoute()
const activeRoute = computed(() => route.path)

const menuItems = [
  { path: '/dashboard', title: '数据总览', icon: 'DataLine' },
  { path: '/players', title: '玩家管理', icon: 'User' },
  { path: '/games', title: '游戏配置', icon: 'Setting' },
  { path: '/orders', title: '订单管理', icon: 'List' },
  { path: '/admins', title: '管理员系统', icon: 'UserFilled' },
]
</script>

<style scoped>
.sidebar-menu {
  border-right: none;
  flex: 1;
}

:deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.08) !important;
}
</style>
