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
        `TA count (${data.taCount}) cannot exceed the number of available TAs (${data.taIds.length})`
      );
    }

    if (data.taCount <= 0) {
      throw new Error("TA count must be greater than 0");
    }

    if (data.taIds.length === 0) {
      throw new Error("At least one TA must be selected");
    }

    // Validate deadline
    if (data.deadline <= new Date()) {
      throw new Error("Deadline must be in the future");
    }

    return await assignmentRepository.create(data);
  }

  async updateAssignment(
    id: string,
    data: UpdateAssignmentData
  ): Promise<Assignment | null> {
    const existingAssignment = await assignmentRepository.findById(id);
    if (!existingAssignment) {
      throw new Error("Assignment not found");
    }

    // If updating TA count or TA IDs, validate the relationship
    if (data.taCount !== undefined || data.taIds !== undefined) {
      const taIds = data.taIds ?? existingAssignment.taIds;
      const taCount = data.taCount ?? existingAssignment.taCount;

      if (taCount > taIds.length) {
        throw new Error(
          `TA count (${taCount}) cannot exceed the number of available TAs (${taIds.length})`
        );
      }
    }

    // Validate deadline if being updated
    if (data.deadline && data.deadline <= new Date()) {
      throw new Error("Deadline must be in the future");
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
        "Cannot delete assignment with existing submissions. Consider archiving instead."
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

    let totalAssignments = 0;
    let completedGrading = 0;
    let pendingGrading = 0;
    let resubmissions = 0;

    for (const submission of submissions) {
      const assignments =
        await submissionRepository.findAssignmentsBySubmissionId(submission.id);

      totalAssignments += assignments.length;
      completedGrading += assignments.filter(
        (a) => a.status === "COMPLETED"
      ).length;
      pendingGrading += assignments.filter(
        (a) => a.status === "PENDING" || a.status === "GRADING"
      ).length;

      // Check if submission requires resubmission
      if (submission.status === "RESUBMISSION_REQUIRED") {
        resubmissions++;
      }
    }

    const gradingProgress =
      totalAssignments > 0
        ? Math.round((completedGrading / totalAssignments) * 100)
        : 0;

    return {
      id,
      title: assignment.title,
      totalSubmissions: submissions.length,
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
      throw new Error("Assignment not found");
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
