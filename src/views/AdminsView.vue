<template>
  <div class="admins-page">
    <div class="page-header">
      <h2 class="page-title">管理员设置</h2>
      <el-button type="primary" :icon="Plus" @click="openDialog()">添加管理员</el-button>
    </div>

    <!-- Admins table -->
    <el-card shadow="hover">
      <el-table :data="admins" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="role" label="角色">
          <template #default="{ row }">
            <el-tag :type="row.role === '超级管理员' ? 'danger' : 'info'" size="small">
              {{ row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.active"
              :disabled="row.role === '超级管理员'"
              active-text="启用"
              inactive-text="禁用"
              inline-prompt
              @change="toggleStatus(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最后登录时间" width="180" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDialog(row)" :disabled="row.role === '超级管理员'">编辑</el-button>
            <el-button type="danger" link size="small" @click="deleteAdmin(row)" :disabled="row.role === '超级管理员'">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Edit dialog -->
    <el-dialog v-model="dialogVisible" :title="editingAdmin ? '编辑管理员' : '添加管理员'" width="450px" @closed="resetForm">
      <el-form :model="adminForm" :rules="formRules" ref="formRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="adminForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!editingAdmin">
          <el-input v-model="adminForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="adminForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="普通管理员" value="普通管理员" />
            <el-option label="运营人员" value="运营人员" />
            <el-option label="客服专员" value="客服专员" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAdmin">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

interface Admin {
  id: number
  username: string
  role: string
  active: boolean
  lastLogin: string
}

const dialogVisible = ref(false)
const editingAdmin = ref<Admin | null>(null)
const formRef = ref<FormInstance>()

const adminForm = reactive({ username: '', password: '', role: '普通管理员' })

const formRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const admins = ref<Admin[]>([
  { id: 1, username: 'admin', role: '超级管理员', active: true, lastLogin: '2024-03-12 09:30:00' },
  { id: 2, username: 'operator01', role: '运营人员', active: true, lastLogin: '2024-03-11 15:20:10' },
  { id: 3, username: 'cs_staff', role: '客服专员', active: true, lastLogin: '2024-03-12 08:15:33' },
])

function openDialog(admin?: Admin) {
  editingAdmin.value = admin || null
  if (admin) {
    adminForm.username = admin.username
    adminForm.role = admin.role
  } else {
    resetForm()
  }
  dialogVisible.value = true
}

function resetForm() {
  formRef.value?.resetFields()
  adminForm.username = ''
  adminForm.password = ''
  adminForm.role = '普通管理员'
}

async function saveAdmin() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  if (editingAdmin.value) {
    const idx = admins.value.findIndex(a => a.id === editingAdmin.value!.id)
    if (idx !== -1) {
      admins.value[idx].username = adminForm.username
      admins.value[idx].role = adminForm.role
    }
    ElMessage.success('更新成功')
  } else {
    admins.value.push({
      id: Date.now(),
      username: adminForm.username,
      role: adminForm.role,
      active: true,
      lastLogin: '-'
    })
    ElMessage.success('添加成功')
  }
  dialogVisible.value = false
}

function toggleStatus(admin: Admin) {
  ElMessage.success(`已${admin.active ? '启用' : '禁用'}管理员 ${admin.username}`)
}

async function deleteAdmin(admin: Admin) {
  await ElMessageBox.confirm(`确定要删除管理员 "${admin.username}" 吗？`, '警告', { type: 'error' })
  const idx = admins.value.findIndex(a => a.id === admin.id)
  if (idx !== -1) admins.value.splice(idx, 1)
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.admins-page {
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
</style>