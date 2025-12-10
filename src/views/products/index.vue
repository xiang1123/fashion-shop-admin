<template>
  <div class="product-container">
    <a-card :bordered="false" class="main-card">
      <div class="header-wrapper">
        <div class="left">
          <a-space>
            <a-input-search
              v-model:value="queryParams.q"
              placeholder="搜索商品名称"
              enter-button
              allow-clear
              @search="handleSearch"
              style="width: 260px"
            />
          </a-space>
        </div>
        <div class="right">
          <a-button type="primary" @click="handleAdd">
            <template #icon><plus-outlined /></template>
            新增商品
          </a-button>
        </div>
      </div>

      <a-table
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #cover="{ text }">
          <a-image
            :src="text"
            :width="50"
            :height="50"
            style="object-fit: cover; border-radius: 4px; display: block"
            :fallback="defaultImage"
          />
        </template>

        <template #status="{ text }">
          <a-tag :color="text === 'ON_SALE' ? 'green' : 'orange'">
            {{ text === 'ON_SALE' ? '上架' : '下架/草稿' }}
          </a-tag>
        </template>

        <template #createdAt="{ text }">
          {{ text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-' }}
        </template>

        <template #title="{ text }">
          <span v-html="sanitizeHtml(text)"></span>
        </template>

        <template #action="{ record }">
          <a-space>
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a style="color: #faad14" @click="handleManageSku(record)"
              >SKU管理</a
            >
            <a-divider type="vertical" />
            <a-popconfirm
              title="确认删除该商品吗？"
              @confirm="handleDelete(record.id)"
            >
              <a style="color: #ff4d4f">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      width="650px"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :confirmLoading="submitting"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 19 }"
      >
        <a-form-item label="所属分类" name="category_id">
          <a-tree-select
            v-model:value="formData.category_id"
            :tree-data="categoryTree"
            placeholder="请选择商品分类"
            allow-clear
            tree-default-expand-all
            :field-names="{ children: 'children', label: 'name', value: 'id' }"
          />
        </a-form-item>

        <a-form-item label="商品标题" name="title">
          <a-input
            v-model:value="formData.title"
            placeholder="请输入商品标题"
          />
        </a-form-item>

        <a-form-item label="副标题" name="subtitle">
          <a-input
            v-model:value="formData.subtitle"
            placeholder="请输入商品卖点/副标题"
          />
        </a-form-item>

        <a-form-item label="封面图" name="cover_image">
          <a-input
            v-model:value="formData.cover_image"
            placeholder="请输入图片URL"
            allow-clear
          />
          <div v-if="formData.cover_image" class="image-preview">
            <a-image
              :src="formData.cover_image"
              :height="100"
              style="max-width: 100%; object-fit: contain; border-radius: 4px"
              :fallback="defaultImage"
            />
          </div>
        </a-form-item>

        <a-form-item label="商品描述" name="description">
          <a-textarea
            v-model:value="formData.description"
            :rows="4"
            placeholder="请输入详细描述"
          />
        </a-form-item>

        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio value="DRAFT">草稿</a-radio>
            <a-radio value="ON_SALE">上架</a-radio>
            <a-radio value="OFF_SALE">下架</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="skuListVisible"
      :title="`SKU 管理 - ${currentProduct?.title || ''}`"
      width="900px"
      :footer="null"
    >
      <div class="sku-manage-header">
        <a-button type="primary" @click="handleAddSku">
          <template #icon><plus-outlined /></template>
          添加 SKU
        </a-button>
        <span class="sku-tips">提示：请确保 SKU 编码唯一</span>
      </div>

      <a-table
        :columns="skuColumns"
        :data-source="skuList"
        :loading="skuLoading"
        :pagination="false"
        row-key="id"
        size="middle"
      >
        <template #skuImage="{ text }">
          <a-image
            v-if="text"
            :src="text"
            :width="40"
            :height="40"
            style="object-fit: cover; border-radius: 4px"
          />
          <span v-else style="color: #ccc; font-size: 12px">无图</span>
        </template>

        <template #price="{ text }">
          <span style="color: #f50">¥{{ text }}</span>
        </template>

        <template #stock="{ text }">
          <span
            :style="{
              color: text < 10 ? 'red' : 'inherit',
              fontWeight: text < 10 ? 'bold' : 'normal',
            }"
          >
            {{ text }}
          </span>
        </template>

        <template #skuAction="{ record }">
          <a-space>
            <a @click="handleEditSku(record)">编辑</a>
            <a-popconfirm
              title="确定删除此 SKU 吗？"
              @confirm="handleDeleteSku(record.id)"
            >
              <a style="color: #ff4d4f">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-modal>

    <a-modal
      v-model:visible="skuFormVisible"
      :title="skuFormTitle"
      width="500px"
      @ok="handleSkuSubmit"
      @cancel="handleSkuCancel"
      :confirmLoading="skuSubmitting"
    >
      <a-form
        ref="skuFormRef"
        :model="skuFormData"
        :rules="skuRules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="SKU编码" name="sku_code">
          <a-input
            v-model:value="skuFormData.sku_code"
            placeholder="例: TSHIRT-001-BLK-M"
          />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              label="颜色"
              name="color"
              :label-col="{ span: 10 }"
              :wrapper-col="{ span: 14 }"
            >
              <a-input
                v-model:value="skuFormData.color"
                placeholder="例: 黑色"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="尺码"
              name="size"
              :label-col="{ span: 6 }"
              :wrapper-col="{ span: 18 }"
            >
              <a-input v-model:value="skuFormData.size" placeholder="例: XL" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              label="价格"
              name="price"
              :label-col="{ span: 10 }"
              :wrapper-col="{ span: 14 }"
            >
              <a-input-number
                v-model:value="skuFormData.price"
                :min="0"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="库存"
              name="stock"
              :label-col="{ span: 6 }"
              :wrapper-col="{ span: 18 }"
            >
              <a-input-number
                v-model:value="skuFormData.stock"
                :min="0"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="SKU图片" name="image">
          <a-input
            v-model:value="skuFormData.image"
            placeholder="特定规格图URL (可选)"
            allow-clear
          />
          <div v-if="skuFormData.image" class="image-preview">
            <a-image
              :src="skuFormData.image"
              :height="80"
              style="max-width: 100%; object-fit: contain"
              :fallback="defaultImage"
            />
          </div>
        </a-form-item>

        <a-form-item label="条形码" name="bar_code">
          <a-input
            v-model:value="skuFormData.bar_code"
            placeholder="69开头的商品条码 (可选)"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import DOMPurify from 'dompurify'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import type { FormInstance } from 'ant-design-vue'

// API 导入
import { 
  getProductList, createProduct, updateProduct, deleteProduct,
  getProductSkus, createSku, updateSku, deleteSku, updateSkuStock
} from '@/api/products'
import { getCategoryList } from '@/api/category'
import type { ProductInfo, ProductFormData, SkuInfo } from '@/types/product'

// --- 通用配置 ---
const defaultImage = 'https://api.dicebear.com/7.x/shapes/svg?seed=Default'
const sanitizeHtml = (html: string) => DOMPurify.sanitize(html, { ALLOWED_TAGS: [] })

// --- 商品列表状态 ---
const loading = ref(false)
const list = ref<ProductInfo[]>([])
const categoryTree = ref([]) 
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const statusLoading = ref<Record<number, boolean>>({})

// 搜索
const queryParams = reactive({ q: '' })

// 表单状态
const modalVisible = ref(false)
const submitting = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const formData = reactive<ProductFormData>({
  category_id: null, title: '', subtitle: '', description: '', cover_image: '', status: 'DRAFT', skus: []
})

// --- SKU 管理状态 ---
const skuListVisible = ref(false)
const skuLoading = ref(false)
const skuList = ref<SkuInfo[]>([])
const currentProduct = ref<ProductInfo | null>(null)

// --- SKU 表单状态 ---
const skuFormVisible = ref(false)
const skuSubmitting = ref(false)
const editingSkuId = ref<number | null>(null)
const skuFormRef = ref<FormInstance>()
const skuFormData = reactive<SkuInfo>({
  sku_code: '', color: '', size: '', price: 0, stock: 0, image: '', bar_code: '', is_active: 1
})

// --- 规则定义 ---
const rules = {
  category_id: [{ required: true, message: '请选择分类', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  cover_image: [{ required: true, message: '请输入主图', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const skuRules = {
  sku_code: [{ required: true, message: '请输入SKU编码', trigger: 'blur' }],
  color: [{ required: true, message: '请输入颜色', trigger: 'blur' }],
  size: [{ required: true, message: '请输入尺码', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'change' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'change' }]
}

// --- 表格列定义 ---
const columns = [
  { title: 'ID', dataIndex: 'id', width: 60, align: 'center' },
  { title: '封面', dataIndex: 'cover_image', width: 80, slots: { customRender: 'cover' }, align: 'center' },
  { title: '标题', dataIndex: 'title', slots: { customRender: 'title' } },
  { title: '分类', dataIndex: 'category_name', width: 100 },
  { title: '状态', dataIndex: 'status', width: 100, slots: { customRender: 'status' }, align: 'center' },
  { title: '创建时间', dataIndex: 'created_at', width: 160, slots: { customRender: 'createdAt' } },
  { title: '操作', key: 'action', width: 220, fixed: 'right', slots: { customRender: 'action' } }
]

const skuColumns = [
  { title: '图片', dataIndex: 'image', width: 60, slots: { customRender: 'skuImage' } },
  { title: 'SKU编码', dataIndex: 'sku_code' },
  { title: '颜色', dataIndex: 'color', width: 80 },
  { title: '尺码', dataIndex: 'size', width: 80 },
  { title: '价格', dataIndex: 'price', width: 100, slots: { customRender: 'price' } },
  { title: '库存', dataIndex: 'stock', width: 80, slots: { customRender: 'stock' } },
  { title: '操作', key: 'action', width: 120, slots: { customRender: 'skuAction' } }
]

// --- 计算属性 ---
const modalTitle = computed(() => editingId.value ? '编辑商品' : '新增商品')
const skuFormTitle = computed(() => editingSkuId.value ? '编辑 SKU' : '新增 SKU')
const pagination = computed(() => ({
  total: total.value,
  current: currentPage.value,
  pageSize: pageSize.value,
  showSizeChanger: true,
  showTotal: (t: number) => `共 ${t} 条`
}))

// ======================= 方法实现 =======================

const fetchCategories = async () => {
  try {
    const res: any = await getCategoryList()
    if (res.code === 0) categoryTree.value = buildTree(res.data)
  } catch (e) { console.error(e) }
}

const buildTree = (items: any[]) => {
  const map = new Map()
  const tree: any[] = []
  items.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  items.forEach(item => map.set(item.id, { ...item, children: [] }))
  map.forEach(item => {
    if (item.parent_id === null) tree.push(item)
    else {
      const parent = map.get(item.parent_id)
      if (parent) parent.children.push(item)
    }
  })
  const clean = (nodes: any[]) => {
    nodes.forEach(node => {
      if (node.children.length === 0) delete node.children
      else clean(node.children)
    })
  }
  clean(tree)
  return tree
}

const fetchList = async () => {
  loading.value = true
  try {
    const res: any = await getProductList({
      page: currentPage.value,
      page_size: pageSize.value,
      q: queryParams.q
    })
    if (res.code === 0) {
      list.value = res.data.list
      total.value = res.data.total
    }
  } catch (e) { message.error('获取商品列表失败') }
  finally { loading.value = false }
}

const handleSearch = () => { currentPage.value = 1; fetchList() }
const handleTableChange = (pag: any) => {
  currentPage.value = pag.current
  pageSize.value = pag.pageSize
  fetchList()
}

const handleStatusChange = async (record: ProductInfo, checked: boolean) => {
  const newStatus = checked ? 'ON_SALE' : 'OFF_SALE'
  statusLoading.value[record.id] = true
  try {
    await updateProduct(record.id, { status: newStatus } as any)
    record.status = newStatus
    message.success(checked ? '已上架' : '已下架')
  } catch (error) {
    message.error('状态更新失败')
    fetchList()
  } finally {
    statusLoading.value[record.id] = false
  }
}

const handleAdd = () => {
  editingId.value = null
  Object.assign(formData, {
    category_id: null, title: '', subtitle: '', description: '', cover_image: '', status: 'DRAFT', skus: []
  })
  modalVisible.value = true
}

const handleEdit = (record: any) => {
  editingId.value = record.id
  Object.assign(formData, {
    category_id: record.category_id,
    title: record.title,
    subtitle: record.subtitle,
    description: record.description,
    cover_image: record.cover_image,
    status: record.status
  })
  modalVisible.value = true
}

const handleDelete = async (id: number) => {
  try { await deleteProduct(id); message.success('已删除'); fetchList() } catch(e) { message.error('删除失败') }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitting.value = true
    if (editingId.value) {
      await updateProduct(editingId.value, formData)
      message.success('更新成功')
    } else {
      await createProduct(formData)
      message.success('创建成功，请点击“SKU管理”完善规格')
    }
    modalVisible.value = false
    fetchList()
  } catch (err: any) {
    message.error(err.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}
const handleCancel = () => { modalVisible.value = false }

// ======================= SKU 管理逻辑 =======================

const handleManageSku = async (record: ProductInfo) => {
  currentProduct.value = record
  skuListVisible.value = true
  await fetchSkuList(record.id)
}

const fetchSkuList = async (pid: number) => {
  skuLoading.value = true
  try {
    const res: any = await getProductSkus(pid)
    if (res.code === 0) skuList.value = res.data
  } finally { skuLoading.value = false }
}

const handleAddSku = () => {
  editingSkuId.value = null
  Object.assign(skuFormData, { sku_code: '', color: '', size: '', price: 0, stock: 100, image: '', bar_code: '', is_active: 1 })
  skuFormVisible.value = true
}

const handleEditSku = (record: SkuInfo) => {
  editingSkuId.value = record.id
  Object.assign(skuFormData, record)
  skuFormVisible.value = true
}

// 【核心修改】提交 SKU (增加前端查重 + 后端错误捕获)
const handleSkuSubmit = async () => {
  try {
    await skuFormRef.value?.validate()
    
    // 1. 本地查重 (优化体验，不发请求)
    const isDuplicate = skuList.value.some(item => 
      item.sku_code === skuFormData.sku_code && item.id !== editingSkuId.value
    )
    if (isDuplicate) { 
      message.error(`当前商品下已存在编码为 ${skuFormData.sku_code} 的SKU`)
      return 
    }

    skuSubmitting.value = true
    if (editingSkuId.value) {
      await updateSku(editingSkuId.value, skuFormData)
      message.success('SKU 更新成功')
    } else {
      if (!currentProduct.value) return
      await createSku(currentProduct.value.id, skuFormData)
      message.success('SKU 创建成功')
    }
    skuFormVisible.value = false
    if (currentProduct.value) fetchSkuList(currentProduct.value.id)
  } catch (err: any) {
    console.error(err)
    // 2. 捕获后端数据库错误 (全局查重)
    const msg = err.response?.data?.message || ''
    // 后端如果返回 Duplicate entry 或 IntegrityError
    if (msg.includes('Duplicate entry') || msg.includes('SKU编码') || msg.includes('exists')) {
       message.error(`SKU编码 ${skuFormData.sku_code} 已存在，请更换`)
    } else {
       message.error(msg || '操作失败')
    }
  } finally { 
    skuSubmitting.value = false 
  }
}

const handleSkuCancel = () => { skuFormVisible.value = false }

// 【核心修改】删除 SKU (捕获外键引用错误)
const handleDeleteSku = async (sid: number) => {
  try {
    await deleteSku(sid)
    message.success('SKU 已删除')
    if (currentProduct.value) fetchSkuList(currentProduct.value.id)
  } catch (err: any) {
    console.error('删除SKU失败:', err)
    
    // 解析错误信息
    const msg = err.response?.data?.message || JSON.stringify(err.response?.data) || ''
    const status = err.response?.status
    
    // 检查特征词：foreign key, constraint, 1451 (MySQL错误码)
    if (msg.includes('foreign key') || msg.includes('constraint') || msg.includes('1451') || status === 500) {
      message.error({
        content: '无法删除：该 SKU 已被购物车或订单引用，请直接修改库存为0或下架商品。',
        duration: 5 // 显示久一点
      })
    } else {
      message.error('删除失败，请稍后重试')
    }
  }
}

const stockModalVisible = ref(false)
const currentSku = ref<SkuInfo | null>(null)
const newStock = ref(0)

const handleUpdateStock = (record: SkuInfo) => {
  currentSku.value = record
  newStock.value = record.stock
  stockModalVisible.value = true
}

const handleStockSubmit = async () => {
  try {
    if (!currentSku.value?.id) return
    await updateSkuStock(currentSku.value.id, { stock: newStock.value })
    message.success('库存已更新')
    stockModalVisible.value = false
    if (currentProduct.value) fetchSkuList(currentProduct.value.id)
  } catch (e) { message.error('更新失败') }
}
const handleStockCancel = () => { stockModalVisible.value = false }

onMounted(() => {
  fetchCategories()
  fetchList()
})
</script>

<style scoped>
.app-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}
.header-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}
.image-preview {
  margin-top: 8px;
  padding: 8px;
  background: #fafafa;
  border-radius: 4px;
  display: inline-block;
}
.sku-manage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.sku-tips {
  color: #999;
  font-size: 12px;
}
</style>
