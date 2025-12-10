<template>
  <div class="app-container">
    <a-card :bordered="false" class="main-card">
      <div class="header-wrapper">
        <div class="title">分类管理</div>
        <div class="action">
          <a-button type="primary" @click="handleAdd" v-debounce:click.300>
            <template #icon>
              <plus-outlined />
            </template>
            新增分类
          </a-button>
        </div>
      </div>

      <div class="table-wrapper">
        <a-skeleton
          v-if="loading"
          active
          :paragraph="{ rows: 6 }"
          :title="{ width: '40%' }"
        />

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

        <a-table
          v-else
          :columns="columns"
          :data-source="treeData"
          :loading="loading"
          :pagination="false"
          row-key="id"
          :expandable="{ defaultExpandAllRows: true }"
          size="middle"
        >
          <template #id="{ text }">
            <span class="id-tag">#{{ text }}</span>
          </template>

          <template #visible="{ text }">
            <a-badge
              :status="text === 1 ? 'success' : 'default'"
              :text="text === 1 ? '显示' : '隐藏'"
            />
          </template>

          <template #level="{ text }">
            <a-tag :color="text === 1 ? 'blue' : 'cyan'">
              {{ text === 1 ? '一级' : '二级' }}
            </a-tag>
          </template>

          <template #name="{ text, record }">
            <span :class="{ 'font-bold': record.level === 1 }">
              <span v-html="sanitizeHtml(text)"></span>
            </span>
          </template>

          <template #action="{ record }">
            <a-space :size="16">
              <a
                v-if="record.level === 1"
                @click="handleAddChild(record)"
                v-debounce:click.300
                style="color: #1890ff"
              >
                添加子分类
              </a>
              <a @click="handleEdit(record)" v-debounce:click.300>编辑</a>
              <a-popconfirm
                title="确定要删除这个分类吗？"
                @confirm="handleDelete(record.id)"
                v-debounce:confirm.300
                placement="topRight"
              >
                <template #description>
                  <div style="max-width: 240px">
                    <p style="margin: 0; color: #666">删除后无法恢复</p>
                    <p style="margin: 4px 0 0; color: #ff4d4f; font-size: 12px">
                      如果有子分类或商品将无法删除
                    </p>
                  </div>
                </template>
                <a style="color: #ff4d4f">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </a-table>
      </div>
    </a-card>

    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      width="520px"
      @ok="handleSubmit"
      @cancel="handleCancel"
      v-debounce:ok.300
      :mask-closable="false"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
        class="category-form"
      >
        <a-form-item label="上级分类" name="parent_id">
          <a-tree-select
            v-model:value="formData.parent_id"
            :tree-data="parentOptions"
            placeholder="请选择（不选则为一级分类）"
            allow-clear
            tree-default-expand-all
            v-debounce:change.300
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            @change="handleParentChange" 
          />
        </a-form-item>

        <a-form-item label="分类名称" name="name">
          <a-input
            v-model:value="formData.name"
            placeholder="请输入分类名称"
            allow-clear
            v-debounce:input.300
          />
        </a-form-item>

        <a-form-item label="排序值" name="sort_order">
          <a-input-number
            v-model:value="formData.sort_order"
            placeholder="数值越小越靠前"
            :min="1" 
            style="width: 100%"
            v-debounce:change.300
          />
          <div class="form-tip">提示：同级分类下排序值不能重复</div>
        </a-form-item>

        <a-form-item label="状态" name="is_visible">
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
  sort_order: 1, // 修改点：默认从 1 开始
  is_visible: 1,
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' },
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
  { title: '编号', dataIndex: 'id', width: 100, slots: { customRender: 'id' } },
  { title: '分类名称', dataIndex: 'name', slots: { customRender: 'name' } },
  {
    title: '层级',
    dataIndex: 'level',
    width: 100,
    slots: { customRender: 'level' },
  },
  { title: '排序', dataIndex: 'sort_order', width: 100, align: 'center' },
  {
    title: '状态',
    dataIndex: 'is_visible',
    width: 100,
    slots: { customRender: 'visible' },
  },
  {
    title: '操作',
    key: 'action',
    width: 220,
    align: 'right',
    slots: { customRender: 'action' },
  },
]

// 构建树形数据
const treeData = computed(() => {
  const tree: CategoryInfo[] = []
  const map = new Map<number, CategoryInfo>()

  // 1. 创建映射，不默认初始化 children，解决二级分类展开图标问题
  list.value.forEach((item) => {
    map.set(item.id, { ...item })
  })

  // 2. 组装树
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
  
  // 排序
  const sortFunc = (a: CategoryInfo, b: CategoryInfo) => (a.sort_order || 0) - (b.sort_order || 0)
  tree.sort(sortFunc)
  tree.forEach(node => {
    if (node.children) {
      node.children.sort(sortFunc)
    }
  })

  return tree
})

// 上级分类选项（仅一级分类）
const parentOptions = computed(() => {
  return list.value
    .filter((item) => item.level === 1)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((item) => ({
      value: item.id,
      title: `${item.name} (#${item.id})`,
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

// 【新增辅助函数】计算下一个可用的排序值
const getNextSortOrder = (parentId: number | null) => {
  // 找出所有同级分类
  const siblings = list.value.filter(item => {
    const itemPid = item.parent_id || null
    const targetPid = parentId || null
    return itemPid === targetPid
  })
  
  if (siblings.length === 0) return 1 // 如果没有同级，从 1 开始
  
  // 找出最大值
  const maxSort = Math.max(...siblings.map(s => s.sort_order || 0))
  return maxSort + 1
}

// 监听父级分类变化，自动计算排序值
const handleParentChange = (val: number | undefined) => {
  // 仅在新增模式下自动计算，编辑模式不随意改动用户的值
  if (!editingId.value) {
    formData.sort_order = getNextSortOrder(val || null)
  }
}

// 新增分类
const handleAdd = () => {
  editingId.value = null
  Object.assign(formData, {
    parent_id: null,
    name: '',
    level: 1,
    sort_order: getNextSortOrder(null), // 自动计算下一位：1, 2, 3...
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
    sort_order: getNextSortOrder(record.id), // 自动计算子分类下一位
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

    // --- 前端排序查重逻辑 ---
    const currentParentId = formData.parent_id || null
    const siblings = list.value.filter(item => {
      const itemParentId = item.parent_id || null
      return itemParentId === currentParentId
    })

    const duplicateItem = siblings.find(item => {
      if (editingId.value && item.id === editingId.value) return false
      return item.sort_order === formData.sort_order
    })

    if (duplicateItem) {
      message.error(`排序值 ${formData.sort_order} 已被 "${duplicateItem.name}" 占用，请更换`)
      return
    }
    // -----------------------

    // 自动修正level
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
    if (error?.errorFields) return
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
    const status = error.response?.status
    const errorMsg = error.response?.data?.message

    if (status === 500 && errorMsg?.includes('foreign key constraint')) {
      message.error('无法删除：该分类下包含商品或子分类')
    } else if (errorMsg) {
      message.error(errorMsg)
    } else {
      message.error('删除失败，请稍后重试')
    }
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
/* 容器 */
.app-container {
  padding: 24px;
  background-color: #f0f2f5;
  min-height: 100%;
}

/* 主卡片样式 */
.main-card {
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
}

/* 头部布局 */
.header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title {
  font-size: 20px;
  font-weight: 500;
  color: #1f1f1f;
  line-height: 28px;
}

/* 编号 Tag */
.id-tag {
  color: #8c8c8c;
  font-family: monospace;
}

/* 表单内提示文字 */
.form-tip {
  font-size: 12px;
  color: #999;
  line-height: 1.5;
  margin-top: 4px;
}

:deep(.ant-table-row) {
  transition: all 0.3s;
}

/* 优化表单间距 */
.category-form :deep(.ant-form-item) {
  margin-bottom: 24px;
}
</style>