<template>
  <div class="order-container">
    <a-card :bordered="false" class="main-card">
      <div class="search-area">
        <a-form layout="inline">
          <a-form-item label="订单号">
            <a-input
              v-model:value="searchOrderNo"
              placeholder="请输入订单号"
              allow-clear
              style="width: 200px"
              @pressEnter="handleSearch"
            />
          </a-form-item>
          <a-form-item label="订单状态">
            <a-select
              v-model:value="searchStatus"
              placeholder="请选择状态"
              allow-clear
              style="width: 150px"
              @change="handleSearch"
            >
              <a-select-option value="PENDING">待支付</a-select-option>
              <a-select-option value="PAID">已支付</a-select-option>
              <a-select-option value="SHIPPING">配送中</a-select-option>
              <a-select-option value="COMPLETED">已完成</a-select-option>
              <a-select-option value="CANCELLED">已取消</a-select-option>
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

      <div class="table-area">
        <a-table
          :columns="columns"
          :data-source="list"
          :loading="loading"
          :pagination="pagination"
          @change="handleTableChange"
          row-key="id"
        >
          <template #orderNo="{ text }">
            <a-typography-text copyable>
              {{ text }}
            </a-typography-text>
          </template>

          <template #status="{ text }">
            <a-tag :color="getStatusColor(text)">
              {{ getStatusText(text) }}
            </a-tag>
          </template>

          <template #amount="{ text }">
            <span style="color: #f50">¥{{ Number(text).toFixed(2) }}</span>
          </template>

          <template #time="{ text }">
            {{ text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-' }}
          </template>

          <template #action="{ record }">
            <a-space>
              <a @click="handleView(record)">详情</a>
              <a v-if="record.status === 'PAID'" @click="handleShip(record)"
                >发货</a
              >
              <a-popconfirm
                v-if="['PENDING', 'PAID'].includes(record.status)"
                title="确定要取消这个订单吗？"
                @confirm="handleCancel(record.id)"
              >
                <a style="color: #ff4d4f">取消</a>
              </a-popconfirm>
            </a-space>
          </template>
        </a-table>
      </div>
    </a-card>

    <a-modal
      v-model:visible="detailVisible"
      title="订单详情"
      width="800px"
      :footer="null"
    >
      <div v-if="currentOrder" class="order-detail">
        <a-steps
          :current="getStepCurrent(currentOrder.status)"
          size="small"
          style="margin-bottom: 24px"
        >
          <a-step title="待支付" />
          <a-step title="已支付" />
          <a-step title="配送中" />
          <a-step title="已完成" />
        </a-steps>

        <a-descriptions title="基础信息" bordered size="small" :column="2">
          <a-descriptions-item label="订单号">{{
            currentOrder.order_no
          }}</a-descriptions-item>
          <a-descriptions-item label="下单时间">{{
            dayjs(currentOrder.created_at).format('YYYY-MM-DD HH:mm:ss')
          }}</a-descriptions-item>
          <a-descriptions-item label="订单金额"
            >¥{{
              Number(currentOrder.amount_total).toFixed(2)
            }}</a-descriptions-item
          >
          <a-descriptions-item label="实付金额"
            ><span style="color: red; font-weight: bold"
              >¥{{ Number(currentOrder.amount_payable).toFixed(2) }}</span
            ></a-descriptions-item
          >
          <a-descriptions-item label="收货人">{{
            currentOrder.receiver_name
          }}</a-descriptions-item>
          <a-descriptions-item label="联系电话">{{
            currentOrder.receiver_phone
          }}</a-descriptions-item>
          <a-descriptions-item label="收货地址" :span="2">{{
            currentOrder.address
          }}</a-descriptions-item>

          <template v-if="currentOrder.ship_company">
            <a-descriptions-item label="物流公司">{{
              currentOrder.ship_company
            }}</a-descriptions-item>
            <a-descriptions-item label="物流单号">{{
              currentOrder.ship_no
            }}</a-descriptions-item>
          </template>
        </a-descriptions>

        <a-divider orientation="left">商品清单</a-divider>
        <a-table
          :columns="itemColumns"
          :data-source="currentOrder.items"
          :pagination="false"
          size="middle"
          bordered
        >
          <template #productInfo="{ record }">
            <div style="display: flex; align-items: flex-start">
              <a-image
                :src="record.product_image"
                :width="60"
                :height="60"
                style="
                  object-fit: cover;
                  border-radius: 4px;
                  border: 1px solid #f0f0f0;
                  flex-shrink: 0;
                "
                fallback="https://api.dicebear.com/7.x/shapes/svg?seed=Default"
              />
              <div style="margin-left: 12px; overflow: hidden">
                <div
                  style="
                    font-weight: 500;
                    margin-bottom: 4px;
                    font-size: 14px;
                    color: #1f1f1f;
                  "
                >
                  {{ record.title }}
                </div>
                <a-tag
                  color="blue"
                  style="border: none; background: #f0f5ff; color: #2f54eb"
                >
                  {{ record.sku_info || '默认规格' }}
                </a-tag>
              </div>
            </div>
          </template>

          <template #price="{ text }">
            <span style="font-family: Arial; font-weight: 500"
              >¥{{ Number(text).toFixed(2) }}</span
            >
          </template>
        </a-table>
      </div>
    </a-modal>

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
          <a-select
            v-model:value="shipForm.company"
            placeholder="请选择或输入物流公司"
          >
            <a-select-option value="顺丰速运">顺丰速运</a-select-option>
            <a-select-option value="中通快递">中通快递</a-select-option>
            <a-select-option value="圆通速递">圆通速递</a-select-option>
            <a-select-option value="韵达快递">韵达快递</a-select-option>
            <a-select-option value="EMS">EMS</a-select-option>
          </a-select>
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
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { getOrders, getOrderDetail, shipOrder, cancelOrder } from '@/api/order'
import type { OrderInfo, ShipParams } from '@/types/order'

// 列表数据
const list = ref<OrderInfo[]>([])
const total = ref(0)
const loading = ref(false)

// 搜索条件
const searchOrderNo = ref('')
const searchStatus = ref<string | undefined>(undefined)

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)

// 当前订单
const currentOrder = ref<any>(null)
const detailVisible = ref(false)

// 发货表单
const shipVisible = ref(false)
const shipFormRef = ref<FormInstance>()
const shipForm = reactive<ShipParams>({ company: '', tracking_no: '' })
const shipOrderId = ref<number | null>(null)

const shipRules = {
  company: [{ required: true, message: '请选择物流公司', trigger: 'change' }],
  tracking_no: [{ required: true, message: '请输入物流单号', trigger: 'blur' }],
}

// 主表格列定义
const columns = [
  { title: 'ID', dataIndex: 'id', width: 80, align: 'center' },
  {
    title: '订单号',
    dataIndex: 'order_no',
    width: 200,
    slots: { customRender: 'orderNo' },
  },
  { title: '收货人', dataIndex: 'receiver_name', width: 100 },
  {
    title: '订单金额',
    dataIndex: 'amount_payable',
    width: 120,
    align: 'right',
    slots: { customRender: 'amount' },
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    align: 'center',
    slots: { customRender: 'status' },
  },
  {
    title: '下单时间',
    dataIndex: 'created_at',
    width: 180,
    align: 'center',
    slots: { customRender: 'time' },
  },
  {
    title: '操作',
    key: 'action',
    width: 180,
    fixed: 'right',
    align: 'center',
    slots: { customRender: 'action' },
  },
]

// 详情页商品列定义 (优化布局：单价/小计右对齐，数量居中)
const itemColumns = [
  { title: '商品信息', slots: { customRender: 'productInfo' } },
  {
    title: '单价',
    dataIndex: 'price',
    width: 120,
    align: 'right',
    slots: { customRender: 'price' },
  },
  { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
  {
    title: '小计',
    dataIndex: 'total_price',
    width: 120,
    align: 'right',
    slots: { customRender: 'price' },
  },
]

const pagination = computed(() => ({
  total: total.value,
  current: currentPage.value,
  pageSize: pageSize.value,
  showSizeChanger: true,
  showTotal: (t: number) => `共 ${t} 条`,
}))

// 获取订单列表
const fetchList = async () => {
  loading.value = true
  try {
    const res: any = await getOrders({
      page: currentPage.value,
      page_size: pageSize.value,
      order_no: searchOrderNo.value,
      status: searchStatus.value,
    })

    if (res.code === 0) {
      list.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    message.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchList()
}
const handleReset = () => {
  searchOrderNo.value = ''
  searchStatus.value = undefined
  currentPage.value = 1
  fetchList()
}

const handleTableChange = (pag: any) => {
  currentPage.value = pag.current
  pageSize.value = pag.pageSize
  fetchList()
}

const handleView = async (record: OrderInfo) => {
  try {
    const res: any = await getOrderDetail(record.id)
    if (res.code === 0) {
      currentOrder.value = res.data
      detailVisible.value = true
    }
  } catch (error) {
    message.error('获取详情失败')
  }
}

const handleShip = (record: OrderInfo) => {
  shipOrderId.value = record.id
  shipForm.company = ''
  shipForm.tracking_no = ''
  shipVisible.value = true
}

const handleShipSubmit = async () => {
  await shipFormRef.value?.validate()
  if (!shipOrderId.value) return
  try {
    await shipOrder(shipOrderId.value, shipForm)
    message.success('发货成功')
    shipVisible.value = false
    fetchList()
  } catch (e: any) {
    message.error(e.response?.data?.message || '发货失败')
  }
}

const handleShipCancel = () => {
  shipVisible.value = false
}

const handleCancel = async (id: number) => {
  try {
    await cancelOrder(id)
    message.success('订单已取消')
    fetchList()
  } catch (e: any) {
    message.error(e.response?.data?.message || '取消失败')
  }
}

const getStatusColor = (status: string) => {
  const map: any = {
    PENDING: 'orange',
    PAID: 'blue',
    SHIPPING: 'cyan',
    COMPLETED: 'green',
    CANCELLED: 'red',
  }
  return map[status] || 'default'
}

const getStatusText = (status: string) => {
  const map: any = {
    UNPAID: '待支付',
    PAID: '已支付',
    SHIPPING: '配送中',
    COMPLETED: '已完成',
    CANCELED: '已取消',
  }
  return map[status] || status
}

const getStepCurrent = (status: string) => {
  const map: any = {
    PENDING: 0,
    PAID: 1,
    SHIPPING: 2,
    COMPLETED: 3,
    CANCELLED: 0,
  }
  return map[status] || 0
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.order-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}
.search-area {
  margin-bottom: 16px;
}
.table-area {
  min-height: 400px;
}
</style>
