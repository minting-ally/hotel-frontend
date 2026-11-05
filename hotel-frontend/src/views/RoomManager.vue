<template>
  <div style="padding: 10px;">
    <h2>客房管理</h2>
    
    <el-form :inline="true" :model="form">
      <el-form-item label="房间号">
        <el-input v-model="form.roomNumber" placeholder="例如: 8101" />
      </el-form-item>
      <el-form-item label="所属楼层">
        <el-select v-model="form.floorId" placeholder="选择楼层" style="width: 150px;">
          <el-option v-for="item in floorList" :key="item.id" :label="item.floorNumber" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="房型ID">
        <el-input v-model="form.typeId" placeholder="房型ID(暂填1)" style="width: 120px;" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addRoom">添加房间</el-button>
      </el-form-item>
    </el-form>

    <!-- 房间表格 -->
    <el-table :data="tableData" border style="width: 100%; margin-top: 20px;">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="roomNumber" label="房间号" />
      <el-table-column prop="floorNumber" label="所属楼层" />
      <el-table-column prop="status" label="房间状态">
        <template #default="scope">
          <el-tag :type="getStatusTag(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="420">
        <template #default="scope">
          <!-- 0: 空闲 -> 办理预订、直接入住 -->
          <template v-if="scope.row.status === 0">
            <el-button type="primary" plain size="small" @click="openReserveDialog(scope.row)">办理预订</el-button>
            <el-button type="success" size="small" @click="openCheckInDialog(scope.row)">直接入住</el-button>
          </template>

          <!-- 1: 已预订 -> 预订转入住 -->
          <template v-if="scope.row.status === 1">
            <el-button type="success" size="small" @click="handleConfirmReserve(scope.row.id)">预订转入住</el-button>
          </template>

          <!-- 2: 已入住 -> 退房、换房、服务 -->
          <template v-if="scope.row.status === 2">
            <el-button type="danger" size="small" @click="handleCheckOut(scope.row.id)">退房结账</el-button>
            <el-button type="primary" size="small" @click="openChangeRoomDialog(scope.row)">换房</el-button>
            <el-button type="warning" size="small" @click="openServiceDialog(scope.row)">点餐/服务</el-button>
          </template>

          <!-- 3: 打扫中 -> 完成打扫 -->
          <el-button v-if="scope.row.status === 3" type="warning" size="small" @click="handleCleanComplete(scope.row.id)">完成打扫</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 办理入住/预订 通用对话框 -->
    <el-dialog v-model="dialogVisible" :title="isReserveMode ? '办理预订' : '办理直接入住'" width="500px">
      <el-form :model="bookingForm" label-width="80px">
        <el-form-item label="房间">
          <el-input :value="currentRoom.roomNumber" disabled />
        </el-form-item>
        <el-form-item label="客人姓名">
          <el-input v-model="bookingForm.guestName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="bookingForm.phone" placeholder="请输入电话号码" />
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="bookingForm.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="押金金额">
          <el-input-number v-model="bookingForm.deposit" :min="0" :step="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">{{ isReserveMode ? '确认预订' : '确认入住' }}</el-button>
      </template>
    </el-dialog>

    <!-- 换房对话框 -->
    <el-dialog v-model="changeRoomVisible" title="办理换房" width="500px">
      <el-form label-width="100px">
        <el-form-item label="当前房间">
          <el-input :value="currentRoom.roomNumber" disabled />
        </el-form-item>
        <el-form-item label="更换至">
          <el-select v-model="newRoomId" placeholder="请选择空闲房间" style="width: 100%;">
            <el-option v-for="room in freeRooms" :key="room.id" :label="room.roomNumber + ' (' + room.typeName + ')'" :value="room.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="changeRoomVisible = false">取消</el-button>
        <el-button type="primary" @click="submitChangeRoom">确认换房</el-button>
      </template>
    </el-dialog>

    <!-- 【新增】客房服务对话框 -->
    <el-dialog v-model="serviceVisible" title="登记客房服务" width="400px">
      <el-form label-width="80px">
        <el-form-item label="房间号">
          <el-input :value="currentRoom.roomNumber" disabled />
        </el-form-item>
        <el-form-item label="服务类型">
          <el-select v-model="serviceForm.serviceType" style="width: 100%;">
            <el-option label="送餐服务" value="送餐" />
            <el-option label="客房清洁" value="清洁" />
            <el-option label="叫醒服务" value="叫醒" />
            <el-option label="其他收费项目" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务费用">
          <el-input-number v-model="serviceForm.cost" :min="0" :step="10" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="serviceVisible = false">取消</el-button>
        <el-button type="primary" @click="submitService">确认登记</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([])
const floorList = ref([])
const form = ref({ roomNumber: '', floorId: '', typeId: 1 })

const dialogVisible = ref(false)
const currentRoom = ref({})
const bookingForm = ref({ guestName: '', phone: '', idCard: '', deposit: 200 })

const isReserveMode = ref(false)
const changeRoomVisible = ref(false)
const newRoomId = ref(null)
const bookingList = ref([])

// 【新增】客房服务变量
const serviceVisible = ref(false)
const serviceForm = ref({ serviceType: '送餐', cost: 0 })

const loadRooms = async () => {
  const res = await axios.get('http://localhost:8080/api/room/list')
  tableData.value = res.data
}

const loadFloors = async () => {
  const res = await axios.get('http://localhost:8080/api/floor/list')
  floorList.value = res.data
}

const loadBookings = async () => {
  const res = await axios.get('http://localhost:8080/api/booking/list')
  bookingList.value = res.data
}

const addRoom = async () => {
  if (!form.value.roomNumber || !form.value.floorId) {
    ElMessage.warning('请填写完整的房间信息！')
    return
  }
  await axios.post('http://localhost:8080/api/room/add', form.value)
  ElMessage.success('添加房间成功！')
  form.value.roomNumber = ''
  loadRooms()
}

// ========== 预订与入住 ==========

const openReserveDialog = (room) => {
  currentRoom.value = room
  bookingForm.value = { guestName: '', phone: '', idCard: '', deposit: 200 }
  isReserveMode.value = true
  dialogVisible.value = true
}

const openCheckInDialog = (room) => {
  currentRoom.value = room
  bookingForm.value = { guestName: '', phone: '', idCard: '', deposit: 200 }
  isReserveMode.value = false
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!bookingForm.value.guestName || !bookingForm.value.phone) {
    ElMessage.warning('请填写完整的客人信息！')
    return
  }
  
  const url = isReserveMode.value 
    ? 'http://localhost:8080/api/booking/reserve' 
    : 'http://localhost:8080/api/booking/check-in'

  try {
    await axios.post(url, {
      roomId: currentRoom.value.id,
      ...bookingForm.value
    })
    ElMessage.success(isReserveMode.value ? '预订成功！' : '入住办理成功！')
    dialogVisible.value = false
    loadRooms()
    loadBookings()
  } catch (err) {
    ElMessage.error(err.response?.data || '操作失败')
  }
}

const handleConfirmReserve = async (roomId) => {
  const activeBooking = bookingList.value.find(b => b.roomId === roomId && b.status === 0)
  if (!activeBooking) {
    ElMessage.error('找不到该房间的预订订单！')
    return
  }
  try {
    await axios.post(`http://localhost:8080/api/booking/confirm-reserve/${activeBooking.id}`)
    ElMessage.success('预订转入住成功！')
    loadRooms()
    loadBookings()
  } catch (err) {
    ElMessage.error(err.response?.data || '操作失败')
  }
}

// ========== 客房服务 ==========

const openServiceDialog = (room) => {
  currentRoom.value = room
  serviceForm.value = { serviceType: '送餐', cost: 0 }
  serviceVisible.value = true
}

const submitService = async () => {
  try {
    // 1. 登记服务
    await axios.post('http://localhost:8080/api/service/add', {
      roomId: currentRoom.value.id,
      serviceType: serviceForm.value.serviceType,
      cost: serviceForm.value.cost
    })
    
    // 2. 为了直接在退房时算账，这里自动模拟服务员已处理完成
    const res = await axios.get(`http://localhost:8080/api/service/list/${currentRoom.value.id}`)
    const pending = res.data.find(s => s.status === 0)
    if (pending) {
      await axios.post(`http://localhost:8080/api/service/complete/${pending.id}`)
    }
    
    ElMessage.success('服务已登记，费用已挂账！')
    serviceVisible.value = false
  } catch (err) {
    ElMessage.error('登记失败')
  }
}

// ========== 退房与打扫 ==========

const handleCheckOut = (roomId) => {
  ElMessageBox.confirm('确认要为该房间办理退房结算吗？服务费会一并算入总金额。', '退房确认', {
    type: 'warning'
  }).then(async () => {
    try {
      await axios.post(`http://localhost:8080/api/booking/check-out/${roomId}`)
      ElMessage.success('退房成功！')
      loadRooms()
      loadBookings()
    } catch (err) {
      ElMessage.error(err.response?.data || '退房失败')
    }
  }).catch(() => {})
}

const handleCleanComplete = async (roomId) => {
  try {
    await axios.post(`http://localhost:8080/api/booking/clean-complete/${roomId}`)
    ElMessage.success('房间保洁完毕，已恢复可预订状态！')
    loadRooms()
  } catch (err) {
    ElMessage.error(err.response?.data || '操作失败')
  }
}

// ========== 换房 ==========

const openChangeRoomDialog = (room) => {
  currentRoom.value = room
  newRoomId.value = null
  changeRoomVisible.value = true
}

const freeRooms = computed(() => {
  return tableData.value.filter(r => r.status === 0 && r.id !== currentRoom.value.id)
})

const submitChangeRoom = async () => {
  if (!newRoomId.value) {
    ElMessage.warning('请选择要换入的房间！')
    return
  }
  const activeBooking = bookingList.value.find(b => b.roomId === currentRoom.value.id && b.status === 1)
  if (!activeBooking) {
    ElMessage.error('该房间没有进行中的入住订单，无法换房！')
    return
  }

  try {
    await axios.post('http://localhost:8080/api/booking/change-room', null, {
      params: { bookingId: activeBooking.id, newRoomId: newRoomId.value }
    })
    ElMessage.success('换房成功！')
    changeRoomVisible.value = false
    loadRooms()
    loadBookings()
  } catch (err) {
    ElMessage.error(err.response?.data || '换房失败')
  }
}

// ========== 工具函数 ==========

const getStatusText = (status) => {
  const map = { 0: '空闲', 1: '已预订', 2: '已入住', 3: '打扫中', 4: '维修中' }
  return map[status] || '未知'
}

const getStatusTag = (status) => {
  const map = { 0: 'success', 1: 'warning', 2: 'danger', 3: 'info', 4: 'info' }
  return map[status] || ''
}

onMounted(() => {
  loadFloors()
  loadRooms()
  loadBookings()
})
</script>