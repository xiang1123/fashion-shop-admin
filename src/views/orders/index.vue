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
          />
        </a-form-item>
        <a-form-item label="订单状态">
          <a-select
            v-model:value="searchStatus"
            placeholder="请选择订单状态"
            style="width: 200px"
            allow-clear
          >
            <a-select-option value="PENDING">待支付</a-select-option>
            <a-select-option value="PAID">已支付</a-select-option>
            <a-select-option value="SHIPPING">配送中</a-select-option>
            <a-select-option value="COMPLETED">已完成</a-select-option>
            <a-select-option value="CANCELED">已取消</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">搜索</a-button>
          <a-button style="margin-left: 8px" @click="handleReset"
            >重置</a-button
          >
        </a-form-item>
      </a-form>
    </div>

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
        <!-- 订单号列 -->
        <template #orderNo="{ text }">
          <a-typography-text copyable>{{ text }}</a-typography-text>
        </template>

        <!-- 状态列 -->
        <template #status="{ text }">
          <a-tag :color="getStatusColor(text)">
            {{ getStatusText(text) }}
          </a-tag>
        </template>

        <!-- 金额列 -->
        <template #amount="{ text }"> ¥{{ text }} </template>

        <!-- 时间列 -->
        <template #time="{ text }">
          {{ formatTime(text) }}
        </template>

        <!-- 操作列 -->
        <template #action="{ record }">
          <a-space>
            <a @click="handleView(record)">查看</a>
            <a v-if="record.status === 'PAID'" @click="handleShip(record)"
              >发货</a
            >
            <a-popconfirm
              v-if="record.status === 'PENDING' || record.status === 'PAID'"
              title="确定要取消这个订单吗？"
              @confirm="handleCancel(record.id)"
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
            <a-typography-text copyable>{{
              currentOrder.order_no
            }}</a-typography-text>
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
            {{ currentOrder.receiver_name }}
          </a-descriptions-item>
          <a-descriptions-item
            label="收货地址"
            :span="2"
            v-if="currentOrder.address"
          >
            {{ currentOrder.address }}
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
          <template #price="{ text }"> ¥{{ text }} </template>
        </a-table>

        <div class="modal-footer">
          <a-button @click="detailVisible = false">关闭</a-button>
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
          />
        </a-form-item>
        <a-form-item label="物流单号" name="tracking_no">
          <a-input
            v-model:value="shipForm.tracking_no"
            placeholder="请输入物流单号"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { getOrders, getOrderDetail, shipOrder, cancelOrder } from '@/api/order'
import type { OrderInfo, OrderStatus, ShipParams } from '@/types/order'
import type { FormInstance } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

const searchOrderNo = ref('')
const searchStatus = ref<OrderStatus | undefined>()

// 列表数据
const list = ref<OrderInfo[]>([])
const total = ref(0)
const loading = ref(false)

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '订单号',
    dataIndex: 'order_no',
    width: 200,
    slots: { customRender: 'orderNo' },
  },
  {
    title: '用户ID',
    dataIndex: 'user_id',
    width: 100,
  },
  {
    title: '订单金额',
    dataIndex: 'amount_payable',
    width: 120,
    slots: { customRender: 'amount' },
  },
  {
    title: '订单状态',
    dataIndex: 'status',
    width: 120,
    slots: { customRender: 'status' },
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    width: 180,
    slots: { customRender: 'time' },
  },
  {
    title: '操作',
    key: 'action',
    width: 180,
    fixed: 'right',
    slots: { customRender: 'action' },
  },
]

// 商品列表列定义
const itemColumns = [
  {
    title: '商品名称',
    dataIndex: 'title',
  },
  {
    title: '单价',
    dataIndex: 'unit_price',
    slots: { customRender: 'price' },
  },
  {
    title: '数量',
    dataIndex: 'quantity',
  },
  {
    title: '小计',
    dataIndex: 'total_price',
    slots: { customRender: 'price' },
  },
]

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
  tracking_no: '',
})
const shipOrderId = ref<number | null>(null)

const shipRules = {
  company: [{ required: true, message: '请输入物流公司', trigger: 'blur' }],
  tracking_no: [{ required: true, message: '请输入物流单号', trigger: 'blur' }],
}

// 分页配置
const pagination = computed(() => ({
  total: total.value,
  current: currentPage.value,
  pageSize: pageSize.value,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`,
}))

const handleSearch = () => {
  currentPage.value = 1
  getList()
}
const handleReset = () => {
  searchOrderNo.value = ''
  searchStatus.value = undefined
  getList()
}

const handleTableChange = (pagination: any) => {
  currentPage.value = pagination.current
  pageSize.value = pagination.pageSize
  getList()
}

// 提交发货
const handleShipSubmit = async () => {
  try {
    await shipFormRef.value?.validate()

    if (shipOrderId.value) {
      await shipOrder(shipOrderId.value, shipForm)
      message.success('发货成功')
      shipVisible.value = false
      getList()
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

// 获取状态颜色
const getStatusColor = (status: OrderStatus) => {
  const colorMap: Record<OrderStatus, string> = {
    PENDING: 'orange',
    PAID: 'blue',
    SHIPPING: 'cyan',
    COMPLETED: 'green',
    CANCELED: 'red',
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
    CANCELED: '已取消',
  }
  return textMap[status] || status
}

// 格式化时间
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

const handleView = async (record: OrderInfo) => {
  try {
    const res: any = await getOrderDetail(record.id)
    if (res.code === 0 && res.data) {
      currentOrder.value = res.data
      detailVisible.value = true
    }
  } catch (error) {}
}

const handleShip = (record: OrderInfo) => {
  shipOrderId.value = record.id
  shipForm.company = ''
  shipForm.tracking_no = ''
  shipVisible.value = true
}

const handleCancel = async (id: number) => {
  try {
    await cancelOrder(id)
    message.success('取消订单成功')
    getList()
  } catch (error) {
    message.error('取消订单失败')
  }
}

const getList = async () => {
  try {
    loading.value = true
    const res: any = await getOrders({
      page: currentPage.value,
      pageSize: pageSize.value,
      order_no: searchOrderNo.value || undefined,
      status: searchStatus.value,
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

onMounted(() => {
  getList()
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
</style>
