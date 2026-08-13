import { assignmentRepository } from "@/repositories";
import { submissionRepository } from "@/repositories";
import { allocationService } from "@/lib/allocation";
import type {
  Assignment,
  CreateAssignmentData,
  UpdateAssignmentData,
  AssignmentStatistics,
} from "@/types";

/**
 * Assignment Service
 *
 * Business logic for managing assignments
 */
export interface IAssignmentService {
  createAssignment(data: CreateAssignmentData): Promise<Assignment>;
  updateAssignment(id: string, data: UpdateAssignmentData): Promise<Assignment | null>;
  getAssignment(id: string): Promise<Assignment | null>;
  getAllAssignments(): Promise<Assignment[]>;
  getAssignmentsByAdmin(adminId: string): Promise<Assignment[]>;
  deleteAssignment(id: string): Promise<boolean>;
  getAssignmentStatistics(id: string): Promise<AssignmentStatistics | null>;
  isAssignmentOpen(assignmentId: string): Promise<boolean>;
  canResubmit(assignmentId: string): Promise<boolean>;
  publishAssignment(assignmentId: string): Promise<Assignment | null>;
}

class AssignmentService implements IAssignmentService {
  async createAssignment(data: CreateAssignmentData): Promise<Assignment> {
    // Validate TA count
    if (data.taCount > data.taIds.length) {
      throw new Error(
        `助教数量（${data.taCount}）不能超过可用助教的数量（${data.taIds.length}）`
      );
    }

    if (data.taCount <= 0) {
      throw new Error("助教数量必须大于 0");
    }

    if (data.taIds.length === 0) {
      throw new Error("必须至少选择一名助教");
    }

    // Validate deadline
    if (data.deadline <= new Date()) {
      throw new Error("截止时间必须是未来时间");
    }

    return await assignmentRepository.create(data);
  }

  async updateAssignment(
    id: string,
    data: UpdateAssignmentData
  ): Promise<Assignment | null> {
    const existingAssignment = await assignmentRepository.findById(id);
    if (!existingAssignment) {
      throw new Error("未找到作业");
    }

    // If updating TA count or TA IDs, validate the relationship
    if (data.taCount !== undefined || data.taIds !== undefined) {
      const taIds = data.taIds ?? existingAssignment.taIds;
      const taCount = data.taCount ?? existingAssignment.taCount;

      if (taCount > taIds.length) {
        throw new Error(
          `助教数量（${taCount}）不能超过可用助教的数量（${taIds.length}）`
        );
      }
    }

    // Validate deadline if being updated
    if (data.deadline && data.deadline <= new Date()) {
      throw new Error("截止时间必须是未来时间");
    }

    return await assignmentRepository.update(id, data);
  }

  async getAssignment(id: string): Promise<Assignment | null> {
    return await assignmentRepository.findById(id);
  }

  async getAllAssignments(): Promise<Assignment[]> {
    return await assignmentRepository.findAll();
  }

  async getAssignmentsByAdmin(adminId: string): Promise<Assignment[]> {
    return await assignmentRepository.findByCreatedBy(adminId);
  }

  async deleteAssignment(id: string): Promise<boolean> {
    // Check if there are any submissions
    const submissions = await submissionRepository.findByAssignmentId(id);
    if (submissions.length > 0) {
      throw new Error(
        "无法删除已有提交的作业，建议改为归档。"
      );
    }

    return await assignmentRepository.delete(id);
  }

  async getAssignmentStatistics(
    id: string
  ): Promise<AssignmentStatistics | null> {
    const assignment = await assignmentRepository.findById(id);
    if (!assignment) {
      return null;
    }

    const submissions = await submissionRepository.findByAssignmentId(id);

    // 统计基于提交状态（submission.status），而非助教分配记录状态
    const totalSubmissions = submissions.length;
    const completedGrading = submissions.filter(
      (s) => s.status === "COMPLETED"
    ).length;
    const pendingGrading = submissions.filter(
      (s) => s.status === "PENDING" || s.status === "GRADING"
    ).length;
    const resubmissions = submissions.filter(
      (s) => s.status === "RESUBMISSION_REQUIRED"
    ).length;

    const gradingProgress =
      totalSubmissions > 0
        ? Math.round((completedGrading / totalSubmissions) * 100)
        : 0;

    return {
      id,
      title: assignment.title,
      totalSubmissions,
      completedGrading,
      pendingGrading,
      resubmissions,
      gradingProgress,
    };
  }

  /**
   * Check if the assignment is still open for submissions
   */
  async isAssignmentOpen(assignmentId: string): Promise<boolean> {
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      return false;
    }

    const now = new Date();
    return now < assignment.deadline;
  }

  /**
   * Check if resubmission is allowed for this assignment
   */
  async canResubmit(assignmentId: string): Promise<boolean> {
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      return false;
    }

    return assignment.allowResubmission;
  }

  /**
   * Publish an assignment (generate the public link)
   * In this implementation, assignments are "published" by having a valid ID
   * The public link is /assignment/{assignmentId}
   */
  async publishAssignment(assignmentId: string): Promise<Assignment | null> {
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new Error("未找到作业");
    }

    // In this implementation, we could add a "published" flag
    // For now, the existence of the assignment means it's published
    // Generate the public link
    const publicLink = `/assignment/${assignmentId}`;

    // Return the assignment with the link information
    return assignment;
  }

  /**
   * Generate the public assignment link
   */
  generatePublicLink(assignmentId: string): string {
    return `/assignment/${assignmentId}`;
  }

  /**
   * Generate the resubmission link
   */
  generateResubmissionLink(assignmentId: string): string {
    return `/assignment/${assignmentId}/resubmit`;
  }
}

export const assignmentService = new AssignmentService();
