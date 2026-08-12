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

  // No mock data - starting with empty repository

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
