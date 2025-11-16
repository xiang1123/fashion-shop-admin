<template>
  <a-layout has-sider class="layout-container">
    <!-- 侧边栏 -->
    <LayoutSider :collapsed="collapsed" />

    <!-- 页面主体 -->
    <a-layout>
      <!-- 头部 -->
      <LayoutHeader :collapsed="collapsed" @toggle="toggleCollapse" />

      <!-- 面包屑 -->
      <LayoutBreadcrumb />

      <!-- 内容区 -->
      <a-layout-content class="main-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LayoutHeader from '@/components/LayoutHeader.vue'
import LayoutSider from '@/components/LayoutSider.vue'
import LayoutBreadcrumb from '@/components/LayoutBreadcrumb.vue'

const collapsed = ref(false)

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  overflow: hidden;
}

.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  margin: 20px;
  flex: 1;
  overflow: hidden;
  padding: 0;
  background: #f0f2f5;
  border-radius: 10px;

  /* 多层阴影效果，营造立体感 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.06),
    0 8px 32px rgba(0, 0, 0, 0.04);

  /* 平滑过渡效果 */
  transition: box-shadow 0.3s ease;
}

.content-wrapper {
  height: 100%;
  padding: 24px;
  overflow-y: auto;
  background: #fff;
}

/* 自定义滚动条样式 */
.content-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.content-wrapper::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 4px;
}

.content-wrapper::-webkit-scrollbar-thumb {
  background: #bfbfbf;
  border-radius: 4px;
}

.content-wrapper::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>
