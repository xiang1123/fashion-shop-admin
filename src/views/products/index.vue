<template>
  <div class="product-container">
    <!-- 操作区域 -->
    <div class="action-area">
      <a-button type="primary" @click="handleAdd">
        <template #icon>
          <plus-outlined />
        </template>
        新增商品
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
        <!-- 封面图片列 -->
        <template #cover="{ text }">
          <a-image
            :src="text"
            :width="80"
            :height="80"
            style="object-fit: cover; border-radius: 4px"
          />
        </template>

        <!-- 状态列 -->
        <template #status="{ text }">
          <a-tag :color="getStatusColor(text)">
            {{ getStatusText(text) }}
          </a-tag>
        </template>

        <!-- 操作列 -->
        <template #action="{ record }">
          <a-space>
            <a @click="handleViewSkus(record)">查看SKU</a>
            <a @click="handleEdit(record)">编辑</a>
            <a-popconfirm
              title="确定要删除这个商品吗？"
              @confirm="handleDelete(record.id)"
            >
              <a style="color: #ff4d4f">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </div>

    <!-- 新增/编辑商品模态框 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      width="800px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 19 }"
      >
        <a-form-item label="商品标题" name="title">
          <a-input
            v-model:value="formData.title"
            placeholder="请输入商品标题"
          />
        </a-form-item>

        <a-form-item label="商品副标题" name="subtitle">
          <a-input
            v-model:value="formData.subtitle"
            placeholder="请输入商品副标题"
          />
        </a-form-item>

        <a-form-item label="商品描述" name="description">
          <a-textarea
            v-model:value="formData.description"
            placeholder="请输入商品描述"
            :rows="3"
          />
        </a-form-item>

        <a-form-item label="分类ID" name="category_id">
          <a-input-number
            v-model:value="formData.category_id"
            placeholder="请输入分类ID"
            :min="1"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="封面图片" name="cover_image">
          <a-input
            v-model:value="formData.cover_image"
            placeholder="请输入图片地址"
          />
          <div v-if="formData.cover_image" class="image-preview">
            <a-image
              :src="formData.cover_image"
              :width="200"
              style="margin-top: 8px; border-radius: 4px"
            />
          </div>
        </a-form-item>

        <a-form-item label="商品状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio value="ON_SALE">在售</a-radio>
            <a-radio value="OFF_SALE">下架</a-radio>
            <a-radio value="SOLD_OUT">售罄</a-radio>
          </a-radio-group>
        </a-form-item>

        <!-- SKU 列表 -->
        <a-form-item label="SKU 列表">
          <div class="sku-list">
            <div
              v-for="(sku, index) in formData.skus"
              :key="index"
              class="sku-item"
            >
              <a-row :gutter="16">
                <a-col :span="6">
                  <a-input v-model:value="sku.color" placeholder="颜色" />
                </a-col>
                <a-col :span="6">
                  <a-input v-model:value="sku.size" placeholder="尺码" />
                </a-col>
                <a-col :span="6">
                  <a-input-number
                    v-model:value="sku.price"
                    placeholder="价格"
                    :min="0"
                    style="width: 100%"
                  />
                </a-col>
                <a-col :span="4">
                  <a-input-number
                    v-model:value="sku.stock"
                    placeholder="库存"
                    :min="0"
                    style="width: 100%"
                  />
                </a-col>
                <a-col :span="2">
                  <a-button
                    type="text"
                    danger
                    @click="removeSku(index)"
                    :disabled="formData.skus.length === 1"
                  >
                    <template #icon>
                      <delete-outlined />
                    </template>
                  </a-button>
                </a-col>
              </a-row>
              <a-row :gutter="16" style="margin-top: 8px">
                <a-col :span="12">
                  <a-input
                    v-model:value="sku.sku_code"
                    placeholder="SKU 编码"
                  />
                </a-col>
                <a-col :span="12">
                  <a-input
                    v-model:value="sku.image"
                    placeholder="SKU 图片地址"
                  />
                </a-col>
              </a-row>
            </div>
            <a-button
              type="dashed"
              block
              @click="addSku"
              style="margin-top: 16px"
            >
              <template #icon>
                <plus-outlined />
              </template>
              添加 SKU
            </a-button>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- SKU 管理模态框 -->
    <a-modal
      v-model:visible="skuModalVisible"
      :title="`SKU 管理 - ${currentProduct?.title}`"
      width="900px"
      :footer="null"
    >
      <div class="sku-manage">
        <a-button
          type="primary"
          @click="handleAddSku"
          style="margin-bottom: 16px"
        >
          <template #icon>
            <plus-outlined />
          </template>
          新增 SKU
        </a-button>

        <a-table
          :columns="skuColumns"
          :data-source="skuList"
          :loading="skuLoading"
          :pagination="false"
          row-key="id"
        >
          <template #image="{ text }">
            <a-image
              v-if="text"
              :src="text"
              :width="60"
              :height="60"
              style="object-fit: cover; border-radius: 4px"
            />
            <span v-else>-</span>
          </template>

          <template #price="{ text }"> ¥{{ text }} </template>

          <template #active="{ text }">
            <a-tag :color="text === 1 ? 'green' : 'red'">
              {{ text === 1 ? '启用' : '禁用' }}
            </a-tag>
          </template>

          <template #action="{ record }">
            <a-space>
              <a @click="handleEditSku(record)">编辑</a>
              <a @click="handleUpdateStock(record)">调整库存</a>
              <a-popconfirm
                title="确定要删除这个 SKU 吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDeleteSku(record.id)"
              >
                <template #description>
                  <div style="max-width: 300px">
                    <p style="margin: 0">删除后将无法恢复</p>
                    <p style="margin: 8px 0 0; color: #ff4d4f; font-size: 12px">
                      注意：如果该 SKU 存在订单或库存记录，将无法删除
                    </p>
                  </div>
                </template>
                <a style="color: #ff4d4f">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </a-table>
      </div>
    </a-modal>

    <!-- SKU 编辑模态框 -->
    <a-modal
      v-model:visible="skuFormVisible"
      :title="skuFormTitle"
      width="600px"
      @ok="handleSkuSubmit"
      @cancel="handleSkuCancel"
    >
      <a-form
        ref="skuFormRef"
        :model="skuFormData"
        :rules="skuRules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="SKU 编码" name="sku_code">
          <a-input
            v-model:value="skuFormData.sku_code"
            placeholder="请输入 SKU 编码"
          />
        </a-form-item>

        <a-form-item label="颜色" name="color">
          <a-input v-model:value="skuFormData.color" placeholder="请输入颜色" />
        </a-form-item>

        <a-form-item label="尺码" name="size">
          <a-input v-model:value="skuFormData.size" placeholder="请输入尺码" />
        </a-form-item>

        <a-form-item label="价格" name="price">
          <a-input-number
            v-model:value="skuFormData.price"
            placeholder="请输入价格"
            :min="0"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="库存" name="stock">
          <a-input-number
            v-model:value="skuFormData.stock"
            placeholder="请输入库存"
            :min="0"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="图片地址" name="image">
          <a-input
            v-model:value="skuFormData.image"
            placeholder="请输入图片地址"
          />
          <div v-if="skuFormData.image" class="image-preview">
            <a-image
              :src="skuFormData.image"
              :width="150"
              style="margin-top: 8px; border-radius: 4px"
            />
          </div>
        </a-form-item>

        <a-form-item label="条形码" name="bar_code">
          <a-input
            v-model:value="skuFormData.bar_code"
            placeholder="请输入条形码"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 库存调整模态框 -->
    <a-modal
      v-model:visible="stockModalVisible"
      title="调整库存"
      width="400px"
      @ok="handleStockSubmit"
      @cancel="handleStockCancel"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 17 }">
        <a-form-item label="当前库存">
          <a-input-number
            :value="currentSku?.stock"
            disabled
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="新库存">
          <a-input-number
            v-model:value="newStock"
            :min="0"
            placeholder="请输入新库存"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  getProductList,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductSkus,
  createSku,
  updateSku,
  deleteSku,
  updateSkuStock,
} from '@/api/products'
import type { ProductInfo, ProductFormData, SkuInfo } from '@/types/product'
import type { FormInstance } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'

// 列表数据
const list = ref<ProductInfo[]>([])
const loading = ref(false)

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)

// 模态框
const modalVisible = ref(false)
const modalTitle = computed(() => (editingId.value ? '编辑商品' : '新增商品'))
const editingId = ref<number | null>(null)

// 表单
const formRef = ref<FormInstance>()
const formData = reactive<ProductFormData>({
  title: '',
  subtitle: '',
  description: '',
  status: 'ON_SALE',
  category_id: 1,
  cover_image: '',
  skus: [
    {
      sku_code: '',
      color: '',
      size: '',
      price: 0,
      stock: 0,
      image: '',
      bar_code: '',
    },
  ],
})

// 表单验证规则
const rules = {
  title: [{ required: true, message: '请输入商品标题', trigger: 'blur' }],
  subtitle: [{ required: true, message: '请输入商品副标题', trigger: 'blur' }],
  category_id: [{ required: true, message: '请输入分类ID', trigger: 'blur' }],
  cover_image: [{ required: true, message: '请输入封面图片', trigger: 'blur' }],
  status: [{ required: true, message: '请选择商品状态', trigger: 'change' }],
}

// SKU 管理
const skuModalVisible = ref(false)
const currentProduct = ref<ProductInfo | null>(null)
const skuList = ref<SkuInfo[]>([])
const skuLoading = ref(false)

// SKU 表单
const skuFormVisible = ref(false)
const skuFormTitle = computed(() =>
  editingSkuId.value ? '编辑 SKU' : '新增 SKU'
)
const editingSkuId = ref<number | null>(null)
const skuFormRef = ref<FormInstance>()
const skuFormData = reactive<SkuInfo>({
  sku_code: '',
  color: '',
  size: '',
  price: 0,
  stock: 0,
  image: '',
  bar_code: '',
})

const skuRules = {
  sku_code: [
    { required: true, message: '请输入 SKU 编码', trigger: 'blur' },
    {
      pattern: /^[A-Z0-9-]+$/,
      message: 'SKU 编码只能包含大写字母、数字和连字符',
      trigger: 'blur',
    },
  ],
  color: [{ required: true, message: '请输入颜色', trigger: 'blur' }],
  size: [{ required: true, message: '请输入尺码', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
}

// 库存调整
const stockModalVisible = ref(false)
const currentSku = ref<SkuInfo | null>(null)
const newStock = ref(0)

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
  { title: 'ID', dataIndex: 'id', width: 80 },
  {
    title: '封面',
    dataIndex: 'cover_image',
    width: 100,
    slots: { customRender: 'cover' },
  },
  { title: '商品标题', dataIndex: 'title' },
  { title: '商品副标题', dataIndex: 'subtitle' },
  { title: '分类ID', dataIndex: 'category_id', width: 100 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    slots: { customRender: 'status' },
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right',
    slots: { customRender: 'action' },
  },
]

// SKU 表格列定义
const skuColumns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: 'SKU 编码', dataIndex: 'sku_code' },
  { title: '颜色', dataIndex: 'color', width: 100 },
  { title: '尺码', dataIndex: 'size', width: 80 },
  {
    title: '价格',
    dataIndex: 'price',
    width: 100,
    slots: { customRender: 'price' },
  },
  { title: '库存', dataIndex: 'stock', width: 80 },
  {
    title: '图片',
    dataIndex: 'image',
    width: 80,
    slots: { customRender: 'image' },
  },
  {
    title: '状态',
    dataIndex: 'is_active',
    width: 80,
    slots: { customRender: 'active' },
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right',
    slots: { customRender: 'action' },
  },
]

// 获取商品列表
const fetchList = async () => {
  try {
    loading.value = true
    const res = await getProductList()

    if (res.code === 0 && res.data) {
      list.value = res.data
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    message.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 表格变化
const handleTableChange = (pag: any) => {
  currentPage.value = pag.current
  pageSize.value = pag.pageSize
}

// 新增商品
const handleAdd = () => {
  editingId.value = null
  Object.assign(formData, {
    title: '',
    subtitle: '',
    description: '',
    status: 'ON_SALE',
    category_id: 1,
    cover_image: '',
    skus: [
      {
        sku_code: '',
        color: '',
        size: '',
        price: 0,
        stock: 0,
        image: '',
        bar_code: '',
      },
    ],
  })
  modalVisible.value = true
}

// 编辑商品
const handleEdit = (record: ProductInfo) => {
  editingId.value = record.id
  Object.assign(formData, {
    title: record.title,
    subtitle: record.subtitle,
    description: record.description || '',
    status: record.status,
    category_id: record.category_id,
    cover_image: record.cover_image,
    skus: record.skus || [
      {
        sku_code: '',
        color: '',
        size: '',
        price: 0,
        stock: 0,
        image: '',
        bar_code: '',
      },
    ],
  })
  modalVisible.value = true
}

// 提交商品
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    if (editingId.value) {
      await updateProduct(editingId.value, formData)
      message.success('更新成功')
    } else {
      await createProduct(formData)
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

// 删除商品
const handleDelete = async (id: number) => {
  try {
    await deleteProduct(id)
    message.success('删除成功')
    fetchList()
  } catch (error: any) {
    console.error('删除失败:', error)

    // 检查是否是外键约束错误
    if (error.response?.status === 500) {
      message.error(
        '删除失败：该商品存在关联数据（如库存锁定记录），无法删除。请先清理相关数据或联系管理员。'
      )
    } else {
      message.error('删除失败，请稍后重试')
    }
  }
}

// 添加 SKU
const addSku = () => {
  formData.skus.push({
    sku_code: '',
    color: '',
    size: '',
    price: 0,
    stock: 0,
    image: '',
    bar_code: '',
  })
}

// 移除 SKU
const removeSku = (index: number) => {
  formData.skus.splice(index, 1)
}

// 查看 SKU
const handleViewSkus = async (record: ProductInfo) => {
  currentProduct.value = record
  try {
    skuLoading.value = true
    const res = await getProductSkus(record.id)

    if (res.code === 0 && res.data) {
      skuList.value = res.data
      skuModalVisible.value = true
    }
  } catch (error) {
    console.error('获取 SKU 列表失败:', error)
    message.error('获取 SKU 列表失败')
  } finally {
    skuLoading.value = false
  }
}

// 新增 SKU
const handleAddSku = () => {
  editingSkuId.value = null
  Object.assign(skuFormData, {
    sku_code: '',
    color: '',
    size: '',
    price: 0,
    stock: 0,
    image: '',
    bar_code: '',
  })
  skuFormVisible.value = true
}

// 编辑 SKU
const handleEditSku = (record: SkuInfo) => {
  editingSkuId.value = record.id!
  Object.assign(skuFormData, record)
  skuFormVisible.value = true
}

// 提交 SKU
const handleSkuSubmit = async () => {
  try {
    await skuFormRef.value?.validate()

    if (!currentProduct.value) return

    // 确保数据格式正确
    const skuData = {
      sku_code: skuFormData.sku_code.trim(),
      color: skuFormData.color.trim(),
      size: skuFormData.size.trim(),
      price: Number(skuFormData.price),
      stock: Number(skuFormData.stock),
      image: skuFormData.image?.trim() || '',
      bar_code: skuFormData.bar_code?.trim() || '',
    }

    if (editingSkuId.value) {
      await updateSku(editingSkuId.value, skuData)
      message.success('更新成功')
    } else {
      await createSku(currentProduct.value.id, skuData)
      message.success('创建成功')
    }

    skuFormVisible.value = false
    handleViewSkus(currentProduct.value)
  } catch (error) {
    console.error('提交失败:', error)
    message.error('提交失败，请检查输入信息')
  }
}

// 取消 SKU 编辑
const handleSkuCancel = () => {
  skuFormVisible.value = false
  skuFormRef.value?.resetFields()
}

// 删除 SKU
const handleDeleteSku = async (id: number) => {
  try {
    await deleteSku(id)
    message.success('删除成功')
    if (currentProduct.value) {
      handleViewSkus(currentProduct.value)
    }
  } catch (error: any) {
    console.error('删除失败:', error)

    // 详细的错误处理
    const status = error.response?.status
    const errorMsg = error.response?.data?.message

    if (status === 500 && errorMsg?.includes('foreign key constraint')) {
      message.error({
        content:
          '删除失败：该 SKU 存在关联数据（如订单记录、库存锁定等），无法删除。建议：1. 先处理相关订单 2. 或使用"禁用"功能代替删除',
        duration: 8,
      })
    } else if (status === 404) {
      message.error('SKU 不存在或已被删除')
      if (currentProduct.value) {
        handleViewSkus(currentProduct.value)
      }
    } else if (status === 403) {
      message.error('没有权限删除该 SKU')
    } else if (errorMsg) {
      message.error(errorMsg)
    } else {
      message.error('删除失败，请稍后重试')
    }
  }
}

// 调整库存
const handleUpdateStock = (record: SkuInfo) => {
  currentSku.value = record
  newStock.value = record.stock
  stockModalVisible.value = true
}

// 提交库存调整
const handleStockSubmit = async () => {
  try {
    if (!currentSku.value || !currentSku.value.id) return

    await updateSkuStock(currentSku.value.id, { stock: newStock.value })
    message.success('库存调整成功')
    stockModalVisible.value = false

    if (currentProduct.value) {
      handleViewSkus(currentProduct.value)
    }
  } catch (error) {
    console.error('库存调整失败:', error)
    message.error('库存调整失败')
  }
}

// 取消库存调整
const handleStockCancel = () => {
  stockModalVisible.value = false
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    ON_SALE: 'green',
    OFF_SALE: 'red',
    SOLD_OUT: 'orange',
  }
  return colorMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    ON_SALE: '在售',
    OFF_SALE: '下架',
    SOLD_OUT: '售罄',
  }
  return textMap[status] || status
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

.sku-list {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 16px;
}

.sku-item {
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
  margin-bottom: 12px;
}

.sku-item:last-child {
  margin-bottom: 0;
}

.sku-manage {
  padding: 16px 0;
}

.modal-footer {
  margin-top: 24px;
  text-align: right;
}

:deep(.ant-form-item) {
  margin-bottom: 24px;
}

:deep(.ant-descriptions-item-label) {
  font-weight: 500;
}
</style>
