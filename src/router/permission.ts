import router from './index'
import { useUserStore } from '@/stores/user'
import { getToken } from '@/utils/token'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 配置进度条
NProgress.configure({ showSpinner: false })

// 白名单路由
const whiteList = ['/login']

router.beforeEach(async (to, from, next) => {
  // 开始进度条
  NProgress.start()

  // 获取 token
  const hasToken = getToken()

  if (hasToken) {
    // 有 token 的情况
    if (to.path === '/login') {
      // 如果已登录，重定向到首页
      next({ path: '/' })
      NProgress.done()
    } else {
      // 直接放行
      next()
    }
  } else {
    // 没有 token 的情况
    if (whiteList.includes(to.path)) {
      // 在白名单中，直接放行
      next()
    } else {
      // 不在白名单中，重定向到登录页
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // 结束进度条
  NProgress.done()
})