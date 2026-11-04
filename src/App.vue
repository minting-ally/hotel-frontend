<template>
  <!-- 登录和注册页面 -->
  <div v-if="['/login', '/register'].includes(route.path)">
    <router-view />
  </div>

  <!-- 消费者网站页面 -->
  <div
    v-else-if="
      route.path.startsWith('/customer-') ||
      route.path === '/my-bookings' ||
      route.path === '/my-profile' ||
      route.path === '/my-payments'
    "
  >
    <router-view />
  </div>

  <!-- 酒店员工管理后台 -->
  <el-container v-else style="height: 100vh;">
    <el-aside
      width="200px"
      style="
        background-color: #304156;
        color: #fff;
        display: flex;
        flex-direction: column;
      "
    >
      <h3
        style="
          text-align: center;
          color: #fff;
          padding: 15px 0;
          margin: 0;
          border-bottom: 1px solid #43586d;
        "
      >
        酒店管理系统
      </h3>

      <!-- 员工后台菜单 -->
      <el-menu
        active-text-color="#409EFF"
        background-color="#304156"
        text-color="#fff"
        :default-active="route.path"
        router
        style="flex: 1;"
      >
        <el-menu-item index="/home">
          <span>系统总览</span>
        </el-menu-item>

        <el-menu-item index="/floor">
          <span>楼层管理</span>
        </el-menu-item>

        <el-menu-item index="/room-type">
          <span>房型管理</span>
        </el-menu-item>

        <el-menu-item index="/room">
          <span>客房管理</span>
        </el-menu-item>

        <el-menu-item index="/customer">
          <span>客户管理</span>
        </el-menu-item>
      </el-menu>

      <!-- 用户信息和退出登录 -->
      <div
        style="
          padding: 15px;
          border-top: 1px solid #43586d;
          text-align: center;
        "
      >
        <div style="margin-bottom: 10px; font-size: 14px;">
          {{ currentRole }}：{{ currentUser }}
        </div>

        <el-button
          type="danger"
          size="small"
          style="width: 100%;"
          @click="handleLogout"
        >
          退出登录
        </el-button>
      </div>
    </el-aside>

    <!-- 右侧内容区域 -->
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const currentUser = ref('')
const currentRole = ref('当前用户')

// 根据登录信息更新用户名称和角色
const updateUserInfo = () => {
  try {
    const user = JSON.parse(
      localStorage.getItem('user') || '{}'
    )

    const roles = JSON.parse(
      localStorage.getItem('roles') || '[]'
    )

    currentUser.value =
      user.nickname || user.username || '未知用户'

    const roleNames = {
      ADMIN: '系统管理员',
      SUPER_ADMIN: '超级管理员',
      HOTEL_ADMIN: '酒店管理员',
      FRONT_DESK: '前台员工',
      HOUSEKEEPING: '客房员工',
      FINANCE: '财务员工',
      CONSUMER: '消费者'
    }

    currentRole.value =
      roles.map(role => roleNames[role]).find(Boolean) ||
      '当前用户'
  } catch (error) {
    console.error('读取用户信息失败：', error)
    currentUser.value = '未知用户'
    currentRole.value = '当前用户'
  }
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('roles')

  router.push('/login')
}

onMounted(() => {
  updateUserInfo()
})

watch(
  () => route.path,
  () => {
    updateUserInfo()
  }
)
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}
</style>