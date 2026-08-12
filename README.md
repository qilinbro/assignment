# 英语课程作业管理系统

为英语课程（应用文 + 读后续写）设计的全栈作业管理平台。学生上传图片提交作业，助教在线看图批改，管理员统一管理 —— 已接入真实数据库、对象存储与 AI 视觉批改。

## 🚀 线上部署

**访问地址**：https://assignment.kirinbao.top

| 项目 | 详情 |
|------|------|
| 服务器 | 腾讯云 2H4G |
| 应用 | Next.js 15（Docker 容器，端口 3000） |
| 数据库 | PostgreSQL 16（Docker 容器） |
| 对象存储 | Cloudflare R2 |
| AI 模型 | GLM-4V 视觉模型 |
| 反向代理 | openresty（HTTPS / Let's Encrypt） |

---

## 功能

### 学生端
- 学号登录（首登强制改密）
- 提交作业 / 补交作业（服务端按截止时间判断）
- 上传作业图片（多张，存到 R2）
- 查看批改成绩和评语
- 申请修改（需管理员审批）

### 助教端
- 查看待批改列表（按等待时间排序）
- 连续批改模式（批完一份自动跳下一份）
- 看图批改（左侧学生作业图片，右侧打分 + 评语）
- AI 辅助：GLM-4V 自动分析作业图片并生成评语建议
- 管理负责学生

### 管理员端
- 发布 / 编辑 / 删除作业（应用文 15 分 / 读后续写 25 分）
- 自动生成提交链接（发到群里学生点开就能交）
- 全局数据总览（提交率、批改率、平均分）
- 查看每份提交的批改详情
- 未交名单
- 审批修改申请
- 学生管理

---

## 技术栈

| 层 | 技术 |
|------|------|
| 框架 | Next.js 15（App Router）+ React 19 + TypeScript |
| 样式 | Tailwind CSS + shadcn/ui（Radix UI） |
| 数据库 | PostgreSQL 16 + Prisma ORM |
| 认证 | bcrypt 哈希 + httpOnly cookie session + 首登强制改密 |
| 对象存储 | Cloudflare R2（@aws-sdk/client-s3 兼容接口） |
| AI | GLM-4V 视觉模型（作业图片分析 + 评语生成） |
| 部署 | Docker Compose（app + db + 持久卷） |
| 架构 | Repository / Service 分层（数据库无关） |

---

## 项目结构

```
src/
├── app/                         # Next.js App Router
│   ├── page.tsx                 # 落地页
│   ├── login/ register/         # 登录 / 注册
│   ├── change-password/         # 首登改密
│   ├── admin/                   # 管理员端
│   │   ├── page.tsx
│   │   └── assignments/         # 创建 / 详情
│   ├── ta/                      # 助教端
│   │   ├── page.tsx
│   │   └── assignments/[id]/    # 批改界面
│   ├── student/                 # 学生端
│   │   ├── page.tsx
│   │   └── assignments/[id]/    # 查看反馈
│   ├── assignment/[id]/         # 提交 / 重新提交
│   └── api/                     # API 路由
│       ├── auth/                # login/logout/me/register/change-password
│       ├── assignments/         # 作业 CRUD
│       ├── submissions/         # 提交管理
│       ├── allocation/          # TA 分配
│       ├── feedback/            # 批改反馈
│       ├── resubmissions/       # 重新提交
│       ├── ta/                  # TA 专用端点
│       ├── ai/                  # AI 分析 / 聊天 / 反馈
│       ├── upload/              # 文件上传到 R2
│       ├── file/[...path]/      # R2 代理访问
│       └── users/               # 用户管理
├── components/
│   ├── ui/                      # shadcn/ui 基础组件
│   ├── providers/               # 认证 provider
│   ├── assignment/              # 状态徽标等
│   ├── submission/              # 文件上传 / 图片预览
│   └── ta/                      # AI 助手面板
├── lib/                         # 业务逻辑服务层
│   ├── auth/                    # session / 当前用户
│   ├── ai/                      # GLM-4V 调用
│   ├── assignment/ submission/ feedback/
│   ├── allocation/ resubmission/ deadline/
│   ├── r2.ts                    # Cloudflare R2 客户端
│   └── storage/
├── repositories/                # Prisma 数据访问层
└── prisma/
    ├── schema.prisma            # 数据模型
    └── seed.ts                  # 种子账号
```

---

## API 端点

### 认证
| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 登录（设置 httpOnly cookie） |
| POST | `/api/auth/logout` | 登出 |
| GET  | `/api/auth/me` | 获取当前用户 |
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/change-password` | 修改密码 |

### 作业
| 方法 | 端点 | 说明 |
|------|------|------|
| GET    | `/api/assignments` | 列出全部作业 |
| POST   | `/api/assignments` | 创建作业 |
| GET    | `/api/assignments/:id` | 作业详情 |
| PUT    | `/api/assignments/:id` | 更新作业 |
| DELETE | `/api/assignments/:id` | 删除作业 |

### 提交 / 分配 / 反馈 / 重交
| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/submissions` | 创建提交（自动分配 TA） |
| GET  | `/api/submissions` | 按 `studentId` / `assignmentId` 查询 |
| GET  | `/api/submissions/:id` | 提交详情 |
| POST | `/api/allocation` | 执行 TA 分配 |
| POST | `/api/feedback` | 提交批改反馈 |
| POST | `/api/resubmissions` | 创建重新提交 |
| GET  | `/api/ta/assignments` | TA 的分配任务 |

### AI / 文件 / 用户
| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/ai/analyze` | GLM-4V 分析作业图片 |
| POST | `/api/ai/chat` | AI 对话（关于本次提交） |
| POST | `/api/ai/feedback` | AI 生成评语建议 |
| POST | `/api/upload` | 上传文件到 R2 |
| GET  | `/api/file/[...path]` | R2 代理访问图片 |
| GET  | `/api/users` | 用户管理 |

---

## 本地开发

### 前置要求
- Node.js 18+
- 一个 PostgreSQL 实例（可用本仓库的 docker-compose 起一个）
- Cloudflare R2 存储桶（或本地跳过上传功能）
- GLM API Key（或跳过 AI 功能）

### 安装
```bash
git clone https://github.com/qilinbro/assignment
cd assignment
npm install
```

### 配置环境变量
在项目根目录创建 `.env`：
```env
# 数据库
DATABASE_URL=postgresql://assignment:你的密码@localhost:5432/assignment?schema=public

# Session 签名密钥
SESSION_SECRET=随机长字符串

# Cloudflare R2（对象存储）
R2_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=你的 key
R2_SECRET_ACCESS_KEY=你的 secret
R2_BUCKET=assignment

# GLM-4V 视觉模型
GLM_API_KEY=你的 key
GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4
GLM_MODEL=glm-4v
```

### 初始化数据库
```bash
npx prisma db push     # 建表
npm run db:seed        # 写入种子账号（见下）
```

### 启动
```bash
npm run dev            # http://localhost:3000
```

### 生产构建
```bash
npm run build
npm start
```

---

## 种子账号

`npm run db:seed` 会写入以下账号（已存在的账号会跳过，不覆盖改过的密码）：

| 角色 | 账号 | 密码 | 首登改密 |
|------|------|------|----------|
| 管理员 | `aloy` | `aloyispretty` | 否 |
| 助教 | `T01` ~ `T50` | `123456` | 是 |
| 学生 | `S001` ~ `S500` | `123456` | 是 |

---

## Docker 部署

仓库自带 `docker-compose.yml`，一键启动应用 + 数据库：

```bash
# 在项目根目录的 .env 里填好 DB_PASSWORD / SESSION_SECRET / R2_* / GLM_*
docker compose up -d --build
```

服务编排：
- `db`：PostgreSQL 16，数据持久化到 `pgdata` 卷，不暴露宿主端口（仅容器网络可达）
- `app`：Next.js 生产构建，暴露 `3000:3000`，上传文件持久化到 `uploads` 卷

生产环境的 HTTPS / 反向代理由宿主机上的 openresty 处理（参考 `deploy/assignment.kirinbao.top.conf`）。

---

## 贡献

1. Fork 仓库
2. 新建分支 `git checkout -b feature/xxx`
3. 提交 `git commit -m 'feat: xxx'`
4. 推送 `git push origin feature/xxx`
5. 发起 Pull Request

---

**仓库**：https://github.com/qilinbro/assignment
**线上**：https://assignment.kirinbao.top

*最后更新：2026年8月13日*
