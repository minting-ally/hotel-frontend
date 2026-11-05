<template>
  <div style="padding: 10px;">
    <h2>房型管理</h2>
    
    <el-form :inline="true" :model="form" style="margin-bottom: 20px;">
      <el-form-item label="房型名称">
        <el-input v-model="form.typeName" placeholder="例如: 豪华套房" />
      </el-form-item>
      <el-form-item label="每日价格">
        <el-input-number v-model="form.price" :min="0" :step="50" />
      </el-form-item>
      <el-form-item label="描述信息">
        <el-input v-model="form.description" placeholder="房型配套说明" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addType">添加房型</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" border style="width: 100%;">
      <el-table-column prop="id" label="房型ID" width="100" />
      <el-table-column prop="typeName" label="房型名称" width="180" />
      <el-table-column prop="price" label="价格(元/晚)" width="150" />
      <el-table-column prop="description" label="描述信息" />
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button type="danger" size="small" @click="deleteType(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const tableData = ref([])
const form = ref({ typeName: '', price: 200, description: '' })

const loadTypes = async () => {
  const res = await axios.get('http://localhost:8080/api/room-type/list')
  tableData.value = res.data
}

const addType = async () => {
  if (!form.value.typeName) {
    ElMessage.warning('请输入房型名称！')
    return
  }
  await axios.post('http://localhost:8080/api/room-type/add', form.value)
  ElMessage.success('房型添加成功！')
  form.value = { typeName: '', price: 200, description: '' }
  loadTypes()
}

const deleteType = async (id) => {
  await axios.delete(`http://localhost:8080/api/room-type/${id}`)
  ElMessage.success('删除成功！')
  loadTypes()
}

onMounted(() => {
  loadTypes()
})
</script>