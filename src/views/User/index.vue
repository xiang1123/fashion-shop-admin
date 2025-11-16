<template>
  <div class="user-container">
    <!-- 表格区域 -->
    <div class="table-area">
      <a-table
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <!-- 状态列 -->
        <template #status="{ text }">
          <a-tag :color="text === 'ACTIVE' ? 'green' : 'red'">
            {{ text === 'ACTIVE' ? '正常' : '禁用' }}
          </a-tag>
        </template>

        <!-- 操作列 -->
        <template #action="{ record }">
          <a-space>
            <a @click="handleView(record)">查看</a>
          </a-space>
        </template>
      </a-table>
    </div>

    <!-- 用户详情模态框 -->
    <a-modal
      v-model:visible="modalVisible"
      title="用户详情"
      width="600px"
      :footer="null"
    >
      <div v-if="currentUser" class="user-detail-modal">
        <div class="user-header">
          <a-avatar :size="80">
            <template #icon>
              <user-outlined />
            </template>
          </a-avatar>
          <div class="user-info">
            <h3>{{ currentUser.nickname }}</h3>
            <a-tag :color="currentUser.status === 'ACTIVE' ? 'green' : 'red'">
              {{ currentUser.status === 'ACTIVE' ? '正常' : '禁用' }}
            </a-tag>
          </div>
        </div>

        <a-divider />

        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="用户ID">
            {{ currentUser.id }}
          </a-descriptions-item>
          <a-descriptions-item label="昵称">
            {{ currentUser.nickname }}
          </a-descriptions-item>
          <a-descriptions-item label="邮箱">
            <a-space>
              <mail-outlined />
              {{ currentUser.email }}
            </a-space>
          </a-descriptions-item>
          <a-descriptions-item label="手机号">
            <a-space>
              <phone-outlined />
              {{ currentUser.phone || '未设置' }}
            </a-space>
          </a-descriptions-item>
          <a-descriptions-item label="账户状态">
            <a-tag :color="currentUser.status === 'ACTIVE' ? 'green' : 'red'">
              {{ currentUser.status === 'ACTIVE' ? '正常' : '禁用' }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getUser, getUserDetail } from '@/api/user'

// 列表数据
const list = ref([])
const total = ref(0)
const loading = ref(false)

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)

// 当前用户详情
const currentUser: any = ref(null)

// 模态框可见性
const modalVisible = ref(false)

// 表格列定义
const columns = [
  {
    title: '头像',
    key: 'avatar',
    width: 80,
    slots: { customRender: 'avatar' },
  },
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '昵称',
    dataIndex: 'nickname',
  },
  {
    title: '邮箱',
    dataIndex: 'email',
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    customRender: ({ text }: { text: string | null }) => text || '未设置',
  },
  {
    title: '状态',
    dataIndex: 'status',
    slots: { customRender: 'status' },
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    slots: { customRender: 'action' },
  },
]

// 分页配置
const pagination = computed(() => ({
  total: total.value,
  current: currentPage.value,
  pageSize: pageSize.value,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`,
}))

// 获取用户列表
const fetchList = async () => {
  try {
    loading.value = true
    const res: any = await getUser({
      page: currentPage.value,
      pageSize: pageSize.value,
    })

    console.log('API 响应:', res)

    // 解析响应数据
    if (res.code === 0 && res.data) {
      list.value = res.data.list || []
      total.value = res.data.total || 0
      // console.log('用户列表:', list.value)
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    message.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleTableChange = (pag: any) => {
  currentPage.value = pag.current
  pageSize.value = pag.pageSize
  fetchList()
}

//查看用户详情
const handleView = async (record: any) => {
  try {
    const res: any = await getUserDetail(record.id)
    // console.log('用户详情', res)

    if (res.code === 0 && res.data) {
      currentUser.value = res.data
      modalVisible.value = true
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
    message.error('获取用户详情失败')
  }
}

// 初始化
onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.user-container {
  padding: 24px;
}

.search-area {
  margin-bottom: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 4px;
}

.table-area {
  background: #fff;
  border-radius: 4px;
}

.user-detail {
  padding: 24px;
}
</style>
