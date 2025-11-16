<template>
  <div class="category-container">
    <!-- 操作区域 -->
    <div class="action-area">
      <a-button type="primary" @click="handleAdd" v-debounce:click.300>
        <template #icon>
          <plus-outlined />
        </template>
        新增分类
      </a-button>
    </div>

    <!-- 表格区域 -->
    <div class="table-area">
      <!-- 骨架屏 -->
      <a-skeleton
        v-if="loading"
        active
        :paragraph="{ rows: 6 }"
        :title="{ width: '40%' }"
      />

      <!-- 空状态 -->
      <a-empty v-else-if="treeData.length === 0" description="暂无分类数据">
        <template #image>
          <svg style="width: 64px; height: 64px" viewBox="64 864 864 864">
            <path
              fill="#e6e6e6"
              d="M832 64H192c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zm-600 72h560v208H232V136zm560 480H232V416h560v200zm-262-256H232v-72h298v72z"
            />
          </svg>
        </template>
        <a-button type="primary" @click="handleAdd">立即创建</a-button>
      </a-empty>

      <!-- 表格 -->
      <a-table
        v-else
        :columns="columns"
        :data-source="treeData"
        :loading="loading"
        :pagination="false"
        row-key="id"
        :expandable="{ defaultExpandAllRows: true }"
      >
        <!-- 可见性列 -->
        <template #visible="{ text }">
          <a-tag :color="text === 1 ? 'green' : 'red'">
            {{ text === 1 ? '显示' : '隐藏' }}
          </a-tag>
        </template>

        <!-- 层级列 -->
        <template #level="{ text }">
          <a-tag :color="text === 1 ? 'blue' : 'cyan'">
            {{ text === 1 ? '一级分类' : '二级分类' }}
          </a-tag>
        </template>

        <!-- 名称列（XSS防护）-->
        <template #name="{ text }">
          <div v-html="sanitizeHtml(text)"></div>
        </template>

        <!-- 操作列 -->
        <template #action="{ record }">
          <a-space>
            <a
              v-if="record.level === 1"
              @click="handleAddChild(record)"
              v-debounce:click.300
            >
              添加子分类
            </a>
            <a @click="handleEdit(record)" v-debounce:click.300>编辑</a>
            <a-popconfirm
              title="确定要删除这个分类吗？"
              @confirm="handleDelete(record.id)"
              v-debounce:confirm.300
            >
              <template #description>
                <div style="max-width: 300px">
                  <p style="margin: 0">删除后将无法恢复</p>
                  <p style="margin: 8px 0 0; color: #ff4d4f; font-size: 12px">
                    注意：如果该分类下有商品，将无法删除
                  </p>
                </div>
              </template>
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
      v-debounce:ok.300
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="上级分类" name="parent_id">
          <a-tree-select
            v-model:value="formData.parent_id"
            :tree-data="parentOptions"
            placeholder="请选择上级分类（不选则为一级分类）"
            allow-clear
            tree-default-expand-all
            v-debounce:change.300
          />
        </a-form-item>

        <a-form-item label="分类名称" name="name">
          <a-input
            v-model:value="formData.name"
            placeholder="请输入分类名称"
            v-debounce:input.300
          />
        </a-form-item>

        <a-form-item label="排序" name="sort_order">
          <a-input-number
            v-model:value="formData.sort_order"
            placeholder="请输入排序值"
            :min="0"
            style="width: 100%"
            v-debounce:change.300
          />
        </a-form-item>

        <a-form-item label="是否显示" name="is_visible">
          <a-radio-group v-model:value="formData.is_visible">
            <a-radio :value="1">显示</a-radio>
            <a-radio :value="0">隐藏</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import DOMPurify from 'dompurify'
import {
  getCategoryList,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/api/category'
import type { CategoryInfo, CategoryFormData } from '@/types/category'
import type { FormInstance } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'

// 列表数据
const list = ref<CategoryInfo[]>([])
const loading = ref(false)

// 模态框
const modalVisible = ref(false)
const modalTitle = computed(() => (editingId.value ? '编辑分类' : '新增分类'))
const editingId = ref<number | null>(null)

// 表单
const formRef = ref<FormInstance>()
const formData = reactive<CategoryFormData>({
  parent_id: null,
  name: '',
  level: 1,
  sort_order: 0,
  is_visible: 1,
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  sort_order: [{ required: true, message: '请输入排序值', trigger: 'blur' }],
}

// XSS防护函数
const sanitizeHtml = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: [],
  })
}

// 表格列定义
const columns = [
  { title: 'ID', dataIndex: 'id', width: 120 },
  { title: '分类名称', dataIndex: 'name', slots: { customRender: 'name' } },
  {
    title: '层级',
    dataIndex: 'level',
    width: 120,
    slots: { customRender: 'level' },
  },
  { title: '排序', dataIndex: 'sort_order', width: 100 },
  {
    title: '是否显示',
    dataIndex: 'is_visible',
    width: 100,
    slots: { customRender: 'visible' },
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right',
    slots: { customRender: 'action' },
  },
]

// 构建树形数据
const treeData = computed(() => {
  const tree: CategoryInfo[] = []
  const map = new Map<number, CategoryInfo>()

  // 先创建所有节点的映射
  list.value.forEach((item) => {
    map.set(item.id, { ...item, children: [] })
  })

  // 构建树形结构
  map.forEach((item) => {
    if (item.parent_id === null) {
      tree.push(item)
    } else {
      const parent = map.get(item.parent_id)
      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(item)
      }
    }
  })

  return tree
})

// 上级分类选项（仅一级分类）
const parentOptions = computed(() => {
  return list.value
    .filter((item) => item.level === 1)
    .map((item) => ({
      value: item.id,
      title: sanitizeHtml(item.name),
      key: item.id,
    }))
})

// 获取分类列表
const fetchList = async () => {
  try {
    loading.value = true
    const res: any = await getCategoryList()

    if (res.code === 0 && res.data) {
      list.value = res.data
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    message.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

// 新增分类
const handleAdd = () => {
  editingId.value = null
  Object.assign(formData, {
    parent_id: null,
    name: '',
    level: 1,
    sort_order: 0,
    is_visible: 1,
  })
  modalVisible.value = true
}

// 添加子分类
const handleAddChild = (record: CategoryInfo) => {
  editingId.value = null
  Object.assign(formData, {
    parent_id: record.id,
    name: '',
    level: 2,
    sort_order: 0,
    is_visible: 1,
  })
  modalVisible.value = true
}

// 编辑分类
const handleEdit = (record: CategoryInfo) => {
  editingId.value = record.id
  Object.assign(formData, {
    parent_id: record.parent_id,
    name: record.name,
    level: record.level,
    sort_order: record.sort_order,
    is_visible: record.is_visible,
  })
  modalVisible.value = true
}

// 提交
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    // 根据 parent_id 自动设置 level
    formData.level = formData.parent_id ? 2 : 1

    if (editingId.value) {
      await updateCategory(editingId.value, formData)
      message.success('更新成功')
    } else {
      await createCategory(formData)
      message.success('创建成功')
    }

    modalVisible.value = false
    fetchList()
  } catch (error: any) {
    console.error('提交失败:', error)
    const errorMsg = error.response?.data?.message || '提交失败'
    message.error(errorMsg)
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
    await deleteCategory(id)
    message.success('删除成功')
    fetchList()
  } catch (error: any) {
    console.error('删除失败:', error)

    const status = error.response?.status
    const errorMsg = error.response?.data?.message

    if (status === 500 && errorMsg?.includes('foreign key constraint')) {
      message.error({
        content:
          '删除失败：该分类下存在商品或子分类，无法删除。请先处理相关数据。',
        duration: 5,
      })
    } else if (errorMsg) {
      message.error(errorMsg)
    } else {
      message.error('删除失败，请稍后重试')
    }
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
  min-height: 400px;
}

:deep(.ant-form-item) {
  margin-bottom: 24px;
}

:deep(.ant-empty) {
  margin: 60px 0;
}

:deep(.ant-skeleton) {
  padding: 24px;
}
</style>
