import { createRouter, createWebHashHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import FloorManager from '../views/FloorManager.vue'
import RoomManager from '../views/RoomManager.vue'
import RoomTypeManager from '../views/RoomTypeManager.vue'
import LoginView from '../views/LoginView.vue'
import Register from '../views/Register.vue'
import CustomerManager from '../views/CustomerManager.vue'

// 消费者页面
import CustomerHome from '../views/CustomerHome.vue'
import CustomerRooms from '../views/CustomerRooms.vue'
import MyBookings from '../views/MyBookings.vue'
import MyProfile from '../views/MyProfile.vue'
import MyPayments from '../views/MyPayments.vue'

const routes = [
  {
    path: '/login',
    component: LoginView
  },
  {
    path: '/register',
    component: Register
  },

  // 消费者首页
  {
    path: '/customer-home',
    component: CustomerHome,
    meta: { roles: ['CONSUMER'] }
  },

  // 消费者客房列表
  {
    path: '/customer-rooms',
    component: CustomerRooms,
    meta: { roles: ['CONSUMER'] }
  },

  // 消费者我的订单
  {
    path: '/my-bookings',
    component: MyBookings,
    meta: { roles: ['CONSUMER'] }
  },

  // 消费者个人资料
  {
    path: '/my-profile',
    component: MyProfile,
    meta: { roles: ['CONSUMER'] }
  },

  // 消费者支付记录
  {
    path: '/my-payments',
    component: MyPayments,
    meta: { roles: ['CONSUMER'] }
  },

  // 酒店员工管理首页
  {
    path: '/home',
    component: HomeView,
    meta: {
      roles: [
        'ADMIN',
        'SUPER_ADMIN',
        'HOTEL_ADMIN',
        'FRONT_DESK',
        'HOUSEKEEPING',
        'FINANCE'
      ]
    }
  },

  // 楼层管理
  {
    path: '/floor',
    component: FloorManager,
    meta: {
      roles: ['ADMIN', 'SUPER_ADMIN', 'HOTEL_ADMIN']
    }
  },

  // 客房管理
  {
    path: '/room',
    component: RoomManager,
    meta: {
      roles: [
        'ADMIN',
        'SUPER_ADMIN',
        'HOTEL_ADMIN',
        'HOUSEKEEPING'
      ]
    }
  },

  // 房型管理
  {
    path: '/room-type',
    component: RoomTypeManager,
    meta: {
      roles: ['ADMIN', 'SUPER_ADMIN', 'HOTEL_ADMIN']
    }
  },

  // 客户管理
  {
    path: '/customer',
    component: CustomerManager,
    meta: {
      roles: [
        'ADMIN',
        'SUPER_ADMIN',
        'HOTEL_ADMIN',
        'FRONT_DESK'
      ]
    }
  },

  {
    path: '/',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由权限检查
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const publicPages = ['/login', '/register']

  if (publicPages.includes(to.path)) {
    next()
    return
  }

  if (!token) {
    next('/login')
    return
  }

  let roles = []

  try {
    roles = JSON.parse(localStorage.getItem('roles') || '[]')
  } catch {
    roles = []
  }

  if (!Array.isArray(roles) || roles.length === 0) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('roles')
    next('/login')
    return
  }

  const isConsumer = roles.includes('CONSUMER')

  if (to.path === '/') {
    next(isConsumer ? '/customer-home' : '/home')
    return
  }

  const allowedRoles = to.meta.roles

  if (
    allowedRoles &&
    !allowedRoles.some(role => roles.includes(role))
  ) {
    next(isConsumer ? '/customer-home' : '/home')
    return
  }

  next()
})

export default router