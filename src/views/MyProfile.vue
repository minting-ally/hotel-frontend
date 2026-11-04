<template>
  <div class="profile-page">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人资料</span>
        </div>
      </template>

      <el-form
        ref="profileFormRef"
        :model="profile"
        :rules="rules"
        label-width="100px"
        v-loading="loading"
      >
        <el-form-item label="用户名">
          <el-input v-model="profile.username" disabled />
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="profile.nickname"
            placeholder="请输入昵称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="profile.phone"
            placeholder="请输入手机号"
            maxlength="20"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="saving"
            @click="saveProfile"
          >
            保存修改
          </el-button>

          <el-button @click="loadProfile">
            重新加载
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const loading = ref(false)
const saving = ref(false)
const profileFormRef = ref(null)

const profile = reactive({
  username: '',
  nickname: '',
  phone: ''
})

const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { max: 50, message: '昵称不能超过50个字符', trigger: 'blur' }
  ],
  phone: [
    { max: 20, message: '手机号不能超过20个字符', trigger: 'blur' }
  ]
}

// 查询个人资料
const loadProfile = async () => {
  loading.value = true

  try {
    const res = await request.get('/user/profile')
    const data = res.data?.data || res.data

    profile.username = data.username || ''
    profile.nickname = data.nickname || ''
    profile.phone = data.phone || ''
  } catch (error) {
    ElMessage.error(
      error.response?.data?.message || '获取个人资料失败'
    )
  } finally {
    loading.value = false
  }
}

// 保存个人资料
const saveProfile = async () => {
  if (!profileFormRef.value) return

  try {
    await profileFormRef.value.validate()
  } catch {
    return
  }

  saving.value = true

  try {
    await request.put('/user/profile', {
      nickname: profile.nickname,
      phone: profile.phone
    })

    ElMessage.success('个人资料修改成功')
    await loadProfile()
  } catch (error) {
    ElMessage.error(
      error.response?.data?.message || '保存个人资料失败'
    )
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 30px;
  background: #f5f7fa;
}

.profile-card {
  max-width: 650px;
  margin: 20px auto;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}
</style>