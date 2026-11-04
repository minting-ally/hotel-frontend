```vue
<template>
  <div class="my-bookings">
    <div class="page-header">
      <h2>我的订单</h2>
      <el-button @click="loadBookings" :loading="loading">
        刷新订单
      </el-button>
    </div>

    <el-card shadow="never">
      <el-table
        :data="bookings"
        v-loading="loading"
        stripe
        style="width: 100%"
        empty-text="暂无订单记录"
      >
        <el-table-column
          prop="bookingNo"
          label="订单编号"
          min-width="190"
        />

        <el-table-column label="入住日期" min-width="120">
          <template #default="{ row }">
            {{ formatDate(row.expectedCheckIn) }}
          </template>
        </el-table-column>

        <el-table-column label="退房日期" min-width="120">
          <template #default="{ row }">
            {{ formatDate(row.expectedCheckOut) }}
          </template>
        </el-table-column>

        <el-table-column
          prop="plannedNights"
          label="入住晚数"
          width="100"
        >
          <template #default="{ row }">
            {{ row.plannedNights ?? '-' }} 晚
          </template>
        </el-table-column>

        <el-table-column label="每晚价格" width="110">
          <template #default="{ row }">
            ¥{{ money(row.nightlyPrice) }}
          </template>
        </el-table-column>

        <el-table-column label="订单金额" width="120">
          <template #default="{ row }">
            <span class="price">
              ¥{{ money(row.totalAmount) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="订单状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          label="预订来源"
          prop="bookingSource"
          width="110"
        />

        <!-- 新增：订单操作 -->
        <el-table-column
          label="操作"
          width="120"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0"
              type="danger"
              link
              :loading="cancellingId === row.id"
              @click="cancelBooking(row)"
            >
              取消预订
            </el-button>

            <span v-else class="no-action">-</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'

const bookings = ref([])
const loading = ref(false)
const cancellingId = ref(null)

// 查询当前消费者自己的订单
const loadBookings = async () => {
  loading.value = true

  try {
    const response = await request.get('/booking/my-orders')

    bookings.value = Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
        ? response.data
        : []
  } catch (error) {
    console.error('查询个人订单失败：', error)

    if (error.response?.status === 401) {
      ElMessage.error('登录状态已失效，请重新登录')
    } else if (error.response?.status === 403) {
      ElMessage.error('当前账号没有消费者权限')
    } else {
      ElMessage.error(
        error.response?.data?.message || '订单加载失败，请稍后重试'
      )
    }
  } finally {
    loading.value = false
  }
}

// 取消订单
const cancelBooking = async (row) => {
  try {
    // 先填写取消原因
    const { value } = await ElMessageBox.prompt(
      '请输入取消原因（选填），不填写也可以取消。',
      '取消预订',
      {
        confirmButtonText: '确认取消',
        cancelButtonText: '暂不取消',
        inputPlaceholder: '例如：行程有变',
        inputType: 'textarea',
        inputValidator: (value) => {
          if (value && value.length > 255) {
            return '取消原因不能超过255个字符'
          }
          return true
        }
      }
    )

    // 防止重复点击
    cancellingId.value = row.id

    // 调用后端取消接口
    await request.post(
      `/booking/cancel/${row.id}`,
      null,
      {
        params: {
          reason: value || ''
        }
      }
    )

    ElMessage.success('订单取消成功')

    // 重新查询订单，更新订单状态
    await loadBookings()

  } catch (error) {
    // 用户点击暂不取消时，不提示错误
    if (error === 'cancel' || error === 'close') {
      return
    }

    console.error('取消订单失败：', error)

    if (error.response?.status === 401) {
      ElMessage.error('登录状态已失效，请重新登录')
    } else if (error.response?.status === 403) {
      ElMessage.error('当前账号没有取消订单的权限')
    } else {
      ElMessage.error(
        error.response?.data?.message || '取消订单失败，请稍后重试'
      )
    }
  } finally {
    cancellingId.value = null
  }
}

// 日期格式化
const formatDate = (value) => {
  if (!value) return '-'
  return String(value).substring(0, 10)
}

// 金额格式化
const money = (value) => {
  if (value === null || value === undefined || value === '') {
    return '0.00'
  }

  return Number(value).toFixed(2)
}

// 订单状态文字
const statusText = (status) => {
  const map = {
    0: '已预订',
    1: '已入住',
    2: '已退房',
    3: '已取消'
  }

  return map[status] || '未知状态'
}

// 订单状态标签
const statusType = (status) => {
  const map = {
    0: 'warning',
    1: 'success',
    2: 'info',
    3: 'danger'
  }

  return map[status] || 'info'
}

onMounted(() => {
  loadBookings()
})
</script>

<style scoped>
.my-bookings {
  padding: 25px;
  min-height: 100%;
  background: #f5f7fa;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.no-action {
  color: #909399;
}

.el-card {
  border-radius: 8px;
}
</style>
```