<template>
  <div style="padding: 10px;">
    <h2>控制台概览</h2>

    <!-- 数据指标卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header><b>总房间数</b></template>
          <div class="card-num">{{ stats.total || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header><b style="color: #67C23A;">当前空闲</b></template>
          <div class="card-num" style="color: #67C23A;">{{ stats.free || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header><b style="color: #F56C6C;">已入住</b></template>
          <div class="card-num" style="color: #F56C6C;">{{ stats.occupied || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header><b style="color: #409EFF;">入住率</b></template>
          <div class="card-num" style="color: #409EFF;">{{ stats.occupancyRate || '0%' }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 入住历史表格 -->
    <h3>近期入住记录</h3>
    <el-table :data="bookingList" border style="width: 100%;">
      <el-table-column prop="id" label="订单ID" width="80" />
      <el-table-column prop="roomId" label="房间ID" width="100" />
      <el-table-column prop="guestName" label="客人姓名" />
      <el-table-column prop="phone" label="联系电话" />
      <el-table-column prop="deposit" label="押金(元)" />
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'danger' : 'info'">
            {{ scope.row.status === 1 ? '已入住' : '已退房' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const stats = ref({})
const bookingList = ref([])

const loadStats = async () => {
  const res = await axios.get('http://localhost:8080/api/booking/dashboard-stats')
  stats.value = res.data
}

const loadBookings = async () => {
  const res = await axios.get('http://localhost:8080/api/booking/list')
  bookingList.value = res.data
}

onMounted(() => {
  loadStats()
  loadBookings()
})
</script>

<style scoped>
.card-num {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
}
</style>