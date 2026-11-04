```vue
<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h3 style="text-align: center; margin: 0;">
          酒店管理系统 - 登录
        </h3>
      </template>

      <el-form :model="form" label-width="70px">
        <el-form-item label="账号">
          <el-input
            v-model="form.username"
            placeholder="请输入账号"
          />
        </el-form-item>

        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            style="width: 100%;"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>

        <!-- 注册入口 -->
        <div class="register-link">
          还没有账号？
          <el-link type="primary" @click="goRegister">
            立即注册
          </el-link>
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

const form = ref({
  username: '',
  password: ''
})

const goRegister = () => {
  router.push('/register')
}

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning('请输入账号和密码！')
    return
  }

  try {
    const res = await request.post('/user/login', form.value)
    const result = res.data

    if (result.code === 200) {
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      localStorage.setItem('roles', JSON.stringify(result.roles || []))

      ElMessage.success('登录成功！')

      const roles = result.roles || []

      if (roles.includes('CONSUMER')) {
        router.push('/customer-home')
      } else if (
        roles.some(role =>
          [
            'ADMIN',
            'SUPER_ADMIN',
            'HOTEL_ADMIN',
            'FRONT_DESK',
            'HOUSEKEEPING',
            'FINANCE'
          ].includes(role)
        )
      ) {
        router.push('/home')
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('roles')

        ElMessage.error('账号角色暂不支持登录')
      }
    } else {
      ElMessage.error(result.msg || '账号或密码错误')
    }
  } catch (error) {
    console.error('登录失败：', error)
    ElMessage.error('登录请求失败，请检查后端是否启动')
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2d3a4b;
}

.login-card {
  width: 500px;
}

.register-link {
  text-align: center;
  margin-top: 5px;
  margin-bottom: 15px;
  color: #606266;
  font-size: 14px;
}
</style>
```