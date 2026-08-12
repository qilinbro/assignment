import {
  Submission,
  SubmissionAssignment,
  CreateSubmissionData,
  SubmissionStatus,
  SubmissionWithDetails,
} from "@/types";

export interface ISubmissionRepository {
  findById(id: string): Promise<Submission | null>;
  findByAssignmentId(assignmentId: string): Promise<Submission[]>;
  findByStudentId(studentId: string): Promise<Submission[]>;
  findByAssignmentAndStudent(
    assignmentId: string,
    studentId: string
  ): Promise<Submission | null>;
  create(data: CreateSubmissionData): Promise<Submission>;
  updateStatus(id: string, status: SubmissionStatus): Promise<Submission | null>;
  delete(id: string): Promise<boolean>;
  // SubmissionAssignment methods
  createAssignment(
    assignment: Omit<SubmissionAssignment, "id" | "assignedAt">
  ): Promise<SubmissionAssignment>;
  findAssignmentsBySubmissionId(
    submissionId: string
  ): Promise<SubmissionAssignment[]>;
  findAssignmentsByTaId(taId: string): Promise<SubmissionAssignment[]>;
  findAssignmentById(id: string): Promise<SubmissionAssignment | null>;
  updateAssignmentStatus(
    id: string,
    status: SubmissionAssignment["status"]
  ): Promise<SubmissionAssignment | null>;
  updateAssignment(
    id: string,
    data: Partial<SubmissionAssignment>
  ): Promise<SubmissionAssignment | null>;
}

class MockSubmissionRepository implements ISubmissionRepository {
  private submissions: Map<string, Submission> = new Map();
  private assignments: Map<string, SubmissionAssignment> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create some mock submissions
    const submission1: Submission = {
      id: "submission-1",
      assignmentId: "assignment-week-1",
      studentId: "student-1",
      files: [
        {
          id: "file-1",
          url: "/uploads/submission-1-file1.jpg",
          fileName: "homework.jpg",
          fileType: "image/jpeg",
          size: 1024000,
        },
      ],
      status: "COMPLETED",
      submittedAt: new Date("2024-08-12T14:20:00"),
      createdAt: new Date("2024-08-12T14:20:00"),
    };

    const submission2: Submission = {
      id: "submission-2",
      assignmentId: "assignment-week-1",
      studentId: "student-2",
      files: [
        {
          id: "file-2",
          url: "/uploads/submission-2-file1.jpg",
          fileName: "assignment.jpg",
          fileType: "image/jpeg",
          size: 2048000,
        },
      ],
      status: "COMPLETED",
      submittedAt: new Date("2024-08-12T14:35:00"),
      createdAt: new Date("2024-08-12T14:35:00"),
    };

    const submission3: Submission = {
      id: "submission-3",
      assignmentId: "assignment-week-1",
      studentId: "student-3",
      files: [
        {
          id: "file-3",
          url: "/uploads/submission-3-file1.png",
          fileName: "exercise.png",
          fileType: "image/png",
          size: 1536000,
        },
      ],
      status: "GRADING",
      submittedAt: new Date("2024-08-12T15:00:00"),
      createdAt: new Date("2024-08-12T15:00:00"),
    };

    this.submissions.set(submission1.id, submission1);
    this.submissions.set(submission2.id, submission2);
    this.submissions.set(submission3.id, submission3);

    // Create mock submission assignments (TA assignments)
    const assignments: SubmissionAssignment[] = [
      {
        id: "sa-1",
        submissionId: "submission-1",
        taId: "ta-1",
        status: "COMPLETED",
        assignedAt: new Date("2024-08-12T14:20:00"),
        completedAt: new Date("2024-08-12T16:00:00"),
      },
      {
        id: "sa-2",
        submissionId: "submission-1",
        taId: "ta-3",
        status: "COMPLETED",
        assignedAt: new Date("2024-08-12T14:20:00"),
        completedAt: new Date("2024-08-12T16:30:00"),
      },
      {
        id: "sa-3",
        submissionId: "submission-2",
        taId: "ta-2",
        status: "COMPLETED",
        assignedAt: new Date("2024-08-12T14:35:00"),
        completedAt: new Date("2024-08-12T17:00:00"),
      },
      {
        id: "sa-4",
        submissionId: "submission-2",
        taId: "ta-5",
        status: "COMPLETED",
        assignedAt: new Date("2024-08-12T14:35:00"),
        completedAt: new Date("2024-08-12T17:30:00"),
      },
      {
        id: "sa-5",
        submissionId: "submission-3",
        taId: "ta-1",
        status: "GRADING",
        assignedAt: new Date("2024-08-12T15:00:00"),
      },
      {
        id: "sa-6",
        submissionId: "submission-3",
        taId: "ta-4",
        status: "PENDING",
        assignedAt: new Date("2024-08-12T15:00:00"),
      },
    ];

    assignments.forEach((assignment) =>
      this.assignments.set(assignment.id, assignment)
    );
  }

  async findById(id: string): Promise<Submission | null> {
    return this.submissions.get(id) || null;
  }

  async findByAssignmentId(assignmentId: string): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(
      (s) => s.assignmentId === assignmentId
    );
  }

  async findByStudentId(studentId: string): Promise<Submission[]> {
    return Array.from(this.submissions.values())
      .filter((s) => s.studentId === studentId)
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  async findByAssignmentAndStudent(
    assignmentId: string,
    studentId: string
  ): Promise<Submission | null> {
    for (const submission of this.submissions.values()) {
      if (submission.assignmentId === assignmentId && submission.studentId === studentId) {
        return submission;
      }
    }
    return null;
  }

  async create(data: CreateSubmissionData): Promise<Submission> {
    const newSubmission: Submission = {
      id: `submission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      files: data.files.map((file) => ({
        ...file,
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })),
      status: "PENDING",
      submittedAt: new Date(),
      createdAt: new Date(),
    };
    this.submissions.set(newSubmission.id, newSubmission);
    return newSubmission;
  }

  async updateStatus(
    id: string,
    status: SubmissionStatus
  ): Promise<Submission | null> {
    const submission = this.submissions.get(id);
    if (!submission) {
      return null;
    }

    const updatedSubmission: Submission = {
      ...submission,
      status,
    };
    this.submissions.set(id, updatedSubmission);
    return updatedSubmission;
  }

  async delete(id: string): Promise<boolean> {
    // Also delete related assignments
    for (const [saId, assignment] of this.assignments.entries()) {
      if (assignment.submissionId === id) {
        this.assignments.delete(saId);
      }
    }
    return this.submissions.delete(id);
  }

  // SubmissionAssignment methods
  async createAssignment(
    data: Omit<SubmissionAssignment, "id" | "assignedAt">
  ): Promise<SubmissionAssignment> {
    const newAssignment: SubmissionAssignment = {
      id: `sa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      assignedAt: new Date(),
    };
    this.assignments.set(newAssignment.id, newAssignment);
    return newAssignment;
  }

  async findAssignmentsBySubmissionId(
    submissionId: string
  ): Promise<SubmissionAssignment[]> {
    return Array.from(this.assignments.values()).filter(
      (a) => a.submissionId === submissionId
    );
  }

  async findAssignmentsByTaId(taId: string): Promise<SubmissionAssignment[]> {
    return Array.from(this.assignments.values())
      .filter((a) => a.taId === taId)
      .sort((a, b) => b.assignedAt.getTime() - a.assignedAt.getTime());
  }

  async findAssignmentById(id: string): Promise<SubmissionAssignment | null> {
    return this.assignments.get(id) || null;
  }

  async updateAssignmentStatus(
    id: string,
    status: SubmissionAssignment["status"]
  ): Promise<SubmissionAssignment | null> {
    const assignment = this.assignments.get(id);
    if (!assignment) {
      return null;
    }

    const updatedAssignment: SubmissionAssignment = {
      ...assignment,
      status,
      completedAt:
        status === "COMPLETED" || status === "RESUBMISSION_REQUIRED"
          ? new Date()
          : assignment.completedAt,
    };
    this.assignments.set(id, updatedAssignment);
    return updatedAssignment;
  }

  async updateAssignment(
    id: string,
    data: Partial<SubmissionAssignment>
  ): Promise<SubmissionAssignment | null> {
    const assignment = this.assignments.get(id);
    if (!assignment) {
      return null;
    }

    const updatedAssignment: SubmissionAssignment = {
      ...assignment,
      ...data,
    };
    this.assignments.set(id, updatedAssignment);
    return updatedAssignment;
  }
}

export const submissionRepository = new MockSubmissionRepository();
