```vue
<template>
  <div class="customer-home">
    <!-- 顶部导航 -->
    <el-header class="top-header">
      <div class="logo">酒店预订中心</div>

      <div class="user-info">
        欢迎，{{ username }}

        <el-button
          type="danger"
          plain
          size="small"
          @click="logout"
        >
          退出登录
        </el-button>
      </div>
    </el-header>

    <!-- 欢迎区域 -->
    <div class="welcome">
      <h1>欢迎来到酒店预订中心</h1>
      <p>为您提供舒适、便捷的住宿体验</p>

      <el-button
        type="primary"
        size="large"
        @click="goToRooms"
      >
        浏览客房
      </el-button>
    </div>

    <!-- 酒店服务 -->
    <div class="content">
      <h2>我的酒店服务</h2>

      <el-row :gutter="20">
        <!-- 客房预订 -->
        <el-col :xs="24" :sm="12" :md="6">
          <el-card
            shadow="hover"
            class="service-card"
            @click="goToRooms"
          >
            <h3>客房预订</h3>
            <p>浏览酒店房型，选择入住日期并预订客房。</p>
            <span class="more">立即查看 →</span>
          </el-card>
        </el-col>

        <!-- 我的订单 -->
        <el-col :xs="24" :sm="12" :md="6">
          <el-card
            shadow="hover"
            class="service-card"
            @click="goToBookings"
          >
            <h3>我的订单</h3>
            <p>查看自己的预订记录和订单状态。</p>
            <span class="more">查看订单 →</span>
          </el-card>
        </el-col>

        <!-- 个人中心 -->
        <el-col :xs="24" :sm="12" :md="6">
          <el-card
            shadow="hover"
            class="service-card"
            @click="goToProfile"
          >
            <h3>个人中心</h3>
            <p>查看和维护个人资料。</p>
            <span class="more">个人资料 →</span>
          </el-card>
        </el-col>

        <!-- 我的支付记录 -->
        <el-col :xs="24" :sm="12" :md="6">
          <el-card
            shadow="hover"
            class="service-card"
            @click="goToPayments"
          >
            <h3>我的支付记录</h3>
            <p>查看自己的支付金额、支付方式和交易记录。</p>
            <span class="more">查看支付记录 →</span>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 获取当前登录用户
const username = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.nickname || user.username || '消费者'
  } catch {
    return '消费者'
  }
})

// 浏览客房
const goToRooms = () => {
  router.push('/customer-rooms')
}

// 我的订单
const goToBookings = () => {
  router.push('/my-bookings')
}

// 个人中心
const goToProfile = () => {
  router.push('/my-profile')
}

// 我的支付记录
const goToPayments = () => {
  router.push('/my-payments')
}

// 退出登录
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('roles')
  router.push('/login')
}
</script>

<style scoped>
.customer-home {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 顶部导航 */
.top-header {
  height: 65px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.logo {
  font-size: 21px;
  font-weight: bold;
  color: #303133;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #606266;
}

/* 欢迎区域 */
.welcome {
  padding: 65px 20px;
  text-align: center;
  background: #eaf2ff;
}

.welcome h1 {
  font-size: 32px;
  color: #303133;
}

.welcome p {
  color: #606266;
  margin-bottom: 25px;
}

/* 服务区域 */
.content {
  max-width: 1100px;
  margin: 35px auto;
  padding: 0 20px;
}

.content h2 {
  margin-bottom: 25px;
}

.content h3 {
  color: #409eff;
}

.content p {
  color: #606266;
  line-height: 1.8;
}

.service-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.2s;
  height: 100%;
}

.service-card:hover {
  transform: translateY(-4px);
}

.more {
  display: inline-block;
  margin-top: 10px;
  color: #409eff;
  font-size: 14px;
}
</style>
```