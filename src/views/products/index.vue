<template>
  <div class="product-container">
    <!-- 操作区域 -->
    <div class="action-area">
      <a-button type="primary" @click="handleAdd" v-debounce:click.300>
        <template #icon>
          <plus-outlined />
        </template>
        新增商品
      </a-button>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <a-form layout="inline">
        <a-form-item label="商品名称">
          <a-input
            v-model:value="searchText"
            placeholder="请输入商品名称"
            allow-clear
            style="width: 200px"
            v-debounce:input.300="handleSearch"
          />
        </a-form-item>
        <a-form-item label="商品状态">
          <a-select
            v-model:value="searchStatus"
            placeholder="请选择状态"
            allow-clear
            style="width: 120px"
            v-debounce:change.300="handleSearch"
          >
            <a-select-option value="ON_SALE">在售</a-select-option>
            <a-select-option value="OFF_SALE">下架</a-select-option>
            <a-select-option value="SOLD_OUT">售罄</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch" v-debounce:click.300
            >搜索</a-button
          >
          <a-button
            style="margin-left: 8px"
            @click="handleReset"
            v-debounce:click.300
            >重置</a-button
          >
        </a-form-item>
      </a-form>
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
      <a-empty v-else-if="currentList.length === 0" description="暂无商品数据">
        <template #image>
          <svg style="width: 64px; height: 64px" viewBox="64 864 864 864">
            <path
              fill="#e6e6e6"
              d="M832 64H192c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zm-600 72h560v208H232V136zm560 480H232V416h560v200zm-262-256H232v-72h298v72z"
            />
          </svg>
        </template>
        <a-button type="primary" @click="handleAdd" v-debounce:click.300
          >立即创建</a-button
        >
      </a-empty>

      <!-- 表格 -->
      <a-table
        v-else
        :columns="columns"
        :data-source="currentList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
        v-throttle:resize.100="handleTableResize"
      >
        <!-- 封面图片列 -->
        <template #cover="{ text }">
          <a-image
            :src="text"
            :width="80"
            :height="80"
            style="object-fit: cover; border-radius: 4px"
            :fallback="defaultImage"
          />
        </template>

        <!-- 状态列 -->
        <template #status="{ text }">
          <a-tag :color="getStatusColor(text)">
            {{ getStatusText(text) }}
          </a-tag>
        </template>

        <!-- 商品名称列（XSS防护）-->
        <template #title="{ text }">
          <div v-html="sanitizeHtml(text)"></div>
        </template>

        <!-- 商品副标题列（XSS防护）-->
        <template #subtitle="{ text }">
          <div v-html="sanitizeHtml(text)"></div>
        </template>

        <!-- 操作列 -->
        <template #action="{ record }">
          <a-space>
            <a @click="handleViewSkus(record)" v-debounce:click.300>查看SKU</a>
            <a @click="handleEdit(record)" v-debounce:click.300>编辑</a>
            <a-popconfirm
              title="确定要删除这个商品吗？"
              @confirm="handleDelete(record.id)"
              v-debounce:confirm.300
            >
              <template #description>
                <div style="max-width: 300px">
                  <p style="margin: 0">删除后将无法恢复</p>
                  <p style="margin: 8px 0 0; color: #ff4d4f; font-size: 12px">
                    注意：如果该商品存在订单或库存记录，将无法删除
                  </p>
                </div>
              </template>
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
      v-debounce:ok.300
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
            v-debounce:input.300
          />
        </a-form-item>

        <a-form-item label="商品副标题" name="subtitle">
          <a-input
            v-model:value="formData.subtitle"
            placeholder="请输入商品副标题"
            v-debounce:input.300
          />
        </a-form-item>

        <a-form-item label="商品描述" name="description">
          <a-textarea
            v-model:value="formData.description"
            placeholder="请输入商品描述"
            :rows="3"
            v-debounce:input.300
          />
        </a-form-item>

        <a-form-item label="分类ID" name="category_id">
          <a-input-number
            v-model:value="formData.category_id"
            placeholder="请输入分类ID"
            :min="1"
            style="width: 100%"
            v-debounce:change.300
          />
        </a-form-item>

        <a-form-item label="封面图片" name="cover_image">
          <a-input
            v-model:value="formData.cover_image"
            placeholder="请输入图片地址"
            v-debounce:input.300
          />
          <div v-if="formData.cover_image" class="image-preview">
            <a-image
              :src="formData.cover_image"
              :width="200"
              style="margin-top: 8px; border-radius: 4px"
              :fallback="defaultImage"
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
                  <a-input
                    v-model:value="sku.color"
                    placeholder="颜色"
                    v-debounce:input.300
                  />
                </a-col>
                <a-col :span="6">
                  <a-input
                    v-model:value="sku.size"
                    placeholder="尺码"
                    v-debounce:input.300
                  />
                </a-col>
                <a-col :span="6">
                  <a-input-number
                    v-model:value="sku.price"
                    placeholder="价格"
                    :min="0"
                    style="width: 100%"
                    v-debounce:change.300
                  />
                </a-col>
                <a-col :span="4">
                  <a-input-number
                    v-model:value="sku.stock"
                    placeholder="库存"
                    :min="0"
                    style="width: 100%"
                    v-debounce:change.300
                  />
                </a-col>
                <a-col :span="2">
                  <a-button
                    type="text"
                    danger
                    @click="removeSku(index)"
                    :disabled="formData.skus.length === 1"
                    v-debounce:click.300
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
                    v-debounce:input.300
                  />
                </a-col>
                <a-col :span="12">
                  <a-input
                    v-model:value="sku.image"
                    placeholder="SKU 图片地址"
                    v-debounce:input.300
                  />
                </a-col>
              </a-row>
            </div>
            <a-button
              type="dashed"
              block
              @click="addSku"
              style="margin-top: 16px"
              v-debounce:click.300
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
      :title="`SKU 管理 - ${sanitizeHtml(currentProduct?.title)}`"
      width="900px"
      :footer="null"
    >
      <div class="sku-manage">
        <a-button
          type="primary"
          @click="handleAddSku"
          style="margin-bottom: 16px"
          v-debounce:click.300
        >
          <template #icon>
            <plus-outlined />
          </template>
          新增 SKU
        </a-button>

        <!-- SKU 骨架屏 -->
        <a-skeleton v-if="skuLoading" active :paragraph="{ rows: 4 }" />

        <!-- SKU 空状态 -->
        <a-empty v-else-if="skuList.length === 0" description="暂无 SKU 数据">
          <a-button type="primary" @click="handleAddSku" v-debounce:click.300
            >立即创建</a-button
          >
        </a-empty>

        <!-- SKU 表格 -->
        <a-table
          v-else
          :columns="skuColumns"
          :data-source="skuList"
          :loading="skuLoading"
          :pagination="false"
          row-key="id"
          v-throttle:resize.100="handleTableResize"
        >
          <!-- 图片列 -->
          <template #image="{ text }">
            <a-image
              v-if="text"
              :src="text"
              :width="60"
              :height="60"
              style="object-fit: cover; border-radius: 4px"
              :fallback="defaultImage"
            />
            <span v-else>-</span>
          </template>

          <!-- 价格列 -->
          <template #price="{ text }"> ¥{{ text }} </template>

          <!-- 状态列 -->
          <template #active="{ text }">
            <a-tag :color="text === 1 ? 'green' : 'red'">
              {{ text === 1 ? '启用' : '禁用' }}
            </a-tag>
          </template>

          <!-- 操作列 -->
          <template #action="{ record }">
            <a-space>
              <a @click="handleEditSku(record)" v-debounce:click.300>编辑</a>
              <a @click="handleUpdateStock(record)" v-debounce:click.300
                >调整库存</a
              >
              <a-popconfirm
                title="确定要删除这个 SKU 吗？"
                @confirm="handleDeleteSku(record.id)"
                v-debounce:confirm.300
              >
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
      v-debounce:ok.300
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
            v-debounce:input.300
          />
        </a-form-item>

        <a-form-item label="颜色" name="color">
          <a-input
            v-model:value="skuFormData.color"
            placeholder="请输入颜色"
            v-debounce:input.300
          />
        </a-form-item>

        <a-form-item label="尺码" name="size">
          <a-input
            v-model:value="skuFormData.size"
            placeholder="请输入尺码"
            v-debounce:input.300
          />
        </a-form-item>

        <a-form-item label="价格" name="price">
          <a-input-number
            v-model:value="skuFormData.price"
            placeholder="请输入价格"
            :min="0"
            style="width: 100%"
            v-debounce:change.300
          />
        </a-form-item>

        <a-form-item label="库存" name="stock">
          <a-input-number
            v-model:value="skuFormData.stock"
            placeholder="请输入库存"
            :min="0"
            style="width: 100%"
            v-debounce:change.300
          />
        </a-form-item>

        <a-form-item label="图片地址" name="image">
          <a-input
            v-model:value="skuFormData.image"
            placeholder="请输入图片地址"
            v-debounce:input.300
          />
          <div v-if="skuFormData.image" class="image-preview">
            <a-image
              :src="skuFormData.image"
              :width="150"
              style="margin-top: 8px; border-radius: 4px"
              :fallback="defaultImage"
            />
          </div>
        </a-form-item>

        <a-form-item label="条形码" name="bar_code">
          <a-input
            v-model:value="skuFormData.bar_code"
            placeholder="请输入条形码"
            v-debounce:input.300
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
      v-debounce:ok.300
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
            v-debounce:change.300
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import DOMPurify from 'dompurify'
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

// 默认图片
const defaultImage = 'https://api.dicebear.com/7.x/shapes/svg?seed=Default'

// 列表数据
const list = ref<ProductInfo[]>([])
const loading = ref(false)

// 搜索条件
const searchText = ref('')
const searchStatus = ref<'ON_SALE' | 'OFF_SALE' | 'SOLD_OUT' | undefined>()

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

// XSS防护函数
const sanitizeHtml = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: [],
  })
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
  { title: 'ID', dataIndex: 'id', width: 80 },
  {
    title: '封面',
    dataIndex: 'cover_image',
    width: 100,
    slots: { customRender: 'cover' },
  },
  {
    title: '商品标题',
    dataIndex: 'title',
    slots: { customRender: 'title' },
  },
  {
    title: '商品副标题',
    dataIndex: 'subtitle',
    slots: { customRender: 'subtitle' },
  },
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
      pattern: /^[\u4e00-\u99fa5A-Z0-9-]+$/,
      message: 'SKU 编码只能包含大写字母、数字和连字符',
      trigger: 'blur',
    },
  ],
  color: [{ required: true, message: '请输入颜色', trigger: 'blur' }],
  size: [{ required: true, message: '请输入尺码', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
}

// SKU 表格列定义
const skuColumns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: 'SKU 编码', dataIndex: 'sku_code', width: 200 },
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
    width: 210,
    fixed: 'right',
    slots: { customRender: 'action' },
  },
]

// 库存调整
const stockModalVisible = ref(false)
const currentSku = ref<SkuInfo | null>(null)
const newStock = ref(0)

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

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchList()
}

// 重置
const handleReset = () => {
  searchText.value = ''
  searchStatus.value = undefined
  currentPage.value = 1
  fetchList()
}

// 表格变化
const handleTableChange = (pag: any) => {
  currentPage.value = pag.current
  pageSize.value = pag.pageSize
  fetchList()
}

// 表格大小改变
const handleTableResize = () => {
  // 可以在这里处理表格大小改变的逻辑
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
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败')
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
  editingSkuId.value = record.id
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
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败')
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

.search-area {
  /* margin-bottom: 16px; */
  padding: 0 24px;
  background: #fff;
  border-radius: 4px;
}

.table-area {
  background: #fff;
  border-radius: 4px;
  padding: 24px;
  min-height: 400px;
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
