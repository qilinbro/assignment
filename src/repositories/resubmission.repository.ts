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

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create some mock resubmissions
    const resubmission1: Resubmission = {
      id: "resubmission-1",
      submissionId: "submission-2",
      studentId: "student-2",
      reason:
        "我已根据助教的反馈修改了第 2、3 题，并补充了更详细的解释。",
      files: [
        {
          id: "resub-file-1",
          url: "/uploads/student-4-app.png",
          fileName: "应用文（修改后）.png",
          fileType: "image/png",
          size: 1407208,
        },
        {
          id: "resub-file-2",
          url: "/uploads/student-4-read.png",
          fileName: "读后续（修改后）.png",
          fileType: "image/png",
          size: 1487015,
        },
      ],
      createdAt: new Date("2024-08-12T18:00:00"),
    };

    this.resubmissions.set(resubmission1.id, resubmission1);
  }

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
