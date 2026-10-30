<template>
  <div v-if="$route.path === '/login'">
    <router-view />
  </div>

  <el-container v-else style="height: 100vh;">
    <!-- 左侧侧边栏 -->
    <el-aside width="200px" style="background-color: #304156; color: #fff; display: flex; flex-direction: column;">
      <h3 style="text-align: center; color: #fff; padding: 15px 0; margin: 0; border-bottom: 1px solid #43586d;">
        酒店管理系统
      </h3>
      <el-menu
        active-text-color="#409EFF"
        background-color="#304156"
        text-color="#fff"
        :default-active="$route.path"
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

      <!-- 底部登录用户信息与退出登录 -->
      <div style="padding: 15px; border-top: 1px solid #43586d; text-align: center;">
        <div style="margin-bottom: 10px; font-size: 14px;">管理员：{{ currentUser }}</div>
        <el-button type="danger" size="small" style="width: 100%;" @click="handleLogout">退出登录</el-button>
      </div>
    </el-aside>

    <!-- 右侧主内容区域 -->
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

const updateUserInfo = () => {
  const userJson = localStorage.getItem('user')
  if (userJson) {
    const user = JSON.parse(userJson)
    currentUser.value = user.nickname || user.username
  }
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(() => {
  updateUserInfo()
})

watch(() => route.path, () => {
  updateUserInfo()
})
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}
</style>