import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'


export const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: ()=> import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      hidden: true
    }
  },
  {
    path: '/',
    component: ()=> import('@/layouts/BasicLayout.vue'),
    redirect: '/home',
    children: [
      {
        path: '/home',
        name: 'Home',
        component: ()=> import('@/views/Home.vue'),
        meta: { title: '仪表盘', icon: 'dashboard' }
      },
      {
        path: '/categories',
        name: 'Categories',
        component: ()=> import('@/views/categories/categories.vue'),
        meta: { title: '分类管理', icon: 'appstore' }
      },
      {
        path: '/products',
        name: 'Products',
        component: () => import('@/views/products/index.vue'),
        meta: { title: '商品管理', icon: 'shopping' }
      },
      {
        path: '/orders',
        name: 'Orders',
        component: ()=> import('@/views/orders/index.vue'),
        meta: { title: '订单管理', icon: 'file-text' }
      },
      {
        path: '/banner',
        name: 'Banner',
        component: ()=> import('@/views/banners/index.vue'),
        meta: { title: 'Banners管理', icon: 'picture' }
      },
      {
        path: '/user',
        name: 'User',
        component: ()=> import('@/views/User/index.vue'),
        meta: { title: '用户管理', icon: 'user' }
      }
    ]
  },
  // 404 页面路由 - 必须放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: ()=> import('@/views/NotFound.vue'),
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

export default router