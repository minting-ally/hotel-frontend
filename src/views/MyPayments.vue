```vue
<template>
  <div class="my-payments">
    <div class="page-header">
      <h2>我的支付记录</h2>
      <el-button @click="loadPayments" :loading="loading">
        刷新记录
      </el-button>
    </div>

    <el-card shadow="never">
      <el-table
        :data="payments"
        v-loading="loading"
        stripe
        style="width: 100%"
        empty-text="暂无支付记录"
      >
        <el-table-column
          prop="paymentNo"
          label="支付单号"
          min-width="190"
        />

        <el-table-column
          prop="bookingId"
          label="关联订单ID"
          width="110"
        />

        <el-table-column
          prop="paymentType"
          label="支付类型"
          width="120"
        />

        <el-table-column
          prop="paymentMethod"
          label="支付方式"
          width="120"
        />

        <el-table-column label="支付金额" width="130">
          <template #default="{ row }">
            <span class="price">
              ¥{{ money(row.amount) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="支付状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusType(row.paymentStatus)">
              {{ statusText(row.paymentStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="transactionNo"
          label="交易流水号"
          min-width="180"
        >
          <template #default="{ row }">
            {{ row.transactionNo || '-' }}
          </template>
        </el-table-column>

        <el-table-column label="支付时间" min-width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.paymentTime) }}
          </template>
        </el-table-column>

        <el-table-column
          prop="remark"
          label="备注"
          min-width="150"
        >
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const payments = ref([])
const loading = ref(false)

// 查询当前消费者自己的支付记录
const loadPayments = async () => {
  loading.value = true

  try {
    const response = await request.get('/payment/my-records')

    // 后端返回格式：{ code, message, data }
    payments.value = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response)
        ? response
        : []

  } catch (error) {
    console.error('查询支付记录失败：', error)

    if (error.response?.status === 401) {
      ElMessage.error('登录状态已失效，请重新登录')
    } else if (error.response?.status === 403) {
      ElMessage.error('当前账号没有消费者权限')
    } else {
      ElMessage.error(
        error.response?.data?.message || '支付记录加载失败，请稍后重试'
      )
    }
  } finally {
    loading.value = false
  }
}

// 金额格式化
const money = (value) => {
  if (value === null || value === undefined || value === '') {
    return '0.00'
  }

  return Number(value).toFixed(2)
}

// 日期时间格式化
const formatDateTime = (value) => {
  if (!value) return '-'

  return String(value).replace('T', ' ').substring(0, 19)
}

// 支付状态文字
// 暂时显示数据库中的原始状态值，避免在状态含义未确认时误导用户
const statusText = (status) => {
  if (status === null || status === undefined) {
    return '未知状态'
  }

  return `状态 ${status}`
}

// 支付状态标签
const statusType = (status) => {
  if (status === 1) return 'success'
  if (status === 0) return 'warning'
  return 'info'
}

onMounted(() => {
  loadPayments()
})
</script>

<style scoped>
.my-payments {
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

.el-card {
  border-radius: 8px;
}
</style>
```