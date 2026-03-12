<template>
  <el-container class="layout-container">
    <!-- Sidebar -->
    <el-aside :width="collapsed ? '64px' : '220px'" class="sidebar">
      <div class="logo">
        <span class="logo-icon">🎮</span>
        <span v-if="!collapsed" class="logo-text">游戏管理系统</span>
      </div>
      <AppSidebar :collapsed="collapsed" />
    </el-aside>

    <!-- Main content -->
    <el-container class="main-container">
      <AppHeader @toggle-sidebar="appStore.toggleSidebar()" />
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'

const appStore = useAppStore()
const collapsed = computed(() => appStore.collapsed)
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #001529;
  transition: width 0.3s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  white-space: nowrap;
}

.logo-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.logo-text {
  color: white;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
}

.main-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.main-content {
  background-color: var(--el-bg-color-page, #f0f2f5);
  overflow-y: auto;
  padding: 20px;
}
</style>
