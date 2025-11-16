<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <!-- 404 插图 -->
      <div class="illustration">
        <svg viewBox="0 0 200 200" class="svg-404">
          <text x="50%" y="50%" class="text-404">404</text>
        </svg>
      </div>

      <!-- 错误信息 -->
      <h1 class="title">页面不存在</h1>
      <p class="description">
        抱歉，您访问的页面不存在或已被删除
      </p>

      <!-- 操作按钮 -->
      <div class="actions">
        <a-button type="primary" size="large" @click="goHome">
          <home-outlined />
          返回首页
        </a-button>
        <a-button size="large" @click="goBack">
          <rollback-outlined />
          返回上一页
        </a-button>
      </div>

      <!-- 建议链接 -->
      <div class="suggestions">
        <p class="suggestions-title">您可能在寻找：</p>
        <div class="suggestion-links">
          <router-link to="/home" class="suggestion-link">
            <dashboard-outlined />
            仪表盘
          </router-link>
          <router-link to="/categories" class="suggestion-link">
            <appstore-outlined />
            分类管理
          </router-link>
          <router-link to="/products" class="suggestion-link">
            <shopping-outlined />
            商品管理
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  HomeOutlined,
  RollbackOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  ShoppingOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/home')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.not-found-container {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.not-found-content {
  text-align: center;
  max-width: 600px;
  width: 100%;
  background: #fff;
  border-radius: 16px;
  padding: 60px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* 404 插图 */
.illustration {
  margin-bottom: 32px;
}

.svg-404 {
  width: 200px;
  height: 200px;
  filter: drop-shadow(0 10px 20px rgba(102, 126, 234, 0.3));
}

.text-404 {
  font-size: 80px;
  font-weight: 900;
  fill: #667eea;
  dominant-baseline: middle;
  text-anchor: middle;
  font-family: 'Arial Black', sans-serif;
}

/* 标题和描述 */
.title {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px;
}

.description {
  font-size: 16px;
  color: #666;
  margin: 0 0 32px;
  line-height: 1.6;
}

/* 操作按钮 */
.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 40px;
}

.actions :deep(.ant-btn) {
  min-width: 140px;
}

/* 建议链接 */
.suggestions {
  padding-top: 32px;
  border-top: 1px solid #f0f0f0;
}

.suggestions-title {
  font-size: 14px;
  color: #999;
  margin: 0 0 16px;
}

.suggestion-links {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.suggestion-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 6px;
  color: #666;
  text-decoration: none;
  transition: all 0.3s;
  font-size: 14px;
}

.suggestion-link:hover {
  background: #667eea;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 响应式 */
@media (max-width: 768px) {
  .not-found-content {
    padding: 40px 24px;
  }

  .svg-404 {
    width: 150px;
    height: 150px;
  }

  .text-404 {
    font-size: 60px;
  }

  .title {
    font-size: 24px;
  }

  .actions {
    flex-direction: column;
  }

  .actions :deep(.ant-btn) {
    width: 100%;
  }

  .suggestion-links {
    flex-direction: column;
  }

  .suggestion-link {
    width: 100%;
    justify-content: center;
  }
}
</style>
