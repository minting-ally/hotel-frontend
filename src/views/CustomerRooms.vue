
<template>
  <div class="rooms-page">
    <div class="page-header">
      <div>
        <h2>客房预订</h2>
        <p>选择适合您的房型，开启舒适入住体验</p>
      </div>

      <el-button @click="router.push('/customer-home')">
        返回首页
      </el-button>
    </div>

    <!-- 入住日期选择 -->
    <el-card class="date-card" shadow="never">
      <h3>选择入住日期</h3>

      <div class="date-select">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="入住日期"
          end-placeholder="退房日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :disabled-date="disabledDate"
          :clearable="true"
        />

        <div
          v-if="dateRange && dateRange.length === 2"
          class="night-info"
        >
          <span>入住时间：{{ dateRange[0] }}</span>
          <span>退房时间：{{ dateRange[1] }}</span>
          <span class="night-count">共入住 {{ nights }} 晚</span>
        </div>

        <div v-else class="date-tip">
          请先选择入住日期和退房日期
        </div>
      </div>
    </el-card>

    <!-- 房型列表 -->
    <div v-loading="loading" class="room-list">
      <el-empty
        v-if="!loading && roomTypes.length === 0"
        description="暂时没有可展示的房型"
      />

      <el-row :gutter="20">
        <el-col
          v-for="room in roomTypes"
          :key="room.id"
          :xs="24"
          :sm="12"
          :md="8"
        >
          <el-card class="room-card" shadow="hover">
            <div class="room-image">
              <el-icon :size="55">
                <House />
              </el-icon>
              <span>酒店客房</span>
            </div>

            <div class="room-info">
              <h3>{{ room.typeName }}</h3>

              <p class="description">
                {{ room.description || '舒适整洁，为您提供良好的入住体验' }}
              </p>

              <!-- 可用数量 -->
              <div class="availability">
                <template
                  v-if="!dateRange || dateRange.length !== 2"
                >
                  <span class="availability-tip">
                    选择日期后查询空房
                  </span>
                </template>

                <template v-else-if="room.availabilityLoading">
                  <span class="availability-tip">
                    正在查询可用数量...
                  </span>
                </template>

                <template v-else-if="room.availableCount === null">
                  <span class="availability-tip">
                    暂时无法获取空房数量
                  </span>
                </template>

                <template v-else-if="room.availableCount > 0">
                  <span class="available">
                    可预订 {{ room.availableCount }} 间
                  </span>
                </template>

                <template v-else>
                  <span class="unavailable">暂无空房</span>
                </template>
              </div>

              <div class="room-bottom">
                <div class="price">
                  <span>¥{{ room.price }}</span>
                  <small>/晚</small>
                </div>

                <el-button
                  type="primary"
                  :disabled="
                    !dateRange ||
                    dateRange.length !== 2 ||
                    room.availabilityLoading ||
                    room.availableCount === null ||
                    room.availableCount <= 0
                  "
                  @click="selectRoom(room)"
                >
                  选择此房型
                </el-button>
              </div>

              <!-- 已选择房型及确认预订 -->
              <div
                v-if="selectedRoom && selectedRoom.id === room.id"
                class="selected-info"
              >
                <p>已选择：{{ selectedRoom.typeName }}</p>
                <p>入住日期：{{ dateRange[0] }}</p>
                <p>退房日期：{{ dateRange[1] }}</p>
                <p>入住晚数：{{ nights }} 晚</p>
                <p>预计房费：¥{{ estimatedPrice }}</p>

                <el-button
                  type="success"
                  style="width: 100%; margin-top: 10px"
                  :loading="bookingLoading"
                  @click="confirmBooking"
                >
                  确认预订
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { House } from '@element-plus/icons-vue'
import request from '../utils/request.js'

const router = useRouter()

const loading = ref(false)
const bookingLoading = ref(false)

const roomTypes = ref([])

// 入住和退房日期
const dateRange = ref([])

// 当前选择的房型
const selectedRoom = ref(null)

// 用于避免较早发出的查询覆盖较新的查询结果
let querySequence = 0

// 禁止选择今天之前的日期
const disabledDate = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return date < today
}

// 计算入住晚数
const nights = computed(() => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    return 0
  }

  const checkIn = new Date(dateRange.value[0] + 'T00:00:00')
  const checkOut = new Date(dateRange.value[1] + 'T00:00:00')

  const difference = checkOut.getTime() - checkIn.getTime()

  return Math.max(
    0,
    Math.round(difference / (1000 * 60 * 60 * 24))
  )
})

// 计算预计房费
const estimatedPrice = computed(() => {
  if (!selectedRoom.value) {
    return 0
  }

  return Number(selectedRoom.value.price) * nights.value
})

// 查询所有房型的可用数量
const getAvailability = async () => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    return
  }

  if (nights.value <= 0) {
    ElMessage.warning('退房日期必须晚于入住日期')
    return
  }

  const currentSequence = ++querySequence

  // 重置各房型查询状态
  roomTypes.value.forEach(room => {
    room.availabilityLoading = true
    room.availableCount = null
  })

  selectedRoom.value = null

  await Promise.all(
    roomTypes.value.map(async (room) => {
      try {
        const response = await request.get('/booking/available-count', {
          params: {
            typeId: room.id,
            checkIn: dateRange.value[0],
            checkOut: dateRange.value[1]
          }
        })

        // 如果已经有更新的查询，就不使用这次旧结果
        if (currentSequence !== querySequence) {
          return
        }

        const result = response.data

        if (result && result.code === 200) {
          room.availableCount = Number(result.availableCount)
        } else {
          room.availableCount = null
        }
      } catch (error) {
        console.error(
          `查询房型 ${room.typeName} 可用数量失败：`,
          error
        )

        if (currentSequence === querySequence) {
          room.availableCount = null
        }
      } finally {
        if (currentSequence === querySequence) {
          room.availabilityLoading = false
        }
      }
    })
  )
}

// 日期变化后自动查询
watch(dateRange, (newValue) => {
  selectedRoom.value = null

  if (newValue && newValue.length === 2) {
    getAvailability()
  } else {
    querySequence++

    roomTypes.value.forEach(room => {
      room.availableCount = null
      room.availabilityLoading = false
    })
  }
})

// 选择房型
const selectRoom = (room) => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    ElMessage.warning('请先选择入住日期和退房日期')
    return
  }

  if (nights.value <= 0) {
    ElMessage.warning('退房日期必须晚于入住日期')
    return
  }

  if (room.availableCount === null || room.availableCount <= 0) {
    ElMessage.warning('该房型暂无可预订客房')
    return
  }

  selectedRoom.value = room

  ElMessage.success('房型选择成功')
}

// 消费者确认在线预订
const confirmBooking = async () => {
  if (bookingLoading.value) {
    return
  }

  if (!selectedRoom.value) {
    ElMessage.warning('请先选择房型')
    return
  }

  if (!dateRange.value || dateRange.value.length !== 2) {
    ElMessage.warning('请先选择入住和退房日期')
    return
  }

  if (nights.value <= 0) {
    ElMessage.warning('退房日期必须晚于入住日期')
    return
  }

  try {
    bookingLoading.value = true

    const response = await request.post('/booking/consumer-reserve', {
      typeId: selectedRoom.value.id,
      expectedCheckIn: dateRange.value[0],
      expectedCheckOut: dateRange.value[1]
    })

    const result = response.data

    if (
      typeof result === 'string' &&
      result.includes('在线预订成功')
    ) {
      ElMessage.success('预订成功！')

      selectedRoom.value = null

      // 重新查询房型可用数量
      await getAvailability()
    } else {
      ElMessage.error(
        typeof result === 'string'
          ? result
          : '预订失败，请稍后重试'
      )
    }
  } catch (error) {
    console.error('在线预订失败：', error)

    ElMessage.error(
      error.response?.data?.message ||
      '预订失败，请检查登录状态后重试'
    )
  } finally {
    bookingLoading.value = false
  }
}

// 从后端获取房型数据
const getRoomTypes = async () => {
  loading.value = true

  try {
    const response = await request.get('/room-type/list')

    roomTypes.value = (response.data || []).map(room => ({
      ...room,
      availableCount: null,
      availabilityLoading: false
    }))

    if (dateRange.value && dateRange.value.length === 2) {
      getAvailability()
    }
  } catch (error) {
    console.error('获取房型失败：', error)
    ElMessage.error('获取房型失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getRoomTypes()
})
</script>

<style scoped>
.rooms-page {
  min-height: 100vh;
  padding: 30px;
  background: #f5f7fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h2 {
  margin: 0 0 10px;
  color: #303133;
}

.page-header p {
  color: #909399;
}

.date-card {
  margin-bottom: 25px;
  border-radius: 10px;
}

.date-card h3 {
  margin-top: 0;
  color: #303133;
}

.date-select {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;
}

.night-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  color: #606266;
  font-size: 14px;
}

.night-count {
  color: #409eff;
  font-weight: bold;
}

.date-tip,
.availability-tip {
  color: #909399;
  font-size: 14px;
}

.availability {
  min-height: 30px;
  margin: 12px 0;
  font-size: 14px;
}

.available {
  color: #67c23a;
  font-weight: bold;
}

.unavailable {
  color: #f56c6c;
  font-weight: bold;
}

.room-card {
  margin-bottom: 22px;
  border-radius: 10px;
  overflow: hidden;
}

.room-image {
  height: 180px;
  background: #eaf2ff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  color: #409eff;
}

.room-info {
  padding: 8px 2px;
}

.room-info h3 {
  font-size: 19px;
  color: #303133;
}

.description {
  min-height: 45px;
  color: #909399;
  line-height: 1.7;
}

.room-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.price {
  color: #f56c6c;
  white-space: nowrap;
}

.price span {
  font-size: 25px;
  font-weight: bold;
}

.price small {
  font-size: 13px;
}

.selected-info {
  margin-top: 15px;
  padding: 10px;
  background: #f0f9eb;
  border-radius: 6px;
  color: #67c23a;
  font-size: 14px;
}

.selected-info p {
  margin: 5px 0;
}
</style>
