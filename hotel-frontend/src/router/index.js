import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import FloorManager from '../views/FloorManager.vue'
import RoomManager from '../views/RoomManager.vue'
import RoomTypeManager from '../views/RoomTypeManager.vue'
import LoginView from '../views/LoginView.vue'
// 1. 引入客户管理组件
import CustomerManager from '../views/CustomerManager.vue'

const routes = [
  { path: '/login', component: LoginView },
  { path: '/', redirect: '/home' },
  { path: '/home', component: HomeView },
  { path: '/floor', component: FloorManager },
  { path: '/room', component: RoomManager },
  { path: '/room-type', component: RoomTypeManager },
  // 2. 添加客户管理路由
  { path: '/customer', component: CustomerManager },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 全局前置路由守卫：校验登录状态
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    // 未登录且访问非登录页，强制跳转到登录页
    next('/login')
  } else {
    next()
  }
})

export default router