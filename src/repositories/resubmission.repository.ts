import {
  Resubmission,
  CreateResubmissionData,
  ResubmissionWithDetails,
} from "@/types";

export interface IResubmissionRepository {
  findById(id: string): Promise<Resubmission | null>;
  findBySubmissionId(submissionId: string): Promise<Resubmission[]>;
  findByStudentId(studentId: string): Promise<Resubmission[]>;
  findByAssignmentId(assignmentId: string): Promise<Resubmission[]>;
  create(data: CreateResubmissionData): Promise<Resubmission>;
  delete(id: string): Promise<boolean>;
  findAll(): Promise<Resubmission[]>;
}

class MockResubmissionRepository implements IResubmissionRepository {
  private resubmissions: Map<string, Resubmission> = new Map();

  // No mock data - starting with empty repository

  async findById(id: string): Promise<Resubmission | null> {
    return this.resubmissions.get(id) || null;
  }

  async findBySubmissionId(
    submissionId: string
  ): Promise<Resubmission[]> {
    return Array.from(this.resubmissions.values())
      .filter((r) => r.submissionId === submissionId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findByStudentId(studentId: string): Promise<Resubmission[]> {
    return Array.from(this.resubmissions.values())
      .filter((r) => r.studentId === studentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findByAssignmentId(assignmentId: string): Promise<Resubmission[]> {
    // This would require joining with submissions
    // For now, return all resubmissions
    return Array.from(this.resubmissions.values());
  }

  async findAll(): Promise<Resubmission[]> {
    return Array.from(this.resubmissions.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async create(data: CreateResubmissionData): Promise<Resubmission> {
    const newResubmission: Resubmission = {
      id: `resubmission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      files: data.files.map((file) => ({
        ...file,
        id: `resub-file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })),
      createdAt: new Date(),
    };
    this.resubmissions.set(newResubmission.id, newResubmission);
    return newResubmission;
  }

  async delete(id: string): Promise<boolean> {
    return this.resubmissions.delete(id);
  }
}

export const resubmissionRepository = new MockResubmissionRepository();
