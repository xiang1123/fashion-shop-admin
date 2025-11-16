<template>
  <div class="order-container">
    <!-- 搜索区域 -->
    <div class="search-area">
      <a-form layout="inline">
        <a-form-item label="订单号">
          <a-input
            v-model:value="searchOrderNo"
            placeholder="请输入订单号"
            allow-clear
            style="width: 200px"
            v-debounce:input.300="handleSearch"
          />
        </a-form-item>
        <a-form-item label="订单状态">
          <a-select
            v-model:value="searchStatus"
            placeholder="请选择状态"
            allow-clear
            style="width: 150px"
            v-debounce:change.300="handleSearch"
          >
            <a-select-option value="PENDING">待支付</a-select-option>
            <a-select-option value="PAID">已支付</a-select-option>
            <a-select-option value="SHIPPING">配送中</a-select-option>
            <a-select-option value="COMPLETED">已完成</a-select-option>
            <a-select-option value="CANCELLED">已取消</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch" v-debounce:click.300>搜索</a-button>
          <a-button style="margin-left: 8px" @click="handleReset" v-debounce:click.300>重置</a-button>
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
      <a-empty
        v-else-if="list.length === 0"
        description="暂无订单数据"
      >
        <template #image>
          <svg style="width: 64px; height: 64px" viewBox="64 864 864 864">
            <path
              fill="#e6e6e6"
              d="M832 64H192c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zm-600 72h560v208H232V136zm560 480H232V416h560v200zm-262-256H232v-72h298v72z"
            />
          </svg>
        </template>
      </a-empty>

      <!-- 表格 -->
      <a-table
        v-else
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
        v-throttle:resize.100="handleTableResize"
      >
        <!-- 订单号列（XSS防护）-->
        <template #orderNo="{ text }">
          <a-typography-text copyable>
            {{ sanitizeHtml(text) }}
          </a-typography-text>
        </template>

        <!-- 状态列 -->
        <template #status="{ text }">
          <a-tag :color="getStatusColor(text)">
            {{ getStatusText(text) }}
          </a-tag>
        </template>

        <!-- 金额列 -->
        <template #amount="{ text }">
          ¥{{ text }}
        </template>

        <!-- 时间列 -->
        <template #time="{ text }">
          {{ formatTime(text) }}
        </template>

        <!-- 操作列 -->
        <template #action="{ record }">
          <a-space>
            <a @click="handleView(record)" v-debounce:click.300>查看</a>
            <a v-if="record.status === 'PAID'" @click="handleShip(record)" v-debounce:click.300>发货</a>
            <a-popconfirm
              v-if="record.status === 'PENDING' || record.status === 'PAID'"
              title="确定要取消这个订单吗？"
              @confirm="handleCancel(record.id)"
              v-debounce:confirm.300
            >
              <a style="color: #ff4d4f">取消</a>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </div>

    <!-- 订单详情模态框 -->
    <a-modal
      v-model:visible="detailVisible"
      title="订单详情"
      width="700px"
      :footer="null"
    >
      <div v-if="currentOrder" class="order-detail">
        <!-- 订单信息 -->
        <a-descriptions title="订单信息" :column="2" bordered>
          <a-descriptions-item label="订单号">
            <a-typography-text copyable>
              {{ sanitizeHtml(currentOrder.order_no) }}
            </a-typography-text>
          </a-descriptions-item>
          <a-descriptions-item label="订单状态">
            <a-tag :color="getStatusColor(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="订单总额">
            ¥{{ currentOrder.amount_total }}
          </a-descriptions-item>
          <a-descriptions-item label="实付金额">
            ¥{{ currentOrder.amount_payable }}
          </a-descriptions-item>
          <a-descriptions-item label="收货人" v-if="currentOrder.receiver_name">
            {{ sanitizeHtml(currentOrder.receiver_name) }}
          </a-descriptions-item>
          <a-descriptions-item label="收货地址" :span="2" v-if="currentOrder.address">
            {{ sanitizeHtml(currentOrder.address) }}
          </a-descriptions-item>
        </a-descriptions>

        <!-- 商品列表 -->
        <a-divider>商品列表</a-divider>
        <a-table
          :columns="itemColumns"
          :data-source="currentOrder.items"
          :pagination="false"
          size="small"
        >
          <template #title="{ text }">
            {{ sanitizeHtml(text) }}
          </template>
          <template #price="{ text }">
            ¥{{ text }}
          </template>
        </a-table>

        <div class="modal-footer">
          <a-button @click="detailVisible = false" v-debounce:click.300>关闭</a-button>
        </div>
      </div>
    </a-modal>

    <!-- 发货模态框 -->
    <a-modal
      v-model:visible="shipVisible"
      title="订单发货"
      width="500px"
      @ok="handleShipSubmit"
      @cancel="handleShipCancel"
      v-debounce:ok.300
    >
      <a-form
        ref="shipFormRef"
        :model="shipForm"
        :rules="shipRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 17 }"
      >
        <a-form-item label="物流公司" name="company">
          <a-input
            v-model:value="shipForm.company"
            placeholder="请输入物流公司"
            v-debounce:input.300
          />
        </a-form-item>
        <a-form-item label="物流单号" name="tracking_no">
          <a-input
            v-model:value="shipForm.tracking_no"
            placeholder="请输入物流单号"
            v-debounce:input.300
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import DOMPurify from 'dompurify'
import { getOrders, getOrderDetail, shipOrder, cancelOrder } from '@/api/order'
import type { OrderInfo, OrderStatus, ShipParams } from '@/types/order'
import type { FormInstance } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

// 列表数据
const list = ref<OrderInfo[]>([])
const total = ref(0)
const loading = ref(false)

// 搜索条件
const searchOrderNo = ref('')
const searchStatus = ref<OrderStatus | undefined>()

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)

// 当前订单
const currentOrder = ref<OrderInfo | null>(null)
const detailVisible = ref(false)

// 发货表单
const shipVisible = ref(false)
const shipFormRef = ref<FormInstance>()
const shipForm = reactive<ShipParams>({
  company: '',
  tracking_no: ''
})
const shipOrderId = ref<number | null>(null)

const shipRules = {
  company: [{ required: true, message: '请输入物流公司', trigger: 'blur' }],
  tracking_no: [{ required: true, message: '请输入物流单号', trigger: 'blur' }]
}

// XSS防护函数
const sanitizeHtml = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
}

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80
  },
  {
    title: '订单号',
    dataIndex: 'order_no',
    width: 200,
    slots: { customRender: 'orderNo' }
  },
  {
    title: '用户ID',
    dataIndex: 'user_id',
    width: 100
  },
  {
    title: '订单金额',
    dataIndex: 'amount_payable',
    width: 120,
    slots: { customRender: 'amount' }
  },
  {
    title: '订单状态',
    dataIndex: 'status',
    width: 120,
    slots: { customRender: 'status' }
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    width: 180,
    slots: { customRender: 'time' }
  },
  {
    title: '操作',
    key: 'action',
    width: 180,
    fixed: 'right',
    slots: { customRender: 'action' }
  }
]

// 商品列表列定义
const itemColumns = [
  {
    title: '商品名称',
    dataIndex: 'title',
    slots: { customRender: 'title' }
  },
  {
    title: '单价',
    dataIndex: 'unit_price',
    slots: { customRender: 'price' }
  },
  {
    title: '数量',
    dataIndex: 'quantity'
  },
  {
    title: '小计',
    dataIndex: 'total_price',
    slots: { customRender: 'price' }
  }
]

// 分页配置
const pagination = computed(() => ({
  total: total.value,
  current: currentPage.value,
  pageSize: pageSize.value,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`
}))

// 获取订单列表
const fetchList = async () => {
  try {
    loading.value = true
    const res = await getOrders({
      page: currentPage.value,
      pageSize: pageSize.value,
      order_no: searchOrderNo.value || undefined,
      status: searchStatus.value
    })

    if (res.code === 0 && res.data) {
      list.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    message.error('获取订单列表失败')
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
  searchOrderNo.value = ''
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

// 查看详情
const handleView = async (record: OrderInfo) => {
  try {
    const res = await getOrderDetail(record.id)
    
    if (res.code === 0 && res.data) {
      currentOrder.value = res.data
      detailVisible.value = true
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    message.error('获取订单详情失败')
  }
}

// 发货
const handleShip = (record: OrderInfo) => {
  shipOrderId.value = record.id
  shipForm.company = ''
  shipForm.tracking_no = ''
  shipVisible.value = true
}

// 提交发货
const handleShipSubmit = async () => {
  try {
    await shipFormRef.value?.validate()
    
    if (shipOrderId.value) {
      await shipOrder(shipOrderId.value, shipForm)
      message.success('发货成功')
      shipVisible.value = false
      fetchList()
    }
  } catch (error) {
    console.error('发货失败:', error)
  }
}

// 取消发货
const handleShipCancel = () => {
  shipVisible.value = false
  shipFormRef.value?.resetFields()
}

// 取消订单
const handleCancel = async (id: number) => {
  try {
    await cancelOrder(id)
    message.success('取消订单成功')
    fetchList()
  } catch (error) {
    console.error('取消订单失败:', error)
    message.error('取消订单失败')
  }
}

// 获取状态颜色
const getStatusColor = (status: OrderStatus) => {
  const colorMap: Record<OrderStatus, string> = {
    PENDING: 'orange',
    PAID: 'blue',
    SHIPPING: 'cyan',
    COMPLETED: 'green',
    CANCELED: 'red'
  }
  return colorMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status: OrderStatus) => {
  const textMap: Record<OrderStatus, string> = {
    PENDING: '待支付',
    PAID: '已支付',
    SHIPPING: '配送中',
    COMPLETED: '已完成',
    CANCELED: '已取消'
  }
  return textMap[status] || status
}

// 格式化时间
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 初始化
onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.search-area {
  margin-bottom: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 4px;
}

.table-area {
  background: #fff;
  border-radius: 4px;
  padding: 24px;
  min-height: 400px;
}

.order-detail {
  padding: 20px 0;
}

.modal-footer {
  margin-top: 24px;
  text-align: right;
}

:deep(.ant-descriptions-item-label) {
  font-weight: 500;
}

:deep(.ant-empty) {
  margin: 60px 0;
}

:deep(.ant-skeleton) {
  padding: 24px;
}
</style>
