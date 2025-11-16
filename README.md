 # Fashion Shop Admin - 后台管理系统

基于 Vue 3 + Ant Design Vue + Vite 构建的现代化电商后台管理系统，提供商品、订单、用户等核心功能的管理界面。

## 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **构建工具**: Vite 5.x
- **UI 组件库**: Ant Design Vue 4.x
- **状态管理**: Pinia
- **路由**: Vue Router 4.x
- **HTTP 客户端**: Axios
- **图表**: ECharts 5.x
- **语言**: TypeScript
- **样式**: SCSS

## 功能特性

### 核心功能
- ✅ 登录认证（JWT）
- ✅ 仪表盘（数据统计 + 图表）
- ✅ 分类管理（CRUD）
- ✅ 商品管理（SPU + SKU）
- ✅ 订单管理（查看、发货、取消）
- ✅ Banner 管理
- ✅ 用户管理（查看）
- ✅ 库存管理

### 界面特性
- 🎨 深色/浅色主题切换
- 📱 响应式布局
- 🎯 侧边栏菜单导航
- 🔄 统一的错误处理与消息提示
- 🔐 路由鉴权与自动跳转
- 💾 Token 持久化存储

## 项目结构

```text
admin/
├─ public/
│  └─ favicon.ico
├─ src/
│  ├─ api/                    # API 接口封装
│  │  ├─ request.ts           # axios 封装（拦截器）
│  │  ├─ auth.ts              # 登录接口
│  │  ├─ dashboard.ts         # 仪表盘
│  │  ├─ category.ts          # 分类
│  │  ├─ product.ts           # 商品
│  │  ├─ order.ts             # 订单
│  │  ├─ banner.ts            # Banner
│  │  └─ user.ts              # 用户
│  ├─ assets/                 # 静态资源
│  ├─ components/             # 全局组件
│  │  ├─ AppHeader.vue        # 顶部导航栏
│  │  └─ AppSider.vue         # 侧边栏菜单
│  ├─ layouts/                # 布局组件
│  │  └─ MainLayout.vue       # 主布局（侧边栏 + 顶栏 + 内容区）
│  ├─ pages/                  # 页面组件
│  │  ├─ Login.vue            # 登录页
│  │  ├─ Dashboard.vue        # 仪表盘
│  │  ├─ category/
│  │  │  └─ Index.vue         # 分类管理
│  │  ├─ product/
│  │  │  ├─ Index.vue         # 商品列表
│  │  │  └─ Edit.vue          # 商品编辑（含 SKU）
│  │  ├─ order/
│  │  │  ├─ Index.vue         # 订单列表
│  │  │  └─ Detail.vue        # 订单详情
│  │  ├─ banner/
│  │  │  └─ Index.vue         # Banner 管理
│  │  └─ user/
│  │     └─ Index.vue         # 用户列表
│  ├─ router/
│  │  └─ index.ts             # 路由配置（含鉴权）
│  ├─ store/
│  │  ├─ index.ts             # Pinia 入口
│  │  └─ modules/
│  │     ├─ auth.ts           # 用户状态（Token）
│  │     └─ theme.ts          # 主题状态（深色/浅色）
│  ├─ styles/
│  │  ├─ variables.scss       # CSS 变量
│  │  └─ global.scss          # 全局样式
│  ├─ utils/
│  │  └─ storage.ts           # localStorage 封装
│  ├─ App.vue                 # 根组件（主题配置）
│  └─ main.ts                 # 入口文件
├─ .env.development           # 开发环境变量
├─ .env.production            # 生产环境变量
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts             # Vite 配置（代理、别名）
└─ README.md
```

## 安装与运行

### 环境要求
- Node.js >= 18.x
- npm >= 9.x（或使用 pnpm / yarn）

### 安装依赖

```bash
cd admin
npm install
```

### 开发模式

```bash
npm run dev
```

默认运行在 `http://localhost:5174`，通过 Vite 代理将 `/api` 和 `/admin` 前缀的请求转发到后端 `http://localhost:8000`。

### 生产构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

### 预览构建产物

```bash
npm run preview
```

## 配置说明

### 环境变量

- **`.env.development`** （开发环境）
```env
VITE_API_BASE_URL=http://localhost:8000
```

- **`.env.production`** （生产环境）
```env
VITE_API_BASE_URL=https://your-domain.com
```

### Vite 代理配置

在 `vite.config.ts` 中配置了开发代理：

```typescript
server: {
  port: 5174,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true
    },
    '/admin': {
      target: 'http://localhost:8000',
      changeOrigin: true
    }
  }
}
```

生产环境下，需在 Nginx 等反向代理中配置对应路由。

## 默认账号

确保后端已初始化管理员账户（参考后端 README），默认账号：

- **用户名**: `admin`
- **密码**: `admin123`

## API 接口约定

所有接口返回统一格式：

```json
{
  "code": 0,
  "message": "ok",
  "data": { ... }
}
```

- `code === 0` 表示成功，否则为失败
- 401 状态码自动清除 Token 并跳转至登录页

### 接口列表概览

| 模块 | 接口 | 说明 |
|------|------|------|
| **登录** | `POST /admin/api/v1/auth/login` | 管理员登录 |
| **仪表盘** | `GET /admin/api/v1/dashboard` | 统计数据 |
| **分类** | `GET/POST/PATCH/DELETE /admin/api/v1/categories` | 分类 CRUD |
| **商品** | `GET/POST/PATCH/DELETE /admin/api/v1/products` | 商品 CRUD |
| **SKU** | `GET/POST/PATCH/DELETE /admin/api/v1/products/{id}/skus` | SKU 管理 |
| **库存** | `GET/PATCH /admin/api/v1/skus/{id}/stock` | 库存管理 |
| **订单** | `GET /admin/api/v1/orders` | 订单列表 |
|  | `GET /admin/api/v1/orders/{id}` | 订单详情 |
|  | `POST /admin/api/v1/orders/{id}/ship` | 发货 |
|  | `POST /admin/api/v1/orders/{id}/cancel` | 取消订单 |
| **Banner** | `GET/POST/PATCH/DELETE /admin/api/v1/banners` | Banner CRUD |
| **用户** | `GET /admin/api/v1/users` | 用户列表 |

## 使用指南

### 登录

1. 访问 `http://localhost:5174/login`
2. 输入用户名和密码（默认 `admin` / `admin123`）
3. 登录成功后跳转至仪表盘，Token 保存在 `localStorage`

### 分类管理

- 支持新增、编辑、删除分类
- 可设置父级分类（二级分类）
- 排序与显示/隐藏控制

### 商品管理

- **商品列表**: 展示所有 SPU，支持编辑和删除
- **新增/编辑商品**:
  - 填写标题、副标题、描述、封面图
  - 设置状态（草稿、上架、下架）
  - **SKU 管理**: 在商品编辑页动态添加多个 SKU（颜色、尺码、价格、库存）

### 订单管理

- **订单列表**: 分页展示所有订单，支持按状态筛选
- **订单详情**: 查看订单信息（收货人、商品明细）
- **发货**: 对已支付订单填写快递公司与快递单号进行发货
- **取消**: 取消未支付订单

### Banner 管理

- 新增 Banner：上传图片 URL、设置跳转链接与排序
- 编辑与删除 Banner
- 启用/禁用控制

### 用户管理

- 查看用户列表（只读）
- 点击"详情"查看用户基本信息

## 主题切换

顶部导航栏右侧有主题开关（☀️ / 🌙），点击可在浅色与深色主题间切换，基于 Ant Design Vue 的 `theme.algorithm`。

## 开发建议

### 添加新页面

1. 在 `src/pages/` 下创建新组件（如 `src/pages/setting/Index.vue`）
2. 在 `src/router/index.ts` 中添加路由：
```typescript
{
  path: 'setting',
  component: () => import('@/pages/setting/Index.vue')
}
```
3. 在 `src/layouts/MainLayout.vue` 的菜单中添加对应菜单项

### 新增 API 接口

在 `src/api/` 下创建对应模块文件（如 `setting.ts`），使用统一的 `request` 实例：

```typescript
import request from './request'

export const getSetting = () => request.get('/admin/api/v1/setting')
export const updateSetting = (data: any) => request.patch('/admin/api/v1/setting', data)
```

### 错误处理

- 所有接口请求失败会自动弹出错误提示（`message.error`）
- 401 未授权自动跳转至登录页
- 业务错误（`code !== 0`）也会自动提示

## 常见问题

### 1. 登录后刷新页面丢失状态？

Token 已持久化到 `localStorage`，刷新页面会自动读取。如果仍然丢失，检查：
- `utils/storage.ts` 中的 `TOKEN_KEY` 是否正确
- 后端 Token 是否过期（默认 30 天）

### 2. 请求 404 或 CORS 错误？

开发模式下检查 `vite.config.ts` 的代理配置是否正确：
```typescript
proxy: {
  '/api': { target: 'http://localhost:8000', changeOrigin: true },
  '/admin': { target: 'http://localhost:8000', changeOrigin: true }
}
```

生产模式下需在 Nginx 等反向代理中配置：
```nginx
location /admin/ {
  proxy_pass http://backend_server:8000;
}
```

### 3. 图片上传功能未实现？

当前版本商品封面图与 Banner 图片使用 URL 输入。如需上传功能：
- 后端实现文件上传接口（如 `POST /admin/api/v1/upload`）
- 前端使用 `a-upload` 组件调用接口并获取图片 URL

### 4. 主题切换后刷新丢失？

当前主题状态未持久化，刷新后恢复默认。如需持久化：
```typescript
// src/store/modules/theme.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem('theme') === 'dark')

  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  return { isDark, toggleTheme }
})
```

## 性能优化

- **路由懒加载**: 所有页面组件使用动态 `import()`
- **按需引入**: Ant Design Vue 支持 Tree Shaking
- **构建优化**: Vite 默认使用 Rollup 进行代码分割
- **图片懒加载**: 可使用 `a-image` 的 `lazy` 属性

## 部署

### Nginx 配置示例

```nginx
server {
  listen 80;
  server_name admin.yourdomain.com;

  root /var/www/fashion-shop-admin/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /admin/ {
    proxy_pass http://backend_server:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  location /api/ {
    proxy_pass http://backend_server:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

### Docker 部署

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 后续扩展

- [ ] 商品图片上传（OSS/本地）
- [ ] 批量发货（导入 Excel）
- [ ] 订单导出
- [ ] 更细粒度的角色权限（RBAC）
- [ ] 操作日志与审计
- [ ] 更丰富的数据图表（商品销量、用户增长）
- [ ] 移动端适配优化
- [ ] 国际化（i18n）
- [ ] 单元测试与 E2E 测试

## 技术支持

如有问题或建议，可通过以下方式联系：
- 提交 Issue
- 发送邮件至 support@yourdomain.com

---

**License**: MIT

**Copyright** © 2025 Fashion Shop