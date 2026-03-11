<template>
  <div class="orders-page">
    <div class="page-header">
      <h2 class="page-title">订单管理</h2>
    </div>

    <!-- Search -->
    <el-card shadow="hover" class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderId" placeholder="请输入订单号" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="玩家">
          <el-input v-model="searchForm.player" placeholder="玩家名称" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 100px">
            <el-option label="已完成" value="completed" />
            <el-option label="处理中" value="processing" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Summary stats -->
    <el-row :gutter="16" class="order-stats">
      <el-col :span="6" v-for="stat in orderStats" :key="stat.label">
        <el-card shadow="never" :body-style="{ padding: '16px 20px' }">
          <div class="order-stat">
            <div class="order-stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
            <div class="order-stat-label">{{ stat.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Orders table -->
    <el-card shadow="hover">
      <el-table :data="filteredOrders" stripe>
        <el-table-column prop="id" label="订单号" width="140" />
        <el-table-column prop="player" label="玩家" width="100" />
        <el-table-column prop="game" label="游戏" width="120" />
        <el-table-column prop="item" label="充值项目" />
        <el-table-column prop="amount" label="金额" width="100">
          <template #default="{ row }">
            <span class="amount">¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="payMethod" label="支付方式" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.payMethod === '微信' ? 'success' : row.payMethod === '支付宝' ? 'primary' : 'info'">
              {{ row.payMethod }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag size="small" :type="statusType(row.status)">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="160" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">详情</el-button>
            <el-button
              v-if="row.status === 'completed'"
              type="warning"
              link
              size="small"
              @click="refundOrder(row)"
            >
              退款
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredOrders.length"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
        />
      </div>
    </el-card>

    <!-- Detail dialog -->
    <el-dialog v-model="detailVisible" title="订单详情" width="480px">
      <el-descriptions :column="2" border v-if="selectedOrder">
        <el-descriptions-item label="订单号" :span="2">{{ selectedOrder.id }}</el-descriptions-item>
        <el-descriptions-item label="玩家">{{ selectedOrder.player }}</el-descriptions-item>
        <el-descriptions-item label="游戏">{{ selectedOrder.game }}</el-descriptions-item>
        <el-descriptions-item label="充值项目" :span="2">{{ selectedOrder.item }}</el-descriptions-item>
        <el-descriptions-item label="金额">
          <span class="amount">¥{{ selectedOrder.amount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ selectedOrder.payMethod }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag size="small" :type="statusType(selectedOrder.status)">
            {{ statusLabel(selectedOrder.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ selectedOrder.createTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Order {
  id: string
  player: string
  game: string
  item: string
  amount: number
  payMethod: '微信' | '支付宝' | '苹果支付'
  status: 'completed' | 'processing' | 'refunded'
  createTime: string
}

const currentPage = ref(1)
const pageSize = ref(10)
const detailVisible = ref(false)
const selectedOrder = ref<Order | null>(null)

const searchForm = reactive({
  orderId: '',
  player: '',
  status: '',
  dateRange: null as [Date, Date] | null,
})

const orders = ref<Order[]>([
  { id: 'ORD-20240001', player: '玩家小明', game: '王者荣耀', item: '648点券', amount: 648, payMethod: '微信', status: 'completed', createTime: '2024-03-11 09:15:23' },
  { id: 'ORD-20240002', player: '玩家小红', game: '和平精英', item: '月卡', amount: 30, payMethod: '支付宝', status: 'processing', createTime: '2024-03-11 09:12:10' },
  { id: 'ORD-20240003', player: '玩家小蓝', game: '原神', item: '创世结晶×8080', amount: 648, payMethod: '苹果支付', status: 'completed', createTime: '2024-03-11 09:08:55' },
  { id: 'ORD-20240004', player: '玩家小绿', game: '英雄联盟', item: '皮肤礼包', amount: 198, payMethod: '微信', status: 'refunded', createTime: '2024-03-11 09:05:30' },
  { id: 'ORD-20240005', player: '玩家小黄', game: '刀塔传奇', item: '月卡礼包', amount: 30, payMethod: '支付宝', status: 'completed', createTime: '2024-03-11 09:01:18' },
  { id: 'ORD-20240006', player: '玩家大神', game: '阴阳师', item: '至尊礼包', amount: 1298, payMethod: '微信', status: 'completed', createTime: '2024-03-11 08:50:00' },
  { id: 'ORD-20240007', player: '玩家小明', game: '原神', item: '双倍月卡', amount: 68, payMethod: '微信', status: 'completed', createTime: '2024-03-10 22:30:00' },
  { id: 'ORD-20240008', player: '玩家小蓝', game: '王者荣耀', item: '周卡', amount: 6, payMethod: '支付宝', status: 'completed', createTime: '2024-03-10 20:15:00' },
])

const orderStats = computed(() => [
  { label: '总订单数', value: orders.value.length, color: '#1890ff' },
  { label: '已完成', value: orders.value.filter((o) => o.status === 'completed').length, color: '#52c41a' },
  { label: '处理中', value: orders.value.filter((o) => o.status === 'processing').length, color: '#fa8c16' },
  { label: '总金额 (¥)', value: orders.value.filter((o) => o.status !== 'refunded').reduce((sum, o) => sum + o.amount, 0).toLocaleString(), color: '#f5222d' },
])

const filteredOrders = computed(() => {
  return orders.value.filter((o) => {
    const matchId = !searchForm.orderId || o.id.includes(searchForm.orderId)
    const matchPlayer = !searchForm.player || o.player.includes(searchForm.player)
    const matchStatus = !searchForm.status || o.status === searchForm.status
    return matchId && matchPlayer && matchStatus
  })
})

function statusType(status: string) {
  const map: Record<string, string> = { completed: 'success', processing: 'warning', refunded: 'danger' }
  return (map[status] || 'info') as '' | 'success' | 'warning' | 'danger' | 'info'
}

function statusLabel(status: string) {
  const map: Record<string, string> = { completed: '已完成', processing: '处理中', refunded: '已退款' }
  return map[status] || status
}

function handleSearch() {
  currentPage.value = 1
}

function resetSearch() {
  searchForm.orderId = ''
  searchForm.player = ''
  searchForm.status = ''
  searchForm.dateRange = null
  currentPage.value = 1
}

function viewDetail(order: Order) {
  selectedOrder.value = order
  detailVisible.value = true
}

async function refundOrder(order: Order) {
  await ElMessageBox.confirm(`确定要对订单 "${order.id}" 进行退款吗？`, '退款确认', { type: 'warning' })
  const idx = orders.value.findIndex((o) => o.id === order.id)
  if (idx !== -1) orders.value[idx].status = 'refunded'
  ElMessage.success('退款成功')
}
</script>

<style scoped>
.orders-page {
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

.order-stats {
  margin-bottom: 4px;
}

.order-stat {
  text-align: center;
}

.order-stat-value {
  font-size: 24px;
  font-weight: 700;
}

.order-stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.amount {
  color: #f5222d;
  font-weight: 600;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
