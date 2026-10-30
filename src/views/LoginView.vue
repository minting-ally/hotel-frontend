<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h3 style="text-align: center; margin: 0;">酒店管理系统 - 登录</h3>
      </template>
      <el-form :model="form" label-width="70px">
        <el-form-item label="账号">
          <el-input v-model="form.username" placeholder="请输入账号(admin)" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码(123456)" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%;" @click="handleLogin">登 录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const router = useRouter()
const form = ref({ username: '', password: '' })

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning('请输入账号和密码！')
    return
  }
  const res = await axios.post('http://localhost:8080/api/user/login', form.value)
  if (res.data.code === 200) {
    ElMessage.success('登录成功！')
    // 存储 Token 和用户信息
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    router.push('/home')
  } else {
    ElMessage.error(res.data.msg)
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
  width: 400px;
}
</style>