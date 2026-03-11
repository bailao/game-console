<template>
  <div class="players-page">
    <div class="page-header">
      <h2 class="page-title">玩家管理</h2>
      <el-button type="primary" :icon="Plus" @click="openDialog()">添加玩家</el-button>
    </div>

    <!-- Search bar -->
    <el-card shadow="hover" class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="玩家名称">
          <el-input v-model="searchForm.keyword" placeholder="输入玩家名/ID" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="正常" value="normal" />
            <el-option label="封禁" value="banned" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Players table -->
    <el-card shadow="hover">
      <el-table :data="filteredPlayers" stripe v-loading="loading">
        <el-table-column prop="id" label="玩家ID" width="80" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="level" label="等级" width="80">
          <template #default="{ row }">
            <el-tag type="warning" size="small">Lv.{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="game" label="主玩游戏" />
        <el-table-column prop="totalRecharge" label="累计充值(¥)" >
          <template #default="{ row }">
            <span class="recharge">¥{{ row.totalRecharge }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'normal' ? 'success' : 'danger'" size="small">
              {{ row.status === 'normal' ? '正常' : '封禁' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="registerTime" label="注册时间" width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDialog(row)">编辑</el-button>
            <el-button
              :type="row.status === 'normal' ? 'danger' : 'success'"
              link
              size="small"
              @click="toggleStatus(row)"
            >
              {{ row.status === 'normal' ? '封禁' : '解封' }}
            </el-button>
            <el-button type="danger" link size="small" @click="deletePlayer(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
        />
      </div>
    </el-card>

    <!-- Edit dialog -->
    <el-dialog v-model="dialogVisible" :title="editingPlayer ? '编辑玩家' : '添加玩家'" width="500px">
      <el-form :model="playerForm" :rules="formRules" ref="formRef" label-width="80px">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="playerForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="主玩游戏" prop="game">
          <el-select v-model="playerForm.game" placeholder="请选择" style="width: 100%">
            <el-option v-for="g in games" :key="g" :label="g" :value="g" />
          </el-select>
        </el-form-item>
        <el-form-item label="等级" prop="level">
          <el-input-number v-model="playerForm.level" :min="1" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePlayer">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

interface Player {
  id: number
  nickname: string
  level: number
  game: string
  totalRecharge: number
  status: 'normal' | 'banned'
  registerTime: string
}

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const editingPlayer = ref<Player | null>(null)
const formRef = ref<FormInstance>()

const searchForm = reactive({ keyword: '', status: '' })
const playerForm = reactive({ nickname: '', game: '', level: 1 })

const games = ['王者荣耀', '和平精英', '原神', '英雄联盟', '刀塔传奇', '阴阳师']

const formRules: FormRules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  game: [{ required: true, message: '请选择游戏', trigger: 'change' }],
}

const players = ref<Player[]>([
  { id: 1001, nickname: '玩家小明', level: 85, game: '王者荣耀', totalRecharge: 3280, status: 'normal', registerTime: '2023-01-15 10:23:00' },
  { id: 1002, nickname: '玩家小红', level: 62, game: '和平精英', totalRecharge: 1560, status: 'normal', registerTime: '2023-02-20 14:35:00' },
  { id: 1003, nickname: '玩家小蓝', level: 120, game: '原神', totalRecharge: 12800, status: 'banned', registerTime: '2022-11-08 09:12:00' },
  { id: 1004, nickname: '玩家小绿', level: 45, game: '英雄联盟', totalRecharge: 680, status: 'normal', registerTime: '2023-05-30 16:48:00' },
  { id: 1005, nickname: '玩家小黄', level: 99, game: '刀塔传奇', totalRecharge: 5200, status: 'normal', registerTime: '2022-08-12 11:05:00' },
  { id: 1006, nickname: '玩家大神', level: 200, game: '阴阳师', totalRecharge: 28600, status: 'normal', registerTime: '2021-06-01 08:00:00' },
])

const total = computed(() => filteredPlayers.value.length)

const filteredPlayers = computed(() => {
  return players.value.filter((p) => {
    const matchKeyword =
      !searchForm.keyword ||
      p.nickname.includes(searchForm.keyword) ||
      String(p.id).includes(searchForm.keyword)
    const matchStatus = !searchForm.status || p.status === searchForm.status
    return matchKeyword && matchStatus
  })
})

function handleSearch() {
  currentPage.value = 1
}

function resetSearch() {
  searchForm.keyword = ''
  searchForm.status = ''
  currentPage.value = 1
}

function openDialog(player?: Player) {
  editingPlayer.value = player || null
  if (player) {
    playerForm.nickname = player.nickname
    playerForm.game = player.game
    playerForm.level = player.level
  } else {
    playerForm.nickname = ''
    playerForm.game = ''
    playerForm.level = 1
  }
  dialogVisible.value = true
}

async function savePlayer() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  if (editingPlayer.value) {
    const idx = players.value.findIndex((p) => p.id === editingPlayer.value!.id)
    if (idx !== -1) {
      players.value[idx].nickname = playerForm.nickname
      players.value[idx].game = playerForm.game
      players.value[idx].level = playerForm.level
    }
    ElMessage.success('编辑成功')
  } else {
    players.value.push({
      id: Date.now(),
      nickname: playerForm.nickname,
      level: playerForm.level,
      game: playerForm.game,
      totalRecharge: 0,
      status: 'normal',
      registerTime: new Date().toLocaleString('zh-CN'),
    })
    ElMessage.success('添加成功')
  }
  dialogVisible.value = false
}

async function toggleStatus(player: Player) {
  const action = player.status === 'normal' ? '封禁' : '解封'
  await ElMessageBox.confirm(`确定要${action}玩家 "${player.nickname}" 吗？`, '提示', {
    type: 'warning',
  })
  player.status = player.status === 'normal' ? 'banned' : 'normal'
  ElMessage.success(`${action}成功`)
}

async function deletePlayer(player: Player) {
  await ElMessageBox.confirm(`确定要删除玩家 "${player.nickname}" 吗？此操作不可恢复！`, '警告', {
    type: 'error',
  })
  const idx = players.value.findIndex((p) => p.id === player.id)
  if (idx !== -1) players.value.splice(idx, 1)
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.players-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.search-card {
  margin-bottom: 4px;
}

.recharge {
  color: #f5222d;
  font-weight: 600;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
