<template>
  <div class="games-page">
    <div class="page-header">
      <h2 class="page-title">游戏配置</h2>
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增游戏</el-button>
    </div>

    <el-row :gutter="20">
      <el-col
        v-for="game in games"
        :key="game.id"
        :xs="24"
        :sm="12"
        :lg="8"
        :xl="6"
        class="game-col"
      >
        <el-card class="game-card" shadow="hover">
          <div class="game-cover">
            <span class="game-emoji">{{ game.emoji }}</span>
          </div>
          <div class="game-info">
            <div class="game-name">{{ game.name }}</div>
            <div class="game-category">
              <el-tag size="small" type="info">{{ game.category }}</el-tag>
            </div>
            <div class="game-meta">
              <span>在线：<b>{{ game.onlinePlayers.toLocaleString() }}</b></span>
              <span>收入：<b class="income">¥{{ game.monthlyIncome.toLocaleString() }}</b></span>
            </div>
            <el-divider />
            <div class="game-footer">
              <el-switch
                v-model="game.enabled"
                active-text="上线"
                inactive-text="下线"
                @change="toggleGame(game)"
              />
              <div class="actions">
                <el-button type="primary" link size="small" @click="openDialog(game)">编辑</el-button>
                <el-button type="danger" link size="small" @click="deleteGame(game)">删除</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Edit dialog -->
    <el-dialog v-model="dialogVisible" :title="editingGame ? '编辑游戏' : '新增游戏'" width="520px">
      <el-form :model="gameForm" :rules="formRules" ref="formRef" label-width="90px">
        <el-form-item label="游戏名称" prop="name">
          <el-input v-model="gameForm.name" placeholder="请输入游戏名称" />
        </el-form-item>
        <el-form-item label="游戏分类" prop="category">
          <el-select v-model="gameForm.category" placeholder="请选择" style="width: 100%">
            <el-option label="MOBA" value="MOBA" />
            <el-option label="射击" value="射击" />
            <el-option label="RPG" value="RPG" />
            <el-option label="策略" value="策略" />
            <el-option label="卡牌" value="卡牌" />
          </el-select>
        </el-form-item>
        <el-form-item label="游戏图标">
          <el-input v-model="gameForm.emoji" placeholder="输入emoji图标" maxlength="2" />
        </el-form-item>
        <el-form-item label="游戏描述">
          <el-input v-model="gameForm.description" type="textarea" :rows="3" placeholder="请输入游戏描述" />
        </el-form-item>
        <el-form-item label="最大玩家">
          <el-input-number v-model="gameForm.maxPlayers" :min="100" :step="1000" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveGame">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

interface Game {
  id: number
  name: string
  category: string
  emoji: string
  description: string
  onlinePlayers: number
  monthlyIncome: number
  maxPlayers: number
  enabled: boolean
}

const dialogVisible = ref(false)
const editingGame = ref<Game | null>(null)
const formRef = ref<FormInstance>()

const gameForm = reactive({
  name: '',
  category: '',
  emoji: '🎮',
  description: '',
  maxPlayers: 10000,
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入游戏名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择游戏分类', trigger: 'change' }],
}

const games = ref<Game[]>([
  { id: 1, name: '王者荣耀', category: 'MOBA', emoji: '⚔️', description: '5v5竞技手游', onlinePlayers: 45320, monthlyIncome: 2840000, maxPlayers: 100000, enabled: true },
  { id: 2, name: '和平精英', category: '射击', emoji: '🔫', description: '大逃杀射击游戏', onlinePlayers: 38750, monthlyIncome: 1960000, maxPlayers: 80000, enabled: true },
  { id: 3, name: '原神', category: 'RPG', emoji: '✨', description: '开放世界冒险RPG', onlinePlayers: 62100, monthlyIncome: 5200000, maxPlayers: 200000, enabled: true },
  { id: 4, name: '英雄联盟', category: 'MOBA', emoji: '🏆', description: '端游MOBA经典', onlinePlayers: 28600, monthlyIncome: 1200000, maxPlayers: 60000, enabled: true },
  { id: 5, name: '刀塔传奇', category: '卡牌', emoji: '🃏', description: '卡牌策略手游', onlinePlayers: 8900, monthlyIncome: 380000, maxPlayers: 30000, enabled: false },
  { id: 6, name: '阴阳师', category: 'RPG', emoji: '🦊', description: '日式卡牌RPG', onlinePlayers: 15400, monthlyIncome: 920000, maxPlayers: 50000, enabled: true },
])

function openDialog(game?: Game) {
  editingGame.value = game || null
  if (game) {
    gameForm.name = game.name
    gameForm.category = game.category
    gameForm.emoji = game.emoji
    gameForm.description = game.description
    gameForm.maxPlayers = game.maxPlayers
  } else {
    gameForm.name = ''
    gameForm.category = ''
    gameForm.emoji = '🎮'
    gameForm.description = ''
    gameForm.maxPlayers = 10000
  }
  dialogVisible.value = true
}

async function saveGame() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  if (editingGame.value) {
    const idx = games.value.findIndex((g) => g.id === editingGame.value!.id)
    if (idx !== -1) {
      games.value[idx].name = gameForm.name
      games.value[idx].category = gameForm.category
      games.value[idx].emoji = gameForm.emoji
      games.value[idx].description = gameForm.description
      games.value[idx].maxPlayers = gameForm.maxPlayers
    }
    ElMessage.success('更新成功')
  } else {
    games.value.push({
      id: Date.now(),
      name: gameForm.name,
      category: gameForm.category,
      emoji: gameForm.emoji,
      description: gameForm.description,
      onlinePlayers: 0,
      monthlyIncome: 0,
      maxPlayers: gameForm.maxPlayers,
      enabled: true,
    })
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
}

function toggleGame(game: Game) {
  ElMessage.success(`游戏 "${game.name}" 已${game.enabled ? '上线' : '下线'}`)
}

async function deleteGame(game: Game) {
  await ElMessageBox.confirm(`确定要删除游戏 "${game.name}" 吗？`, '警告', { type: 'error' })
  const idx = games.value.findIndex((g) => g.id === game.id)
  if (idx !== -1) games.value.splice(idx, 1)
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.games-page {
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
  color: #333;
  margin: 0;
}

.game-col {
  margin-bottom: 16px;
}

.game-card {
  transition: transform 0.2s;
}

.game-card:hover {
  transform: translateY(-4px);
}

.game-cover {
  height: 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -20px -20px 16px;
}

.game-emoji {
  font-size: 52px;
}

.game-name {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.game-category {
  margin-bottom: 12px;
}

.game-meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
}

.income {
  color: #f5222d;
}

.game-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
