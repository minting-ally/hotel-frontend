<template>
  <!-- 登录和注册页面 -->
  <div v-if="['/login', '/register'].includes(route.path)">
    <router-view />
  </div>

  <!-- 消费者独立网站 -->
  <div v-else-if="isCustomerPage">
    <router-view />
  </div>

  <!-- 管理员和员工分别使用不同菜单 -->
  <el-container v-else style="height: 100vh;">
    <el-aside width="210px" class="sidebar">
      <h3 class="sidebar-title">酒店管理系统</h3>

      <el-menu
        active-text-color="#409EFF"
        background-color="#304156"
        text-color="#fff"
        :default-active="route.path"
        router
        class="sidebar-menu"
      >
        <template v-if="isAdmin">
          <el-menu-item index="/admin-home"><span>管理首页</span></el-menu-item>
          <el-menu-item index="/floor"><span>楼层管理</span></el-menu-item>
          <el-menu-item index="/room-type"><span>房型管理</span></el-menu-item>
          <el-menu-item index="/room"><span>客房管理</span></el-menu-item>
          <el-menu-item index="/customer"><span>客户管理</span></el-menu-item>
        </template>

        <template v-else-if="isStaff">
          <el-menu-item index="/home"><span>前台工作台</span></el-menu-item>
          <el-menu-item v-if="roles.includes('HOUSEKEEPING')" index="/room">
            <span>客房管理</span>
          </el-menu-item>
          <el-menu-item v-if="roles.includes('FRONT_DESK')" index="/customer">
            <span>客户管理</span>
          </el-menu-item>
        </template>
      </el-menu>

      <div class="user-footer">
        <div class="user-label">{{ currentRole }}：{{ currentUser }}</div>
        <el-button type="danger" size="small" class="logout-button" @click="handleLogout">
          退出登录
        </el-button>
      </div>
    </el-aside>

    <el-main class="main-content">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const currentUser = ref('')
const currentRole = ref('当前用户')
const roles = ref([])

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'HOTEL_ADMIN']
const STAFF_ROLES = ['FRONT_DESK', 'HOUSEKEEPING', 'FINANCE']

const isAdmin = computed(() => roles.value.some(role => ADMIN_ROLES.includes(role)))
const isStaff = computed(() => roles.value.some(role => STAFF_ROLES.includes(role)))
const isCustomerPage = computed(() =>
  route.path.startsWith('/customer-') ||
  ['/my-bookings', '/my-profile', '/my-payments'].includes(route.path)
)

const updateUserInfo = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const storedRoles = JSON.parse(localStorage.getItem('roles') || '[]')

    roles.value = Array.isArray(storedRoles) ? storedRoles : []
    currentUser.value = user.nickname || user.username || '未知用户'

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
      roles.value.map(role => roleNames[role]).find(Boolean) || '当前用户'
  } catch (error) {
    console.error('读取用户信息失败：', error)
    roles.value = []
    currentUser.value = '未知用户'
    currentRole.value = '当前用户'
  }
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('roles')
  roles.value = []
  router.replace('/login')
}

onMounted(updateUserInfo)
watch(() => route.path, updateUserInfo)
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

.sidebar {
  background-color: #304156;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  text-align: center;
  color: #fff;
  padding: 18px 0;
  margin: 0;
  border-bottom: 1px solid #43586d;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
}

.user-footer {
  padding: 15px;
  border-top: 1px solid #43586d;
  text-align: center;
}

.user-label {
  margin-bottom: 10px;
  font-size: 14px;
  color: #fff;
}

.logout-button {
  width: 100%;
}

.main-content {
  min-width: 0;
  background: #f5f7fa;
}
</style>
