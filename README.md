# Assignment Submission and TA Grading System

作业提交与助教评分系统

## 🚀 Production Deployment

### Live Application
**https://assignment.kirinbao.top**

### Server Information
- **Host**: Tencent Cloud 2H4G
- **IP**: 43.163.222.31
- **Database**: PostgreSQL 15 (Docker)
- **SSL**: Let's Encrypt (valid until 2026-11-10)

---

## Features

### Student Dashboard
- Submit assignments with file uploads
- View grading results and feedback
- Handle resubmissions when required
- Track assignment deadlines

### TA (Teaching Assistant) Dashboard
- View assigned submissions for grading
- Grade submissions with scores and comments
- Request resubmissions if needed
- AI-assisted grading support

### Admin Dashboard
- Create and manage assignments
- Configure TA allocation rules
- View submission statistics
- Manage deadlines and resubmission policies

---

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL (Docker)
- **Deployment**: nginx + PM2
- **SSL**: Let's Encrypt

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── ta/                # TA dashboard
│   ├── student/           # Student dashboard
│   ├── assignment/        # Assignment submission
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # shadcn/ui base components
│   ├── assignment/        # Assignment-specific components
│   ├── submission/        # Submission components
│   └── ta/                # TA components
├── lib/                   # Business logic services
│   ├── auth/              # Authentication
│   ├── allocation/        # TA allocation service
│   ├── assignment/        # Assignment service
│   ├── submission/        # Submission service
│   ├── feedback/          # Feedback service
│   ├── deadline/          # Deadline enforcement
│   └── resubmission/      # Resubmission service
├── repositories/         # Data access layer
│   ├── user.repository.ts
│   ├── assignment.repository.ts
│   ├── submission.repository.ts
│   └── feedback.repository.ts
└── types/                 # TypeScript type definitions
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assignments` | List all assignments |
| POST | `/api/assignments` | Create new assignment |
| GET | `/api/assignments/:id` | Get assignment details |
| PUT | `/api/assignments/:id` | Update assignment |
| DELETE | `/api/assignments/:id` | Delete assignment |
| POST | `/api/submissions` | Create submission |
| GET | `/api/submissions?studentId=:id` | Get student submissions |
| POST | `/api/allocation` | Execute TA allocation |
| POST | `/api/feedback` | Submit grading feedback |
| POST | `/api/resubmissions` | Create resubmission |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/qilinbro/assignment
cd assignment
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

---

## Environment Variables

```env
# Database (when configured)
DATABASE_URL=postgresql://user:password@localhost:5432/assignment

# AI Assistant (optional)
ANTHROPIC_API_KEY=your-api-key

# File Storage (optional)
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY=your-key
AWS_SECRET_KEY=your-secret
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

**Repository**: https://github.com/qilinbro/assignment
**Live Site**: https://assignment.kirinbao.top
