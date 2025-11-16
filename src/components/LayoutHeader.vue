<template>
  <a-layout-header class="header">
    <div class="header-left">
      <menu-unfold-outlined
        v-if="collapsed"
        class="trigger"
        @click="handleToggle"
      />
      <menu-fold-outlined v-else class="trigger" @click="handleToggle" />
      <span class="site-title">后台管理系统</span>
    </div>

    <div class="header-right">
      <a-space :size="20">
        <a-badge :count="0">
          <bell-outlined class="icon" />
        </a-badge>

        <a-dropdown>
          <div class="user-info">
            <a-avatar :src="avatar">
              <template #icon>
                <user-outlined />
              </template>
            </a-avatar>
            <span class="username">{{ displayName }}</span>
            <down-outlined class="arrow-icon" />
          </div>
          <template #overlay>
            <a-menu @click="handleMenuClick">
              <!--  <a-menu-item key="/user/profile">
                <user-outlined />
                个人中心
              </a-menu-item>
              <a-menu-item key="/user/settings">
                <setting-outlined />
                账户设置
              </a-menu-item>
              <a-menu-divider /> -->
              <a-menu-item key="logout">
                <logout-outlined />
                退出登录
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </a-space>
    </div>
  </a-layout-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const router = useRouter()
const userStore = useUserStore()

const displayName = computed(() => {
  return userStore.nickname || userStore.username || '管理员'
})

// 计算头像地址
const avatar = computed(() => {
  return userStore.avatar || 'https://api.dicebear.com/7.x/miniavs/svg?seed=1'
})

const handleToggle = () => {
  emit('toggle')
}

const handleMenuClick = ({ key }: { key: string }) => {
  if (key === 'logout') {
    userStore.logout()
    message.success('退出登录成功')
    return router.push('/login')
  }
}
</script>

<style scoped>
.header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.site-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
}

.icon {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
}

.icon:hover {
  color: #1890ff;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.username {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow-icon {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  transition: transform 0.3s;
}

.user-info:hover .arrow-icon {
  color: rgba(0, 0, 0, 0.85);
}
</style>
