<template>
  <div class="dashboard-container">
    <!-- 数据卡片 -->
    <a-row :gutter="16">
      <a-col :span="6">
        <a-card :loading="loading">
          <a-statistic
            title="总订单数"
            :value="dashboardData.total_orders"
            :value-style="{ color: '#3f8600' }"
          >
            <template #prefix>
              <shopping-outlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :loading="loading">
          <a-statistic
            title="已支付订单"
            :value="dashboardData.paid_orders"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <check-circle-outlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :loading="loading">
          <a-statistic
            title="待发货订单"
            :value="dashboardData.unshipped"
            :value-style="{ color: '#faad14' }"
          >
            <template #prefix>
              <clock-circle-outlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :loading="productLoading">
          <a-statistic
            title="商品总数"
            :value="totalProducts"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              <appstore-outlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区域 -->
    <a-row :gutter="16" style="margin-top: 16px">
      <!-- 订单状态分布 -->
      <a-col :span="12">
        <a-card title="订单状态分布" :loading="orderLoading">
          <div ref="orderChartRef" class="chart-container"></div>
        </a-card>
      </a-col>

      <!-- 商品分类分布 -->
      <a-col :span="12">
        <a-card title="商品分类分布" :loading="categoryLoading">
          <div
            ref="categoryChartRef"
            class="chart-container"
            v-show="!categoryLoading"
          ></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 最近订单 -->
    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :span="24">
        <a-card title="最近订单" :loading="orderLoading">
          <a-table
            :columns="orderColumns"
            :data-source="recentOrders"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record, text }">
              <template v-if="column.dataIndex === 'status'">
                <a-tag :color="getOrderStatusColor(text)">
                  {{ getOrderStatusText(text) }}
                </a-tag>
              </template>
              <template v-else-if="column.dataIndex === 'amount_payable'">
                ¥{{ text }}
              </template>
              <template v-else-if="column.dataIndex === 'created_at'">
                {{ formatTime(text) }}
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { getDashboardData } from '@/api/dashboard'
import { getOrders } from '@/api/order'
import { getProductList } from '@/api/products'
import { getCategoryList } from '@/api/category'
import type { DashboardData } from '@/types/dashboard'
import type { OrderInfo } from '@/types/order'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
} from '@ant-design/icons-vue'

// 仪表盘数据
const dashboardData = reactive<DashboardData>({
  total_orders: 0,
  paid_orders: 0,
  unshipped: 0,
})

// 加载状态
const loading = ref(false)
const orderLoading = ref(false)
const productLoading = ref(false)
const categoryLoading = ref(false)

// 其他数据
const totalProducts = ref(0)
const recentOrders = ref<OrderInfo[]>([])

// 图表引用
const orderChartRef = ref<HTMLDivElement>()
const categoryChartRef = ref<HTMLDivElement>()

// 图表实例
const orderChart = ref<echarts.ECharts | null>(null)
const categoryChart = ref<echarts.ECharts | null>(null)

// 订单列表列定义
const orderColumns = [
  { title: '订单号', dataIndex: 'order_no', width: 200 },
  { title: '用户ID', dataIndex: 'user_id', width: 100 },
  {
    title: '金额',
    dataIndex: 'amount_payable',
    width: 120,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 120,
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
  },
]

// 获取仪表盘数据
const fetchDashboardData = async () => {
  try {
    loading.value = true
    const res: any = await getDashboardData()

    if (res.code === 0 && res.data) {
      Object.assign(dashboardData, res.data)
    }
  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
    message.error('获取仪表盘数据失败')
  } finally {
    loading.value = false
  }
}

// 获取订单数据
const fetchOrderData = async () => {
  try {
    orderLoading.value = true
    const res: any = await getOrders({ page: 1, pageSize: 20 })

    if (res.code === 0 && res.data) {
      recentOrders.value = res.data.list.slice(0, 5) // 只显示最近5条

      // 统计订单状态
      const statusMap = new Map<string, number>()
      res.data.list.forEach((order: OrderInfo) => {
        statusMap.set(order.status, (statusMap.get(order.status) || 0) + 1)
      })

      console.log('订单列表响应:', res)
      console.log('状态映射:', statusMap)

      // 渲染订单状态图表
      renderOrderChart(statusMap)
    }
  } catch (error) {
    console.error('获取订单数据失败:', error)
  } finally {
    orderLoading.value = false
  }
}

// 获取商品数据
const fetchProductData = async () => {
  try {
    productLoading.value = true
    const res: any = await getProductList()

    if (res.code === 0 && res.data) {
      totalProducts.value = res.data.length
    }
  } catch (error) {
    console.error('获取商品数据失败:', error)
  } finally {
    productLoading.value = false
  }
}

// 获取分类数据
const fetchCategoryData = async () => {
  try {
    categoryLoading.value = true
    const res: any = await getCategoryList()

    if (res.code === 0 && res.data) {
      // 等待 DOM 更新
      await nextTick()

      // 统计一级分类
      const categoryMap = new Map<string, number>()
      res.data
        .filter((cat: any) => cat.level === 1)
        .forEach((cat: any) => {
          const children = res.data.filter((c: any) => c.parent_id === cat.id)
          categoryMap.set(cat.name, children.length)
        })

      console.log('分类列表响应:', res)
      console.log('分类映射:', categoryMap)

      // 再次等待 DOM 更新
      await nextTick()

      // 渲染分类图表
      renderCategoryChart(categoryMap)
    }
  } catch (error) {
    console.error('获取分类数据失败:', error)
  } finally {
    categoryLoading.value = false
  }
}

// 渲染订单状态图表
const renderOrderChart = async (statusMap: Map<string, number>) => {
  // 等待 DOM 更新
  await nextTick()

  if (!orderChartRef.value) {
    console.log('orderChartRef 不存在')
    return
  }

  // 检查数据
  if (statusMap.size === 0) {
    console.log('订单状态数据为空')
    return
  }

  // 销毁已存在的图表
  if (orderChart.value) {
    orderChart.value.dispose()
  }

  const chart = echarts.init(orderChartRef.value)
  orderChart.value = chart

  const data = Array.from(statusMap.entries()).map(([status, count]) => ({
    name: getOrderStatusText(status),
    value: count,
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: data,
      },
    ],
  }

  chart.setOption(option)
}

// 渲染分类图表
const renderCategoryChart = async (categoryMap: Map<string, number>) => {
  // 多次等待 DOM 更新
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 100))

  if (!categoryChartRef.value) {
    console.log('categoryChartRef 不存在')
    return
  }

  // 检查数据
  if (categoryMap.size === 0) {
    console.log('分类数据为空')
    return
  }

  // 销毁已存在的图表
  if (categoryChart.value) {
    categoryChart.value.dispose()
  }

  const chart = echarts.init(categoryChartRef.value)
  categoryChart.value = chart

  const data = Array.from(categoryMap.entries())

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map(([name]) => name),
      axisLabel: {
        rotate: 30,
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
      name: '子分类数量',
    },
    series: [
      {
        name: '子分类数量',
        type: 'bar',
        data: data.map(([, count]) => count),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' },
          ]),
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#2378f7' },
              { offset: 0.7, color: '#2378f7' },
              { offset: 1, color: '#83bff6' },
            ]),
          },
        },
      },
    ],
  }

  chart.setOption(option)

  // 立即触发一次 resize
  chart.resize()
}

// 获取订单状态颜色
const getOrderStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    PENDING: 'orange',
    PAID: 'blue',
    SHIPPING: 'cyan',
    COMPLETED: 'green',
    CANCELLED: 'red',
    CANCELED: 'red',
  }
  return colorMap[status] || 'default'
}

// 获取订单状态文本
const getOrderStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    UNPAID: '待支付',
    PAID: '已支付',
    SHIPPING: '配送中',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
    CANCELED: '已取消',
  }
  return textMap[status] || status
}

// 格式化时间
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 窗口大小改变时重新调整图表
const handleResize = () => {
  if (orderChart.value) {
    orderChart.value.resize()
  }
  if (categoryChart.value) {
    categoryChart.value.resize()
  }
}

// 初始化
onMounted(async () => {
  // 先获取仪表盘数据
  await fetchDashboardData()

  // 然后并行获取其他数据
  await Promise.all([fetchOrderData(), fetchProductData()])

  // 最后获取分类数据
  await fetchCategoryData()
})

// 组件卸载时清理
onUnmounted(() => {
  if (orderChart.value) {
    orderChart.value.dispose()
  }
  if (categoryChart.value) {
    categoryChart.value.dispose()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px;
}

:deep(.ant-card) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

:deep(.ant-card-head-title) {
  font-weight: 600;
}

:deep(.ant-statistic-title) {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
}

:deep(.ant-statistic-content) {
  font-size: 24px;
  font-weight: 600;
}
</style>
