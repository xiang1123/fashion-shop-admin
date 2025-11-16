<template>
  <div class="breadcrumb-container">
    <a-breadcrumb>
      <a-breadcrumb-item>
        <router-link to="/home">
          <home-outlined />
        </router-link>
      </a-breadcrumb-item>
      <a-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
        <router-link v-if="item.path && !item.isLast" :to="item.path">
          {{ item.title }}
        </router-link>
        <span v-else>{{ item.title }}</span>
      </a-breadcrumb-item>
    </a-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { HomeOutlined } from '@ant-design/icons-vue'

const route = useRoute()

interface BreadcrumbItem {
  title: string
  path?: string
  isLast?: boolean
}

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const matched = route.matched.filter((item) => item.meta && item.meta.title)
  
  return matched.map((item, index) => ({
    title: item.meta.title as string,
    path: item.path,
    isLast: index === matched.length - 1
  }))
})
</script>

<style scoped>
.breadcrumb-container {
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.ant-breadcrumb a) {
  color: rgba(0, 0, 0, 0.45);
}

:deep(.ant-breadcrumb a:hover) {
  color: #1890ff;
}
</style>
