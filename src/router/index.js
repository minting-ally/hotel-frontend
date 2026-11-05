import { createRouter, createWebHashHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import AdminHome from '../views/AdminHome.vue'
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

// 保留数据库中现有的岗位角色，将其归并为三个登录后的页面身份
const CUSTOMER_ROLES = ['CONSUMER']
const STAFF_ROLES = ['FRONT_DESK', 'HOUSEKEEPING', 'FINANCE']
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'HOTEL_ADMIN']

const getHomePath = (roles = []) => {
  if (roles.some(role => ADMIN_ROLES.includes(role))) return '/admin-home'
  if (roles.some(role => STAFF_ROLES.includes(role))) return '/home'
  if (roles.some(role => CUSTOMER_ROLES.includes(role))) return '/customer-home'
  return '/login'
}

const routes = [
  { path: '/login', component: LoginView },
  { path: '/register', component: Register },

  // 消费者独立页面
  { path: '/customer-home', component: CustomerHome, meta: { roles: CUSTOMER_ROLES } },
  { path: '/customer-rooms', component: CustomerRooms, meta: { roles: CUSTOMER_ROLES } },
  { path: '/my-bookings', component: MyBookings, meta: { roles: CUSTOMER_ROLES } },
  { path: '/my-profile', component: MyProfile, meta: { roles: CUSTOMER_ROLES } },
  { path: '/my-payments', component: MyPayments, meta: { roles: CUSTOMER_ROLES } },

  // 前台员工独立工作台
  { path: '/home', component: HomeView, meta: { roles: STAFF_ROLES } },

  // 管理员独立首页
  { path: '/admin-home', component: AdminHome, meta: { roles: ADMIN_ROLES } },

  // 管理员基础资料管理
  { path: '/floor', component: FloorManager, meta: { roles: ADMIN_ROLES } },
  { path: '/room-type', component: RoomTypeManager, meta: { roles: ADMIN_ROLES } },

  // 客房管理：管理员和客房岗位可访问
  { path: '/room', component: RoomManager, meta: { roles: [...ADMIN_ROLES, 'HOUSEKEEPING'] } },

  // 客户管理：管理员和前台岗位可访问
  { path: '/customer', component: CustomerManager, meta: { roles: [...ADMIN_ROLES, 'FRONT_DESK'] } },

  // 根路径由登录状态和角色决定去向
  { path: '/', component: LoginView }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const publicPages = ['/login', '/register']

  if (to.path === '/') {
    if (!token) {
      next('/login')
      return
    }

    try {
      const roles = JSON.parse(localStorage.getItem('roles') || '[]')
      next(getHomePath(Array.isArray(roles) ? roles : []))
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('roles')
      next('/login')
    }
    return
  }

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

  const allowedRoles = to.meta.roles
  if (allowedRoles && !allowedRoles.some(role => roles.includes(role))) {
    next(getHomePath(roles))
    return
  }

  next()
})

export default router
