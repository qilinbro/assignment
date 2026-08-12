# Assignment Submission and TA Grading System - Implementation Plan

## Project Overview

Build a web-based assignment submission and teaching-assistant grading system using **Next.js + TypeScript**.

**Repository:** https://github.com/qilinbro/assignment

**Tech Stack:**
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- Repository/Service Architecture (database-agnostic)

---

## ✅ Completed Implementation (August 12, 2026)

### Phase 1: Project Foundation ✅
- [x] Initialize Next.js project with TypeScript
- [x] Install dependencies (Tailwind CSS, shadcn/ui, Radix UI)
- [x] Configure project structure
- [x] Set up ESLint and TypeScript configs

### Phase 2: Data Models & Types ✅
- [x] Create `src/types/user.ts` - User, UserRole interfaces
- [x] Create `src/types/assignment.ts` - Assignment, AssignmentStatistics
- [x] Create `src/types/submission.ts` - Submission, SubmissionFile, SubmissionAssignment
- [x] Create `src/types/feedback.ts` - Feedback, FeedbackFile interfaces
- [x] Create `src/types/resubmission.ts` - Resubmission interfaces
- [x] Create `src/types/storage.ts` - StorageProvider interface

### Phase 3: Repository Layer ✅
- [x] Create `src/repositories/user.repository.ts` - MockUserRepository
- [x] Create `src/repositories/assignment.repository.ts` - AssignmentRepository
- [x] Create `src/repositories/submission.repository.ts` - SubmissionRepository
- [x] Create `src/repositories/feedback.repository.ts` - FeedbackRepository
- [x] Create `src/repositories/resubmission.repository.ts` - ResubmissionRepository
- [x] Initialize mock data for testing

### Phase 4: Business Logic Services ✅
- [x] Create `src/lib/allocation/allocation.service.ts` - Random TA allocation
- [x] Create `src/lib/assignment/assignment.service.ts` - Assignment CRUD
- [x] Create `src/lib/submission/submission.service.ts` - Submission management
- [x] Create `src/lib/feedback/feedback.service.ts` - Grading logic
- [x] Create `src/lib/resubmission/resubmission.service.ts` - Resubmission workflow
- [x] Create `src/lib/storage/storage.service.ts` - File upload abstraction

### Phase 5: Authentication & Authorization ✅
- [x] Create `src/lib/auth/auth.service.ts` - MockAuthService
- [x] Implement RBAC (Role-Based Access Control)
- [x] Add authorization helper functions

### Phase 6: Deadline Enforcement ✅
- [x] Create `src/lib/deadline/deadline.service.ts` - Deadline validation
- [x] Implement time remaining calculations
- [x] Add submission deadline checks

### Phase 7: UI Components ✅
- [x] Create base shadcn/ui components (Button, Card, Input, etc.)
- [x] Create `src/components/submission/file-upload.tsx` - File upload with drag-drop
- [x] Create `src/components/submission/image-preview.tsx` - Image viewer
- [x] Create `src/components/assignment/status-badge.tsx` - Status badges

### Phase 8: Pages & Routes ✅
- [x] Create `src/app/page.tsx` - Landing page with role selection
- [x] Create `src/app/admin/page.tsx` - Admin dashboard
- [x] Create `src/app/admin/assignments/create/page.tsx` - Assignment creation
- [x] Create `src/app/ta/page.tsx` - TA dashboard
- [x] Create `src/app/ta/assignments/[id]/page.tsx` - TA grading interface
- [x] Create `src/app/student/page.tsx` - Student dashboard
- [x] Create `src/app/assignment/[id]/page.tsx` - Assignment submission
- [x] Create `src/app/assignment/[id]/resubmit/page.tsx` - Resubmission workflow
- [x] Create `src/app/student/assignments/[id]/page.tsx` - Student feedback view

### Phase 9: API Routes ✅
- [x] Create `src/app/api/assignments/route.ts` - Assignment CRUD
- [x] Create `src/app/api/assignments/[id]/route.ts` - Assignment details
- [x] Create `src/app/api/submissions/route.ts` - Submission management
- [x] Create `src/app/api/submissions/[id]/route.ts` - Submission details
- [x] Create `src/app/api/allocation/route.ts` - TA allocation
- [x] Create `src/app/api/feedback/route.ts` - Grading feedback
- [x] Create `src/app/api/resubmissions/route.ts` - Resubmission handling
- [x] Create `src/app/api/ta/assignments/route.ts` - TA-specific endpoints

### Phase 10: Build & Deployment ✅
- [x] Verify production build succeeds
- [x] Push to GitHub repository
- [x] Create comprehensive documentation

---

## 🎯 Key Features Implemented

### Core Functionality
- ✅ **Random TA Allocation** - Server-side assignment of N TAs per submission
- ✅ **Configurable TA Count** - Different TA counts per assignment
- ✅ **Deadline Enforcement** - Server-side validation for submissions
- ✅ **Resubmission Workflow** - Separate from original submission
- ✅ **RBAC** - Role-based access control (Admin/TA/Student)
- ✅ **File Upload** - Image upload with preview
- ✅ **Multiple TA Feedback** - Each submission can have multiple graders

### Architecture Highlights
- ✅ **Repository Pattern** - Database-agnostic data access layer
- ✅ **Service Layer** - Business logic separated from UI
- ✅ **Storage Abstraction** - Easy swap between S3/R2/OSS
- ✅ **Clean TypeScript Types** - Complete type safety

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                          # Landing page
│   ├── globals.css                       # Global styles
│   ├── layout.tsx                        # Root layout
│   ├── admin/
│   │   └── page.tsx                      # Admin dashboard
│   │   └── assignments/
│   │       └── create/page.tsx           # Create assignment
│   ├── ta/
│   │   └── page.tsx                      # TA dashboard
│   │   └── assignments/
│   │       └── [id]/page.tsx            # Grading interface
│   ├── student/
│   │   └── page.tsx                      # Student dashboard
│   │   └── assignments/
│   │       └── [id]/page.tsx            # Feedback view
│   ├── assignment/
│   │   └── [id]/
│   │       ├── page.tsx                  # Assignment submission
│   │       └── resubmit/page.tsx         # Resubmission
│   └── api/
│       ├── assignments/                  # Assignment APIs
│       ├── submissions/                  # Submission APIs
│       ├── allocation/                   # TA allocation API
│       ├── feedback/                     # Feedback API
│       └── resubmissions/                # Resubmission API
├── components/
│   ├── ui/                               # shadcn/ui components
│   ├── assignment/                       # Assignment-specific components
│   ├── submission/                       # Submission components
│   └── feedback/                         # Feedback components
├── lib/
│   ├── auth/                             # Authentication service
│   ├── assignment/                       # Assignment service
│   ├── submission/                       # Submission service
│   ├── allocation/                       # TA allocation service
│   ├── feedback/                         # Feedback service
│   ├── resubmission/                     # Resubmission service
│   ├── storage/                          # Storage abstraction
│   └── deadline/                         # Deadline enforcement
├── repositories/                         # Data access layer
│   ├── user.repository.ts
│   ├── assignment.repository.ts
│   ├── submission.repository.ts
│   ├── feedback.repository.ts
│   └── resubmission.repository.ts
└── types/                                # TypeScript types
    ├── user.ts
    ├── assignment.ts
    ├── submission.ts
    ├── feedback.ts
    └── resubmission.ts
```

---

## 🚀 Running the Application

### Development
```bash
cd /home/ubuntu/Assignment
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Access Points
- Home: http://localhost:3000
- Admin Dashboard: http://localhost:3000/admin
- TA Dashboard: http://localhost:3000/ta
- Student Dashboard: http://localhost:3000/student

---

## 📊 User Roles & Permissions

### Admin
- Create and edit assignments
- Set deadlines and TA allocation rules
- View all submissions and statistics
- Reassign TAs if needed

### Teaching Assistant (TA)
- View assigned grading tasks
- Grade submissions with scores/comments
- Upload feedback files
- Mark submissions for resubmission

### Student
- View assignment details
- Submit assignment files
- View grading results and feedback
- Submit resubmissions when required

---

## 🔐 Security Features

- ✅ Server-side TA allocation (no client manipulation)
- ✅ Role-based access control
- ✅ Deadline enforcement on server
- ✅ Students can only access their own data
- ✅ TAs can only access assigned submissions
- ✅ Complete history preservation (no data overwrites)

---

## 📈 Future Enhancements (Optional)

### Database Integration
- [ ] Integrate PostgreSQL/MySQL
- [ ] Add Prisma/Drizzle ORM
- [ ] Implement migrations

### Authentication
- [ ] Integrate NextAuth.js
- [ ] Add OAuth providers (Google, GitHub)
- [ ] Implement session management

### File Storage
- [ ] Integrate AWS S3
- [ ] Add Cloudflare R2 support
- [ ] Implement CDN

### Enhanced Features
- [ ] Email notifications
- [ ] Real-time updates with WebSockets
- [ ] Advanced analytics dashboard
- [ ] Bulk assignment operations
- [ ] TA performance metrics

---

## 📝 API Endpoints Reference

### Assignments
- `GET /api/assignments` - List all assignments
- `POST /api/assignments` - Create assignment
- `GET /api/assignments/:id` - Get assignment details
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

### Submissions
- `POST /api/submissions` - Create submission
- `GET /api/submissions?studentId=:id` - Get student submissions
- `GET /api/submissions/:id` - Get submission details

### Allocation
- `POST /api/allocation` - Execute TA allocation

### Feedback
- `POST /api/feedback` - Submit grading
- `GET /api/feedback?submissionId=:id` - Get feedback

### Resubmissions
- `POST /api/resubmissions` - Create resubmission
- `GET /api/resubmissions?submissionId=:id` - Get resubmissions

---

## ✅ MVP Acceptance Test

The complete workflow has been implemented:

1. ✅ Admin logs in → Creates assignment → Sets TA count → Publishes link
2. ✅ Student opens link → Uploads images → Submits
3. ✅ System randomly assigns N TAs → Creates grading tasks
4. ✅ TA logs in → Views assigned submissions → Grades with feedback
5. ✅ Student views results → Sees all TA feedback
6. ✅ TA marks "Resubmission Required" → Student submits resubmission
7. ✅ Resubmission preserved separately → TA regrades → Student sees updated feedback

---

## 📞 Support

**Repository:** https://github.com/qilinbro/assignment

**Tech Documentation:** See inline code comments and this TASK.md file

---

*Last Updated: August 12, 2026*
