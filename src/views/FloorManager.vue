<template>
  <div style="padding: 10px;">
    <h2>楼层管理</h2>
    
    <!-- 表单：添加楼层 -->
    <el-form :inline="true" :model="form">
      <el-form-item label="楼层编号">
        <el-input v-model="form.floorNumber" placeholder="例如: 1F, 2F" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" placeholder="例如: 豪华套房区" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addFloor">添加楼层</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格：展示楼层列表 -->
    <el-table :data="tableData" border style="width: 100%; margin-top: 20px;">
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column prop="floorNumber" label="楼层编号" />
      <el-table-column prop="remark" label="备注" />
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const tableData = ref([])
const form = ref({ floorNumber: '', remark: '' })

// 请求后端获取楼层列表
const loadData = async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/floor/list')
    tableData.value = res.data
  } catch (err) {
    console.error('获取数据失败:', err)
  }
}

// 添加楼层
const addFloor = async () => {
  if (!form.value.floorNumber) {
    ElMessage.warning('请输入楼层编号！')
    return
  }
  await axios.post('http://localhost:8080/api/floor/add', form.value)
  ElMessage.success('添加楼层成功！')
  form.value = { floorNumber: '', remark: '' }
  loadData()
}

onMounted(() => {
  loadData()
})
</script>