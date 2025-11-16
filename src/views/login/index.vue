<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="https://api.dicebear.com/7.x/shapes/svg?seed=Logo" alt="Logo" />
        <h2>{{ title }}</h2>
      </div>

      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        @finish="handleSubmit"
      >
        <!-- 用户名 -->
        <a-form-item name="username">
          <a-input
            v-model:value="formData.username"
            placeholder="请输入用户名"
            size="large"
          >
            <template #prefix>
              <user-outlined />
            </template>
          </a-input>
        </a-form-item>

        <!-- 密码 -->
        <a-form-item name="password">
          <a-input-password
            v-model:value="formData.password"
            placeholder="请输入密码"
            size="large"
          >
            <template #prefix>
              <lock-outlined />
            </template>
          </a-input-password>
        </a-form-item>

        <!-- 记住我 -->
        <a-form-item>
          <a-checkbox v-model:checked="formData.remember">记住我</a-checkbox>
        </a-form-item>

        <!-- 登录按钮 -->
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            :loading="loading"
            block
          >
            登录
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import type { LoginParams } from '@/types/user'
import { getEnv } from '@/utils/env'

// 获取应用标题
const title = getEnv().VITE_APP_TITLE

// 路由
const router = useRouter()

// 用户状态管理
const userStore = useUserStore()

// 表单引用
const formRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 表单数据
const formData = reactive<LoginParams>({
  username: '',
  password: '',
  remember: false
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 提交表单
const handleSubmit = async () => {
  try {
    loading.value = true
    
    console.log('开始登录...')
    // 调用登录接口
    await userStore.login(formData)
    console.log('登录成功，准备跳转')
    
    // 登录成功提示
    message.success('登录成功')
    
    // 延迟跳转，确保提示显示
    setTimeout(() => {
      console.log('执行跳转')
      router.push('/')
    }, 300)
    
  } catch (error: any) {
    console.error('登录失败:', error)
    message.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>


<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header img {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
}

.login-header h2 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

:deep(.ant-form-item) {
  margin-bottom: 24px;
}

:deep(.ant-input-affix-wrapper) {
  padding: 8px 11px;
}

:deep(.ant-btn) {
  height: 40px;
  font-size: 16px;
}
</style>
