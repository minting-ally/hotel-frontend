```vue
<template>
  <div class="register-page">
    <div class="register-card">
      <h2>酒店会员注册</h2>
      <p class="subtitle">注册账号，开启舒适入住体验</p>

      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="姓名" prop="name">
          <el-input
            v-model="registerForm.name"
            placeholder="请输入真实姓名"
          />
        </el-form-item>

        <el-form-item label="手机号码" prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入手机号码"
            maxlength="11"
          />
        </el-form-item>

        <el-form-item label="身份证号码" prop="idCard">
          <el-input
            v-model="registerForm.idCard"
            placeholder="请输入18位身份证号码"
            maxlength="18"
          />
        </el-form-item>

        <el-form-item label="登录密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            show-password
            placeholder="请输入8到72位密码"
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入密码"
          />
        </el-form-item>

        <el-button
          type="primary"
          class="register-button"
          :loading="loading"
          @click="handleRegister"
        >
          立即注册
        </el-button>
      </el-form>

      <div class="login-link">
        已有账号？
        <el-link type="primary" @click="goLogin">返回登录</el-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const router = useRouter()
const registerFormRef = ref(null)
const loading = ref(false)

// 注册表单数据
const registerForm = reactive({
  name: '',
  phone: '',
  idCard: '',
  password: '',
  confirmPassword: ''
})

// 确认密码验证
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const rules = {
  name: [
    {
      required: true,
      message: '请输入姓名',
      trigger: 'blur'
    }
  ],

  phone: [
    {
      required: true,
      message: '请输入手机号码',
      trigger: 'blur'
    },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur'
    }
  ],

  idCard: [
    {
      required: true,
      message: '请输入身份证号码',
      trigger: 'blur'
    },
    {
      pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])([0-2][1-9]|10|20|30|31)\d{3}[0-9Xx]$/,
      message: '请输入正确的18位身份证号码',
      trigger: 'blur'
    }
  ],

  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'blur'
    },
    {
      min: 8,
      max: 72,
      message: '密码长度必须为8到72位',
      trigger: 'blur'
    }
  ],

  confirmPassword: [
    {
      required: true,
      message: '请再次输入密码',
      trigger: 'blur'
    },
    {
      validator: validateConfirmPassword,
      trigger: 'blur'
    }
  ]
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return

  // 验证表单
  try {
    await registerFormRef.value.validate()
  } catch {
    return
  }

  loading.value = true

  try {
    // 发送注册请求
    const response = await request.post(
      '/user/register',
      registerForm
    )

    // 关键修复：从 response.data 中读取后端数据
    const result = response.data

    console.log('注册接口返回：', result)

    if (result.code === 200) {
      ElMessage.success('注册成功，请登录')

      // 注册成功后跳转登录页面
      router.push('/login')
    } else {
      ElMessage.error(result.msg || '注册失败')
    }

  } catch (error) {
    console.error('注册请求异常：', error)

    ElMessage.error(
      error.response?.data?.msg ||
      '注册失败，请检查网络或稍后重试'
    )

  } finally {
    loading.value = false
  }
}

// 返回登录页面
const goLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #e8f0ff, #f5f7fa);
  padding: 30px 15px;
}

.register-card {
  width: 420px;
  max-width: 100%;
  padding: 32px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

h2 {
  text-align: center;
  margin: 0 0 10px;
  color: #303133;
}

.subtitle {
  text-align: center;
  color: #909399;
  margin-bottom: 25px;
}

.register-button {
  width: 100%;
  margin-top: 10px;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #606266;
}
</style>
```