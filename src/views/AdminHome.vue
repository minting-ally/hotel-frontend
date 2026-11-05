<template>
  <div class="admin-dashboard">
    <div class="page-heading">
      <div>
        <h2>管理员工作台</h2>
        <p>在这里维护酒店基础资料、账号和客房信息。</p>
      </div>
      <el-tag type="warning" effect="light">管理员</el-tag>
    </div>

    <el-row :gutter="16">
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card shadow="hover" class="module-card">
          <el-icon class="module-icon"><OfficeBuilding /></el-icon>
          <h3>楼层管理</h3>
          <p>维护酒店楼层基础信息。</p>
          <el-button type="primary" plain @click="go('/floor')">进入管理</el-button>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="8">
        <el-card shadow="hover" class="module-card">
          <el-icon class="module-icon"><House /></el-icon>
          <h3>房型管理</h3>
          <p>维护房型名称、价格及相关资料。</p>
          <el-button type="primary" plain @click="go('/room-type')">进入管理</el-button>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="8">
        <el-card shadow="hover" class="module-card">
          <el-icon class="module-icon"><Key /></el-icon>
          <h3>客房管理</h3>
          <p>查看和维护酒店客房资料。</p>
          <el-button type="primary" plain @click="go('/room')">进入管理</el-button>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="8">
        <el-card shadow="hover" class="module-card">
          <el-icon class="module-icon"><User /></el-icon>
          <h3>客户管理</h3>
          <p>查看酒店客户档案。</p>
          <el-button type="primary" plain @click="go('/customer')">进入管理</el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { OfficeBuilding, House, Key, User } from '@element-plus/icons-vue'

const router = useRouter()
const go = path => router.push(path)
</script>

<style scoped>
.admin-dashboard {
  padding: 8px;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 22px;
}

.page-heading h2 {
  margin: 0 0 8px;
  color: #303133;
}

.page-heading p {
  margin: 0;
  color: #909399;
}

.module-card {
  margin-bottom: 16px;
  min-height: 190px;
}

.module-icon {
  font-size: 28px;
  color: #409eff;
}

.module-card h3 {
  margin: 12px 0 8px;
}

.module-card p {
  min-height: 22px;
  color: #909399;
}
</style>
