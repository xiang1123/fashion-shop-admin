<template>
  <div class="banner-container">
    <!-- 操作区域 -->
    <div class="action-area">
      <a-button type="primary" @click="handleAdd">
        <template #icon>
          <plus-outlined />
        </template>
        新增 Banner
      </a-button>
    </div>

    <!-- 表格区域 -->
    <div class="table-area">
      <a-table
        :columns="columns"
        :data-source="currentList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <!-- 图片列 -->
        <template #image="{ text }">
          <a-image
            :src="text"
            :width="100"
            :height="60"
            style="object-fit: cover; border-radius: 4px"
          />
        </template>

        <!-- 状态列 -->
        <template #status="{ text }">
          <a-tag :color="text === 1 ? 'green' : 'red'">
            {{ text === 1 ? '启用' : '禁用' }}
          </a-tag>
        </template>

        <!-- 操作列 -->
        <template #action="{ record }">
          <a-space>
            <a @click="handleEdit(record)">编辑</a>
            <a-popconfirm
              title="确定要删除这个 Banner 吗？"
              @confirm="handleDelete(record.id)"
            >
              <a style="color: #ff4d4f">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </div>

    <!-- 新增/编辑模态框 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      width="600px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="图片地址" name="image_url">
          <a-input
            v-model:value="formData.image_url"
            placeholder="请输入图片地址"
          />
          <div v-if="formData.image_url" class="image-preview">
            <a-image
              :src="formData.image_url"
              :width="200"
              style="margin-top: 8px; border-radius: 4px"
            />
          </div>
        </a-form-item>

        <a-form-item label="链接地址" name="link_url">
          <a-input
            v-model:value="formData.link_url"
            placeholder="请输入链接地址"
          />
        </a-form-item>

        <a-form-item label="排序" name="sort_order">
          <a-input-number
            v-model:value="formData.sort_order"
            :min="0"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="状态" name="is_active">
          <a-radio-group v-model:value="formData.is_active">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '@/api/banners'
import type { BannerInfo, BannerFormData } from '@/types/banner'
import type { FormInstance } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'

// 列表数据
const list = ref<BannerInfo[]>([])
const loading = ref(false)

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)

// 模态框
const modalVisible = ref(false)
const modalTitle = computed(() =>
  editingId.value ? '编辑 Banner' : '新增 Banner'
)
const editingId = ref<number | null>(null)

// 表单
const formRef = ref<FormInstance>()
const formData = reactive<BannerFormData>({
  image_url: '',
  link_url: '',
  sort_order: 0,
  is_active: 1,
})

// 表单验证规则
const rules = {
  image_url: [{ required: true, message: '请输入图片地址', trigger: 'blur' }],
  link_url: [{ required: true, message: '请输入链接地址', trigger: 'blur' }],
  sort_order: [{ required: true, message: '请输入排序', trigger: 'blur' }],
}

// 计算当前页数据
const currentList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return list.value.slice(start, end)
})

// 分页配置
const pagination = computed(() => ({
  total: list.value.length,
  current: currentPage.value,
  pageSize: pageSize.value,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100'],
}))

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '图片',
    dataIndex: 'image_url',
    width: 120,
    slots: { customRender: 'image' },
  },
  {
    title: '链接地址',
    dataIndex: 'link_url',
  },
  {
    title: '排序',
    dataIndex: 'sort_order',
    width: 100,
  },
  {
    title: '状态',
    dataIndex: 'is_active',
    width: 100,
    slots: { customRender: 'status' },
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    slots: { customRender: 'action' },
  },
]

// 获取列表
const fetchList = async () => {
  try {
    loading.value = true
    const res: any = await getBanners()

    if (res.code === 0 && res.data) {
      list.value = res.data
      // 如果当前页超出范围，重置到第一页
      if (currentPage.value > Math.ceil(list.value.length / pageSize.value)) {
        currentPage.value = 1
      }
    }
  } catch (error) {
    console.error('获取 Banner 列表失败:', error)
    message.error('获取 Banner 列表失败')
  } finally {
    loading.value = false
  }
}

// 表格变化
const handleTableChange = (pag: any) => {
  currentPage.value = pag.current
  pageSize.value = pag.pageSize
}

// 新增
const handleAdd = () => {
  editingId.value = null
  Object.assign(formData, {
    image_url: '',
    link_url: '',
    sort_order: 0,
    is_active: 1,
  })
  modalVisible.value = true
}

// 编辑
const handleEdit = (record: BannerInfo) => {
  editingId.value = record.id
  Object.assign(formData, {
    image_url: record.image_url,
    link_url: record.link_url,
    sort_order: record.sort_order,
    is_active: record.is_active,
  })
  modalVisible.value = true
}

// 提交
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    if (editingId.value) {
      // 编辑
      await updateBanner(editingId.value, formData)
      message.success('更新成功')
    } else {
      // 新增
      await createBanner(formData)
      message.success('创建成功')
    }

    modalVisible.value = false
    fetchList()
  } catch (error) {
    console.error('提交失败:', error)
  }
}

// 取消
const handleCancel = () => {
  modalVisible.value = false
  formRef.value?.resetFields()
}

// 删除
const handleDelete = async (id: number) => {
  try {
    await deleteBanner(id)
    message.success('删除成功')
    fetchList()
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败')
  }
}

// 初始化
onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.action-area {
  margin-bottom: 16px;
  padding: 16px 24px;
  background: #fff;
  border-radius: 4px;
}

.table-area {
  background: #fff;
  border-radius: 4px;
  padding: 24px;
}

.image-preview {
  margin-top: 8px;
}

:deep(.ant-form-item) {
  margin-bottom: 24px;
}
</style>
