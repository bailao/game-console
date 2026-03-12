<template>
  <div class="dashboard">
    <h2 class="page-title">数据总览</h2>

    <!-- Stats cards -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :lg="6" v-for="stat in stats" :key="stat.label">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div :class="['stat-trend', stat.trend > 0 ? 'up' : 'down']">
                <el-icon>
                  <component :is="stat.trend > 0 ? 'ArrowUp' : 'ArrowDown'" />
                </el-icon>
                {{ Math.abs(stat.trend) }}% 较上周
              </div>
            </div>
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <el-icon size="28" color="white"><component :is="stat.icon" /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Recent activity and charts -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>近7天活跃玩家趋势</span>
              <el-tag type="success" size="small">实时</el-tag>
            </div>
          </template>
          <div ref="activePlayersChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover">
          <template #header>
            <span>游戏收入占比</span>
          </template>
          <div ref="revenueChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Latest orders -->
    <el-card shadow="hover" class="latest-orders">
      <template #header>
        <div class="card-header">
          <span>最新订单</span>
          <el-button type="primary" link @click="$router.push('/orders')">查看全部</el-button>
        </div>
      </template>
      <el-table :data="latestOrders" stripe>
        <el-table-column prop="id" label="订单号" width="120" />
        <el-table-column prop="player" label="玩家" />
        <el-table-column prop="game" label="游戏" />
        <el-table-column prop="amount" label="金额" >
          <template #default="{ row }">
            <span class="amount">¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === '已完成' ? 'success' : row.status === '处理中' ? 'warning' : 'danger'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="时间" width="160" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const activePlayersChartRef = ref<HTMLElement | null>(null)
const revenueChartRef = ref<HTMLElement | null>(null)
let activePlayersChart: echarts.ECharts | null = null
let revenueChart: echarts.ECharts | null = null

onMounted(() => {
  if (activePlayersChartRef.value) {
    activePlayersChart = echarts.init(activePlayersChartRef.value)
    
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '活跃玩家',
          type: 'line',
          smooth: true,
          areaStyle: {
            opacity: 0.3,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#1890ff' },
              { offset: 1, color: 'rgba(24,144,255,0.1)' }
            ])
          },
          itemStyle: {
            color: '#1890ff'
          },
          data: [8200, 9320, 9010, 9340, 12900, 15300, 14200]
        }
      ]
    }
    
    activePlayersChart.setOption(option)
  }

  if (revenueChartRef.value) {
    revenueChart = echarts.init(revenueChartRef.value)
    
    const revenueOption = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        bottom: '0%',
        left: 'center'
      },
      series: [
        {
          name: '游戏收入占比',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 45000, name: '王者荣耀' },
            { value: 28000, name: '和平精英' },
            { value: 15240, name: '原神' },
            { value: 6000, name: '英雄联盟' },
            { value: 4000, name: '刀塔传奇' }
          ]
        }
      ]
    }
    
    revenueChart.setOption(revenueOption)
  }

  window.addEventListener('resize', handleResize)
})

const handleResize = () => {
  activePlayersChart?.resize()
  revenueChart?.resize()
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  activePlayersChart?.dispose()
  revenueChart?.dispose()
})

const stats = [
  { label: '今日活跃玩家', value: '12,847', trend: 8.5, icon: 'User', color: '#1890ff' },
  { label: '今日收入 (¥)', value: '98,240', trend: 12.3, icon: 'Money', color: '#52c41a' },
  { label: '新增注册', value: '1,234', trend: -3.2, icon: 'UserFilled', color: '#722ed1' },
  { label: '游戏在线人数', value: '5,678', trend: 5.1, icon: 'Monitor', color: '#fa8c16' },
]

const latestOrders = [
  { id: 'ORD-20240001', player: '玩家小明', game: '王者荣耀', amount: '648', status: '已完成', time: '2024-03-11 09:15:23' },
  { id: 'ORD-20240002', player: '玩家小红', game: '和平精英', amount: '328', status: '处理中', time: '2024-03-11 09:12:10' },
  { id: 'ORD-20240003', player: '玩家小蓝', game: '原神', amount: '198', status: '已完成', time: '2024-03-11 09:08:55' },
  { id: 'ORD-20240004', player: '玩家小绿', game: '英雄联盟', amount: '88', status: '已退款', time: '2024-03-11 09:05:30' },
  { id: 'ORD-20240005', player: '玩家小黄', game: '刀塔传奇', amount: '30', status: '已完成', time: '2024-03-11 09:01:18' },
]
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 4px;
}

.stats-row {
  margin-bottom: 4px;
}

.stat-card {
  margin-bottom: 16px;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 4px 0 8px;
}

.stat-trend {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.stat-trend.up {
  color: #52c41a;
}

.stat-trend.down {
  color: #ff4d4f;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.amount {
  color: #f5222d;
  font-weight: 600;
}

.latest-orders {
  margin-top: 4px;
}
</style>
