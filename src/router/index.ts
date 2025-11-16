import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import BasicLayout from '@/layouts/BasicLayout.vue'
import Home from '@/views/Home.vue'
import Categories from '@/views/categories/categories.vue'
import Products from '@/views/products/index.vue'
import Orders from '@/views/orders/index.vue'
import Banner from '@/views/banners/index.vue'
import User from '@/views/User/index.vue'
import NotFound from '@/views/NotFound.vue'
import Login from '@/views/login/index.vue'



export const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      hidden: true
    }
  },
  {
    path: '/',
    component: BasicLayout,
    redirect: '/home',
    children: [
      {
        path: '/home',
        name: 'Home',
        component: Home,
        meta: { title: '仪表盘', icon: 'dashboard' }
      },
      {
        path: '/categories',
        name: 'Categories',
        component: Categories,
        meta: { title: '分类管理', icon: 'appstore' }
      },
      {
        path: '/products',
        name: 'Products',
        component: Products,
        meta: { title: '商品管理', icon: 'shopping' }
      },
      {
        path: '/orders',
        name: 'Orders',
        component: Orders,
        meta: { title: '订单管理', icon: 'file-text' }
      },
      {
        path: '/banner',
        name: 'Banner',
        component: Banner,
        meta: { title: 'Banners管理', icon: 'picture' }
      },
      {
        path: '/user',
        name: 'User',
        component: User,
        meta: { title: '用户管理', icon: 'user' }
      }
    ]
  },
  // 404 页面路由 - 必须放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

export default router