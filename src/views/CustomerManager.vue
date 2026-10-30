<template>
  <div>
    <el-card>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3>客户档案与关怀管理</h3>
        <el-button type="primary" @click="openDialog">新增客户档案</el-button>
      </div>

      <el-table :data="customerList" border style="width: 100%">
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="idCard" label="身份证号" width="180" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="level" label="会员等级" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.level === '钻石VIP' ? 'danger' : 'warning'">{{ scope.row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="可用积分" width="100" />
        <el-table-column prop="remark" label="关怀备注 / 偏好喜好" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增客户弹窗 -->
    <el-dialog v-model="dialogVisible" title="新增客户档案" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="姓名"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="身份证号"><el-input v-model="form.idCard" /></el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.gender">
            <el-radio value="男">男</el-radio>
            <el-radio value="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="会员等级">
          <el-select v-model="form.level" style="width: 100%;">
            <el-option label="普通会员" value="普通会员" />
            <el-option label="VIP" value="VIP" />
            <el-option label="钻石VIP" value="钻石VIP" />
          </el-select>
        </el-form-item>
        <el-form-item label="关怀/喜好">
          <el-input v-model="form.remark" type="textarea" placeholder="例：喜好高层靠窗房间、对花粉过敏等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const customerList = ref([])
const dialogVisible = ref(false)
const form = ref({ name: '', phone: '', idCard: '', gender: '男', level: '普通会员', points: 0, remark: '' })

const loadData = async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/customer/list')
    customerList.value = res.data
  } catch (err) {
    console.error(err)
  }
}

const openDialog = () => {
  form.value = { name: '', phone: '', idCard: '', gender: '男', level: '普通会员', points: 0, remark: '' }
  dialogVisible.value = true
}

const submitForm = async () => {
  await axios.post('http://localhost:8080/api/customer/add', form.value)
  ElMessage.success('客户档案添加成功')
  dialogVisible.value = false
  loadData()
}

const handleDelete = async (id) => {
  await axios.delete(`http://localhost:8080/api/customer/delete/${id}`)
  ElMessage.success('已删除')
  loadData()
}

onMounted(() => { loadData() })
</script>