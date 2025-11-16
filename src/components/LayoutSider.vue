<template>
  <a-layout-sider 
    :collapsed="collapsed" 
    :trigger="null" 
    collapsible
    width="200"
  >
    <div class="logo">
      <img src="https://api.dicebear.com/7.x/shapes/svg?seed=Logo" alt="Logo" />
      <span v-if="!collapsed">Admin</span>
    </div>

    <a-menu
      theme="dark"
      mode="inline"
      :selected-keys="selectedKeys"
      :open-keys="openKeys"
      @openChange="handleOpenChange"
    >
      <template v-for="route in menuRoutes" :key="route.path">
        <!-- 有子菜单 -->
        <a-sub-menu v-if="route.children && route.children.length > 0" :key="route.path">
          <template #icon>
            <component :is="getIcon(route.meta?.icon)" />
          </template>
          <template #title>{{ route.meta?.title }}</template>
          <a-menu-item
            v-for="child in route.children"
            :key="child.path"
          >
            <router-link :to="child.path">
              {{ child.meta?.title }}
            </router-link>
          </a-menu-item>
        </a-sub-menu>

        <!-- 无子菜单 -->
        <a-menu-item v-else :key="route.path">
          <template #icon>
            <component :is="getIcon(route.meta?.icon)" />
          </template>
          <router-link :to="route.path">
            {{ route.meta?.title }}
          </router-link>
        </a-menu-item>
      </template>
    </a-menu>
  </a-layout-sider>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  DashboardOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  PictureOutlined,
  UserOutlined
} from '@ant-design/icons-vue'

defineProps<{
  collapsed: boolean
}>()

const router = useRouter()
const route = useRoute()

const openKeys = ref<string[]>([])

// 获取菜单路由
const menuRoutes = computed(() => {
  const routes = router.options.routes.find(r => r.path === '/')
  return routes?.children || []
})

// 计算当前选中的菜单项
const selectedKeys = computed(() => {
  return [route.path]
})

// 获取图标
const getIcon = (iconName?: string) => {
  const iconMap: Record<string, any> = {
    'dashboard': DashboardOutlined,
    'appstore': AppstoreOutlined,
    'shopping': ShoppingOutlined,
    'file-text': FileTextOutlined,
    'picture': PictureOutlined,
    'user': UserOutlined
  }
  return iconMap[iconName || 'dashboard']
}

// 处理子菜单展开/收起
const handleOpenChange = (keys: string[]) => {
  openKeys.value = keys
}

// 监听路由变化，自动展开对应的子菜单
watch(
  () => route.path,
  (newPath) => {
    // 查找父级菜单
    const parentRoute = menuRoutes.value.find(r => {
      if (r.children && r.children.length > 0) {
        return r.children.some(child => child.path === newPath)
      }
      return false
    })
    
    if (parentRoute) {
      openKeys.value = [parentRoute.path]
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.2);
}
.logo img {
  width: 32px;
  height: 32px;
}
.logo span {
  color: white;
  font-size: 18px;
  font-weight: bold;
}

/* 菜单链接样式 */
:deep(.ant-menu-item a) {
  color: inherit;
  text-decoration: none;
}

:deep(.ant-menu-item a:hover) {
  color: inherit;
}
</style>
