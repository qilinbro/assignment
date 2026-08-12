# 作业提交与助教评分系统 - 详细实现方案

## 🚀 部署状态

### 生产环境（2026年8月13日更新）

| 项目 | 状态 | 详情 |
|------|------|------|
| **服务器** | ✅ 运行中 | 腾讯云 2H4G (43.163.222.31) |
| **应用访问** | ✅ HTTPS | https://assignment.kirinbao.top |
| **数据库** | ✅ 已配置 | PostgreSQL 16（docker-compose `db` 容器） |
| **对象存储** | ✅ 已接入 | Cloudflare R2 |
| **AI 模型** | ✅ 已接入 | GLM-4V 视觉模型 |
| **SSL 证书** | ✅ 有效 | Let's Encrypt（openresty 反代） |
| **反向代理** | ✅ 运行中 | openresty (端口 80/443) → 容器 3000 |
| **应用运行** | ✅ 正常 | Next.js（docker-compose `app` 容器） |

### 📊 部署详情

**服务器信息**
- 主机: 43.163.222.31
- 配置: 2核4G
- 系统: Ubuntu（Docker 运行环境）

**应用配置（全容器化）**
- 编排: `docker-compose.yml`（app + db + 持久卷）
- 内部端口: 3000
- 外部端口: 443 (HTTPS)，由 openresty 反代到 3000
- 持久化: `pgdata` 卷（数据库）、`uploads` 卷（上传文件）

**数据库配置**
- 类型: PostgreSQL 16
- 容器: `assignment-db`
- 数据库名: `assignment`
- 用户名: `assignment`

**访问地址**
```
https://assignment.kirinbao.top
```

**API 端点**
```
https://assignment.kirinbao.top/api/assignments
https://assignment.kirinbao.top/api/submissions
https://assignment.kirinbao.top/api/feedback
https://assignment.kirinbao.top/api/allocation
https://assignment.kirinbao.top/api/ai/analyze   # GLM-4V 作业分析
https://assignment.kirinbao.top/api/upload       # R2 文件上传
```

---

## 目录
1. [项目概述](#项目概述)
2. [系统架构](#系统架构)
3. [数据模型与关系](#数据模型与关系)
4. [核心服务实现](#核心服务实现)
5. [API设计](#api设计)
6. [业务逻辑与工作流](#业务逻辑与工作流)
7. [安全与授权](#安全与授权)
8. [前端组件](#前端组件)
9. [部署指南](#部署指南)
10. [未来增强](#未来增强)

---

## 项目概述

### 仓库地址
https://github.com/qilinbro/assignment

### 技术选型理由

| 技术 | 用途 | 选择理由 |
|------------|---------|----------------|
| **Next.js 15** | React 框架 | App Router 提供服务端组件、优化渲染、内置 API 路由 |
| **TypeScript** | 类型安全 | 编译时捕获错误、改善 IDE 支持、自文档化代码 |
| **Tailwind CSS** | 样式 | 实用优先的 CSS、快速 UI 开发、一致的设计系统 |
| **shadcn/ui** | 组件库 | 基于 Radix UI 的可访问、可定制组件 |
| **Repository 模式** | 数据访问 | 数据库无关层、易于切换持久化实现 |

---

## 系统架构

### 分层架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         表现层 (Presentation Layer)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   管理员界面  │  │   助教界面   │  │   学生界面   │          │
│  │  (Admin UI)  │  │    (TA UI)   │  │ (Student UI) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                           API 层                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │/作业管理│ │/提交管理│ │/反馈管理│ │/分配管理│             │
│  │(assign.)│ │(submiss)│ │(feedback)│ │(alloc.) │             │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        服务层 (Service Layer)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ 作业服务 │ │ 提交服务 │ │ 反馈服务 │ │ 分配服务 │            │
│  │Assignment│ │Submission│ │ Feedback │ │Allocation│            │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ 认证服务│ │ 截止服务│ │ 重交服务│ │ AI 助手  │            │
│  │   Auth   │ │ Deadline │ │Resubmit  │ │ Assistant│            │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      仓储层 (Repository Layer)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │  用户仓储│ │ 作业仓储  │ │ 提交仓储  │ │ 反馈仓储│            │
│  │  User    │ │Assignment│ │Submission│ │ Feedback │            │
│  │  Repo    │ │   Repo   │ │   Repo   │ │   Repo   │            │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### 核心设计原则

1. **关注点分离**：每层单一职责
2. **数据库无关**：仓储模式允许切换数据源
3. **服务端验证**：所有业务逻辑在服务端验证
4. **不可变历史**：无数据删除，仅状态更新
5. **类型安全**：从数据库到 UI 全面的 TypeScript 覆盖

---

## 数据模型与关系

### 实体关系图

```
┌─────────────┐       ┌───────────────┐       ┌─────────────┐
│    用户     │       │     作业      │       │   助教池    │
│   (User)    │       │  (Assignment) │       │  (TA Pool)  │
├─────────────┤       ├───────────────┤       ├─────────────┤
│ id          │───    │ id            │       │ taId        │
│ name        │   │   │ title         │       │ assignmentId│
│ email       │   │   │ description   │◄──────┤             │
│ role        │   │   │ deadline      │       └─────────────┘
│             │   │   │ taCount       │
└─────────────┘   │   │ allowResubmit │
                  │   │ createdBy    │
                  │   └───────┬───────┘
                  │           │
┌─────────────┐   │           │
│   提交记录   │   │           │
│ (Submission)│   │           │
├─────────────┤   │           │
│ id          │◀──┘           │
│ assignmentId│───────────────┘
│ studentId   │───┐
│ files[]     │   │
│ status      │   │
│ submittedAt │   │
└──────┬──────┘   │
       │          │
       │          │
┌──────▼──────────▼───────┐
│    助教分配记录         │
│ (SubmissionAssignment)  │
├────────────────────────┤
│ id                     │
│ submissionId           │───┐
│ taId                   │   │
│ status                 │   │
│ assignedAt             │   │
│ completedAt            │   │
└────────┬───────────────┘   │
         │                   │
         │                   │
┌────────▼─────────┐  ┌──────▼──────┐
│     评分反馈      │  │   重交记录   │
│    (Feedback)     │  │(Resubmission)│
├──────────────────┤  ├─────────────┤
│ id               │  │ id          │
│ submissionAssign │  │ submissionId│
│ mentId           │  │ originalId  │
│ score            │  │ files[]     │
│ comment          │  │ submittedAt │
│ files[]          │  │ status      │
│ requireResubmit  │  └─────────────┘
└──────────────────┘
```

### 详细类型定义

#### 用户与角色
```typescript
type UserRole = "ADMIN" | "TA" | "STUDENT";

interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
}
```

#### 作业
```typescript
interface Assignment {
  id: string;                          // UUID
  title: string;                       // 作业名称
  description?: string;                // 详细说明
  deadline: Date;                      // 提交截止时间
  taIds: string[];                     // 可用的助教池
  taCount: number;                     // 每次提交分配的助教数量
  allowResubmission: boolean;          // 允许重交
  resubmissionDescription?: string;    // 重交说明
  createdBy: string;                   // 创建者管理员ID
  createdAt: Date;
}
```

#### 提交状态
```typescript
type SubmissionStatus = 
  | "PENDING"                 // 已创建，等待助教分配
  | "GRADING"                 // 已分配助教，正在评分
  | "COMPLETED"               // 所有助教完成评分
  | "RESUBMISSION_REQUIRED"  // 助教要求重交
  | "RESUBMITTED";            // 学生已重交
```

#### 提交记录
```typescript
interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  files: SubmissionFile[];
  status: SubmissionStatus;
  submittedAt: Date;
  createdAt: Date;
}

interface SubmissionFile {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  size: number;
}
```

#### 助教分配
```typescript
interface SubmissionAssignment {
  id: string;
  submissionId: string;
  taId: string;
  status: "PENDING" | "GRADING" | "COMPLETED" | "RESUBMISSION_REQUIRED";
  assignedAt: Date;
  completedAt?: Date;
}
```

#### 评分反馈
```typescript
interface Feedback {
  id: string;
  submissionAssignmentId: string;
  score?: number;              // 0-100分
  comment?: string;
  files: FeedbackFile[];
  requireResubmission: boolean;
  createdAt: Date;
}

interface FeedbackFile {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
}
```

---

## 核心服务实现

### 1. 分配服务 (`allocation.service.ts`)

**用途**：为学生的提交随机分配助教

**核心算法：Fisher-Yates 洗牌**
```typescript
private randomlySelectTAs(taIds: string[], count: number): string[] {
  const shuffled = [...taIds];
  // Fisher-Yates 洗牌，实现无偏随机选择
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
```

**工作流程**：
1. 验证助教数量不超过可用池
2. 验证提交和作业存在
3. 使用 Fisher-Yates 洗牌随机选择 N 个助教
4. 为每个助教创建 `SubmissionAssignment` 记录
5. 更新提交状态为 `GRADING`

**方法**：
- `allocateTeachingAssistants()`: 主分配逻辑
- `validateAllocation()`: 参数验证
- `reassignSubmission()`: 重新分配给不同的助教
- `getAssignmentStatistics()`: 进度追踪

### 2. 提交服务 (`submission.service.ts`)

**用途**：管理学生提交的生命周期

**核心验证**：
- 作业存在且接受提交
- 截止时间未过
- 学生未重复提交
- 文件类型有效（JPG、PNG、WEBP）
- 至少上传一个文件

**状态转换机**：
```
PENDING ──分配──► GRADING ──完成──► COMPLETED
                             │                │
                             └──要求重交──────┤
                                             ▼
                                    RESUBMISSION_REQUIRED
                                             │
                                    重交──────┤
                                             ▼
                                       RESUBMITTED ──► PENDING
```

**方法**：
- `createSubmission()`: 提交作业，自动分配助教
- `canSubmit()`: 检查是否允许提交
- `updateSubmissionStatus()`: 带验证的状态转换
- `deleteSubmission()`: 仅在评分未开始时可删除

### 3. 反馈服务 (`feedback.service.ts`)

**用途**：处理助教评分和反馈提交

**评分工作流**：
1. 助教访问分配的提交
2. 查看文件并可选择使用 AI 助手
3. 提供分数（0-100）和评语
4. 可选择要求重交
5. 系统更新提交分配状态
6. 重新计算整体提交状态

**核心逻辑**：
```typescript
const newStatus = data.requireResubmission
  ? "RESUBMISSION_REQUIRED"
  : "COMPLETED";

// 检查所有助教是否完成评分
const allCompleted = allAssignments.every(
  a => a.id === data.submissionAssignmentId || a.status === "COMPLETED"
);

newSubmissionStatus = allCompleted ? "COMPLETED" : "GRADING";
```

**方法**：
- `submitGrading()`: 完成评分，更新状态
- `getSubmissionFeedbackWithDetails()`: 带助教信息的反馈
- `updateFeedback()`: 完成前修改
- `deleteFeedback()`: 未完成时删除

### 4. 截止服务 (`deadline.service.ts`)

**用途**：强制执行提交截止时间

**功能**：
- 服务端截止时间验证
- 剩余时间计算
- 批量截止时间检查
- 即将截止提醒
- 已截止追踪

**核心方法**：
```typescript
async validateSubmission(assignmentId: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const status = await this.checkDeadline(assignmentId);
  if (!status.isOpen) {
    return {
      allowed: false,
      reason: "作业提交时间已结束"
    };
  }
  return { allowed: true };
}
```

**注意**：若作业允许，重交可在截止时间后进行。

### 5. 认证服务 (`auth/`)

**用途**：提供系统登录、登出、当前用户查询和基于角色的访问控制。

**当前实现（已完成）**：
- 密码用 `bcryptjs` 哈希存储
- 登录成功后写入 `httpOnly` cookie 的 session（`SESSION_SECRET` 签名）
- 首次登录强制改密（`User.mustChangePassword` 标志）
- 当前用户通过 `src/lib/auth/current-user.ts` 在服务端组件 / API 路由中读取
- RBAC：所有页面与 API 路由均做服务端角色校验

**核心接口**：
```typescript
interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthUser | null>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
  isAuthenticated(): boolean;
  hasRole(role: UserRole): boolean;
  hasAnyRole(roles: UserRole[]): boolean;
}
```

### 6. AI 助手服务 (`ai-assistant.service.ts`)

**用途**：提供 AI 驱动的评分辅助，包括提交分析、评分建议和反馈生成。

**当前实现（已完成）**：已接入 **GLM-4V 视觉模型**（智谱 AI），通过 `GLM_API_KEY` / `GLM_BASE_URL` / `GLM_MODEL` 环境变量配置。AI 直接读取学生上传的作业图片，返回结构化分析。

**API 端点**：
- `POST /api/ai/analyze` —— 分析作业图片（优缺点、建议评分）
- `POST /api/ai/chat` —— 关于本次提交的对话问答
- `POST /api/ai/feedback` —— 生成评语建议

**调用流程**：
```typescript
// 1. 从 R2 读取学生作业图片
// 2. 以图片 + prompt 调用 GLM-4V
// 3. 返回结构化分析（优点 / 缺点 / 建议评分 / 置信度）
// 4. 助教可在批改界面参考，也可一键生成评语
```

**容错**：AI 调用失败时降级为提示，不影响助教手动批改流程。

**AI 功能**：
- 提交分析（优缺点）
- 建议评分及置信度
- 关于提交的聊天界面
- 评语一键生成

---

## API 设计

### RESTful 端点

#### 作业管理
```
GET    /api/assignments          - 获取所有作业
POST   /api/assignments          - 创建新作业
GET    /api/assignments/:id      - 获取作业详情
PUT    /api/assignments/:id      - 更新作业
DELETE /api/assignments/:id      - 删除作业
```

#### 提交管理
```
POST   /api/submissions              - 创建提交
GET    /api/submissions?studentId=:id - 获取学生提交
GET    /api/submissions?assignmentId=:id - 获取作业提交
GET    /api/submissions/:id          - 获取提交详情
```

#### 助教分配
```
POST   /api/allocation           - 分配助教给提交
```

#### 反馈
```
POST   /api/feedback             - 提交评分反馈
GET    /api/feedback?submissionId=:id - 获取提交反馈
```

#### 重交
```
POST   /api/resubmissions        - 创建重交
GET    /api/resubmissions?submissionId=:id - 获取重交记录
```

#### 助教专用
```
GET    /api/ta/assignments       - 获取助教的分配任务
```

### 请求/响应示例

#### 创建提交
```typescript
// POST /api/submissions
{
  "assignmentId": "assignment-week-1",
  "studentId": "student-1",
  "files": [
    {
      "url": "https://storage.example/uploads/file.jpg",
      "fileName": "作业.jpg",
      "fileType": "image/jpeg",
      "size": 1024000
    }
  ]
}

// 响应 201
{
  "id": "submission-abc123",
  "assignmentId": "assignment-week-1",
  "studentId": "student-1",
  "files": [...],
  "status": "GRADING",  // 自动分配
  "submittedAt": "2026-08-12T14:20:00Z",
  "createdAt": "2026-08-12T14:20:00Z"
}
```

#### 提交反馈
```typescript
// POST /api/feedback
{
  "submissionAssignmentId": "sa-1",
  "score": 85,
  "comment": "做得很好，稍作改进即可",
  "requireResubmission": false
}

// 响应 201
{
  "feedback": {
    "id": "feedback-xyz",
    "submissionAssignmentId": "sa-1",
    "score": 85,
    "comment": "做得很好，稍作改进即可",
    "requireResubmission": false
  },
  "submissionStatus": "COMPLETED"
}
```

---

## 业务逻辑与工作流

### 完整用户工作流

#### 管理员：创建作业流程
```
1. 管理员登录 → 仪表板
2. 点击"创建作业"
3. 填写表单：
   - 标题
   - 说明
   - 截止时间
   - 可用助教（多选）
   - 每次提交的助教数量
   - 允许重交开关
4. 系统验证输入
5. 作业创建并生成唯一 ID
6. 生成可分享链接
7. 将链接分发给学生
```

#### 学生：提交作业流程
```
1. 学生打开作业链接
2. 查看：作业详情、截止时间、助教数量
3. 检查截止时间（服务端验证）
4. 上传图片（拖放或点击）
5. 预览图片
6. 点击"提交"
7. 系统验证：
   - 文件存在
   - 文件类型有效
   - 非重复提交
   - 截止时间未过
8. 创建提交记录
9. **系统自动分配 N 个助教**
10. 显示确认
```

#### 助教：评分流程
```
1. 助教登录 → 仪表板
2. 查看分配的任务（按状态筛选）
3. 点击提交进行评分
4. 查看：
   - 学生文件（图片查看器）
   - 作业详情
   - 可选的 AI 分析
5. 输入评分：
   - 分数（0-100）
   - 评语（无分数时必填）
   - 可选的反馈文件
   - 要求重交开关
6. 提交反馈
7. 系统更新分配状态
8. 仪表板更新
```

#### 学生：查看反馈流程
```
1. 学生登录 → 仪表板
2. 查看提交状态（评分中/已完成/等）
3. 点击查看详情
4. 显示：
   - 所有助教的反馈及姓名
   - 每个助教的分数
   - 评语和反馈文件
   - 整体状态
5. 若为 RESUBMISSION_REQUIRED：
   - 显示"重交"按钮
   - 打开重交流程
```

### 重交工作流
```
1. 助教标记"要求重交"
2. 提交状态 → RESUBMISSION_REQUIRED
3. 学生看到重交选项
4. 上传新文件
5. 创建新的提交记录（原记录保留）
6. 新提交分配给相同的助教
7. 助教对重交进行评分
8. 学生可对比原始提交和重交反馈
```

---

## 安全与授权

### 基于角色的访问控制（RBAC）

```typescript
// 授权辅助函数
function canAccessAdminPage(user: AuthUser | null): boolean {
  return user?.role === "ADMIN";
}

function canAccessTAPage(user: AuthUser | null): boolean {
  return user?.role === "TA" || user?.role === "ADMIN";
}

function canGradeSubmission(user: AuthUser, taId: string): boolean {
  return user?.role === "ADMIN" || user?.id === taId;
}

function canViewSubmission(user: AuthUser, studentId: string): boolean {
  if (user?.role === "STUDENT") return user.id === studentId;
  return user?.role === "ADMIN" || user?.role === "TA";
}
```

### 安全措施

| 威胁 | 防护措施 |
|-------|------------|
| 未授权访问 | 所有端点服务端角色检查 |
| 截止时间操纵 | 服务端时间验证 |
| 助教选择操纵 | 服务端随机分配 |
| 分数操纵 | 状态转换验证 |
| 数据丢失 | 不可变历史，无硬删除 |

### 权限矩阵

| 操作 | 管理员 | 助教 | 学生 |
|--------|-------|-------|---------|
| 创建作业 | ✅ | ❌ | ❌ |
| 删除作业 | ✅ | ❌ | ❌ |
| 查看所有提交 | ✅ | ❌ | ❌ |
| 查看分配提交 | ✅ | ✅ (自己的) | ✅ (自己的) |
| 评分提交 | ✅ | ✅ (分配的) | ❌ |
| 提交作业 | ✅ | ❌ | ✅ |
| 查看反馈 | ✅ | ✅ (自己的) | ✅ (自己的) |
| 重交 | ✅ | ❌ | ✅ (若允许) |

---

## 前端组件

### 组件架构

```
src/components/
├── ui/                    # shadcn/ui 基础组件
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   └── ...
├── assignment/
│   └── status-badge.tsx   # 提交状态指示器
├── submission/
│   ├── file-upload.tsx    # 拖放文件上传器
│   └── image-preview.tsx  # 图片查看器
├── feedback/
│   └── feedback-card.tsx   # 助教反馈展示
└── ta/
    └── ai-assistant.tsx   # AI 评分助手
```

### 核心组件功能

#### FileUpload 组件
- 支持拖放上传
- 多文件选择
- 图片预览
- 文件类型验证
- 大小验证
- 上传进度

#### StatusBadge 组件
- 按状态颜色编码
- 可访问标签
- 动画过渡

#### AIAssistant 组件
- 聊天界面
- 分析展示
- 建议评分
- 置信度指示器

---

## 部署指南

### 前置要求
- Node.js 18+
- npm 或 yarn
- PostgreSQL 实例（可用仓库自带 docker-compose 启动）
- Cloudflare R2 存储桶（用于作业图片存储）
- GLM API Key（智谱 AI，用于 GLM-4V 视觉分析）

### 开发环境设置
```bash
git clone https://github.com/qilinbro/assignment
cd assignment
npm install
cp .env.example .env   # 填入下面的环境变量
npx prisma db push     # 建表
npm run db:seed        # 写入种子账号（aloy / T01-T50 / S001-S500）
npm run dev
```

### 生产构建
```bash
npm run build
npm start
```

### Docker 一键部署
```bash
docker compose up -d --build   # 启动 app + db
```

### 环境变量
```env
# 数据库
DATABASE_URL=postgresql://assignment:密码@localhost:5432/assignment?schema=public

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

### 数据模型

数据层使用 Prisma ORM + PostgreSQL，schema 定义在 `prisma/schema.prisma`，包含以下模型：
- `User`（账号 / 角色 / bcrypt 密码 / 首登改密标志）
- `Assignment`（作业）
- `Submission` + `SubmissionFile`（学生提交及文件）
- `SubmissionAssignment`（TA 分配记录）
- `Feedback` + `FeedbackFile`（批改反馈及附件）
- `Resubmission` + `ResubmissionFile`（重新提交）

全部 repository 已基于 Prisma Client 实现，通过 `prisma db push` 建表、`npm run db:seed` 写入种子账号。

---

## 未来增强

### 数据库与数据持久化
- [x] 生产环境 PostgreSQL 数据库
- [x] 使用 Prisma ORM 统一数据访问
- [x] 种子数据管理（`prisma/seed.ts`）
- [ ] 连接池与故障恢复策略

### 认证
- [x] bcrypt 密码哈希 + httpOnly cookie session
- [x] 首次登录强制改密
- [x] 会话管理（`SESSION_SECRET` 签名）
- [ ] OAuth 提供商（Google、GitHub）
- [ ] 密码重置流程

### 文件存储
- [x] Cloudflare R2 集成（上传 + 代理访问）
- [ ] CDN 配置
- [ ] 文件压缩

### 增强功能
- [x] 登录 / 注册
- [x] 创建 / 编辑 / 删除作业
- [x] 管理员查看批改详情
- [x] 重新提交流程
- [ ] 邮件通知
- [ ] WebSocket 实时更新
- [ ] 批量作业操作
- [ ] 助教绩效分析
- [ ] 成绩册导出
- [ ] 深色模式支持

### AI 增强
- [x] GLM-4V 视觉模型集成（作业图片分析 + 评语生成）
- [x] AI 对话问答（关于本次提交）
- [ ] OCR 文字提取
- [ ] 抄袭检测
- [ ] 自动评分标准应用

---

## 项目状态

### ✅ MVP 阶段（2026年8月12日）

阶段 1-10：完整 MVP 实现，包括类型系统、Repository 数据访问层、业务逻辑服务、认证授权、截止时间强制执行、UI 组件、页面路由、RESTful API。

### ✅ 全栈重构（2026年8月13日）

- 数据层：全部 repository 重写为 Prisma（PostgreSQL）
- 认证：bcrypt + httpOnly cookie session + 首登强制改密
- 用户：seed 551 账号（aloy / T01-T50 / S001-S500）
- 存储：Cloudflare R2 图床（上传 / 代理访问）
- AI：GLM-4V 视觉模型分析作业图片 + 自动评语
- 部署：Docker 全容器化（docker-compose：app + db + volume）
- 域名：assignment.kirinbao.top（openresty 反代 + HTTPS）
- UI：现代书卷风（暖纸色系 + Lora 衬线 + 动画）
- 功能：登录注册 / 创建编辑删除作业 / 提交批改 / 重新提交 / 管理员看批改详情
- 修复：状态转换 / TA 分配外键 / NaN 进度 / 客户端崩溃 / AI 错误处理

### MVP 测试用例 ✅

1. ✅ 管理员创建作业 → 设置助教数量 → 发布
2. ✅ 学生提交 → 系统自动分配助教
3. ✅ 助教评分 → 存储反馈 → 更新状态
4. ✅ 学生查看所有助教反馈
5. ✅ 助教要求重交 → 学生重交
6. ✅ 历史保留 → 原始提交和重交均可访问

---

## 联系与支持

**仓库地址**：https://github.com/qilinbro/assignment

**文档**：参见代码内注释和 TASK.md

---

*最后更新：2026年8月13日*
