import 'ant-design-vue/dist/reset.css';
import { vDebounce, vThrottle } from '@/directives/debounce-throttle'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue';
import App from './App.vue'
import router from './router'
// 引入路由守卫
import './router/permission'

const app = createApp(App)
// 注册全局指令
app.directive('debounce', vDebounce)
app.directive('throttle', vThrottle)
app.use(createPinia())
app.use(router)
app.use(Antd)

app.mount('#app')
