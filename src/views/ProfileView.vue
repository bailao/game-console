<template>
  <div class="profile-page">
    <div class="page-header">
      <h2 class="page-title">个人信息</h2>
    </div>

    <el-card shadow="hover" class="profile-card">
      <el-form :model="profileForm" :rules="rules" ref="formRef" label-width="100px" class="profile-form">
        <el-form-item label="头像">
          <el-avatar :size="64" class="avatar-uploader">
            {{ profileForm.nickname?.charAt(0) || 'U' }}
          </el-avatar>
        </el-form-item>
        
        <el-form-item label="用户名" prop="username">
          <el-input v-model="profileForm.username" disabled />
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
        </el-form-item>

        <el-form-item label="角色">
          <el-tag type="success">{{ profileForm.role }}</el-tag>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="profileForm.phone" placeholder="请输入手机号码" />
        </el-form-item>

        <el-form-item label="个人简介">
          <el-input v-model="profileForm.bio" type="textarea" :rows="3" placeholder="请输入个人简介" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveProfile">保存修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const authStore = useAuthStore()
const formRef = ref<FormInstance>()

const profileForm = reactive({
  username: '',
  nickname: '',
  role: '',
  email: '',
  phone: '',
  bio: ''
})

const rules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

onMounted(() => {
  const userInfo = authStore.userInfo
  if (userInfo) {
    profileForm.username = userInfo.username || 'admin'
    profileForm.nickname = userInfo.nickname || '管理员'
    profileForm.role = userInfo.role || '超级管理员'
    profileForm.email = userInfo.email || 'admin@example.com'
    profileForm.phone = userInfo.phone || '13800138000'
    profileForm.bio = userInfo.bio || '欢迎使用游戏配置管理系统'
  }
})

async function saveProfile() {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      authStore.userInfo = {
        ...authStore.userInfo!,
        nickname: profileForm.nickname,
        email: profileForm.email,
        phone: profileForm.phone,
        bio: profileForm.bio
      }
      ElMessage.success('个人信息修改成功')
    }
  })
}
</script>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.profile-card {
  max-width: 800px;
}

.profile-form {
  margin-top: 20px;
  max-width: 500px;
}

.avatar-uploader {
  background-color: var(--el-color-primary);
  color: white;
  font-size: 24px;
  font-weight: bold;
}
</style>