<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h3 class="login-title">酒店管理系统 - 登录</h3>
      </template>

      <el-form :model="form" label-width="70px" @submit.prevent>
        <el-form-item label="账号">
          <el-input v-model.trim="form.username" placeholder="请输入账号" autocomplete="username" />
        </el-form-item>

        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            autocomplete="current-password"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" style="width: 100%;" :loading="loading" @click="handleLogin">
            登 录
          </el-button>
        </el-form-item>

        <div class="register-link">
          还没有账号？
          <el-link type="primary" @click="goRegister">立即注册</el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import request from '../utils/request.js'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)

const form = ref({
  username: '',
  password: ''
})

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'HOTEL_ADMIN']
const STAFF_ROLES = ['FRONT_DESK', 'HOUSEKEEPING', 'FINANCE']
const CUSTOMER_ROLES = ['CONSUMER']

// 管理员、前台员工、消费者分别进入不同首页
const getHomePath = (roles = []) => {
  if (roles.some(role => ADMIN_ROLES.includes(role))) return '/admin-home'
  if (roles.some(role => STAFF_ROLES.includes(role))) return '/home'
  if (roles.some(role => CUSTOMER_ROLES.includes(role))) return '/customer-home'
  return null
}

const goRegister = () => {
  router.push('/register')
}

const clearLoginInfo = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('roles')
}

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning('请输入账号和密码')
    return
  }

  if (loading.value) return
  loading.value = true

  try {
    const res = await request.post('/user/login', form.value)
    const result = res.data

    if (result.code !== 200) {
      ElMessage.error(result.msg || '账号或密码错误')
      return
    }

    const roles = Array.isArray(result.roles) ? result.roles : []
    const homePath = getHomePath(roles)

    if (!result.token || !homePath) {
      clearLoginInfo()
      ElMessage.error('账号未分配有效角色，请联系管理员')
      return
    }

    localStorage.setItem('token', result.token)
    localStorage.setItem('user', JSON.stringify(result.user || {}))
    localStorage.setItem('roles', JSON.stringify(roles))

    ElMessage.success('登录成功')
    await router.replace(homePath)
  } catch (error) {
    console.error('登录失败：', error)
    ElMessage.error(error.response?.data?.msg || '登录请求失败，请检查后端服务')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #e8f0ff, #f5f7fa);
}

.login-card {
  width: 440px;
  max-width: 100%;
}

.login-title {
  text-align: center;
  margin: 0;
}

.register-link {
  text-align: center;
  margin-top: 5px;
  margin-bottom: 15px;
  color: #606266;
  font-size: 14px;
}
</style>
