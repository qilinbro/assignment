import { resubmissionRepository } from "@/repositories";
import { submissionRepository } from "@/repositories";
import { assignmentRepository } from "@/repositories";
import { allocationService } from "@/lib/allocation";
import { submissionService } from "@/lib/submission";
import type {
  Resubmission,
  CreateResubmissionData,
  ResubmissionWithDetails,
} from "@/types";

/**
 * Resubmission Service
 *
 * Business logic for managing student resubmissions
 */
export interface IResubmissionService {
  createResubmission(data: CreateResubmissionData): Promise<Resubmission>;
  getResubmission(id: string): Promise<Resubmission | null>;
  getResubmissionsByStudent(studentId: string): Promise<Resubmission[]>;
  getResubmissionsBySubmission(submissionId: string): Promise<Resubmission[]>;
  getResubmissionsByAssignment(assignmentId: string): Promise<Resubmission[]>;
  deleteResubmission(id: string): Promise<boolean>;
  canResubmit(submissionId: string, studentId: string): Promise<{
    canResubmit: boolean;
    reason?: string;
  }>;
  processResubmission(resubmissionId: string): Promise<{
    success: boolean;
    message: string;
  }>;
}

class ResubmissionService implements IResubmissionService {
  async createResubmission(data: CreateResubmissionData): Promise<Resubmission> {
    // Verify the original submission exists
    const submission = await submissionRepository.findById(data.submissionId);
    if (!submission) {
      throw new Error("Original submission not found");
    }

    // Verify the student owns this submission
    if (submission.studentId !== data.studentId) {
      throw new Error("You can only create resubmissions for your own submissions");
    }

    // Check if resubmission is allowed for this assignment
    const assignment = await assignmentRepository.findById(submission.assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    if (!assignment.allowResubmission) {
      throw new Error("Resubmission is not allowed for this assignment");
    }

    // Check if the submission requires resubmission
    if (submission.status !== "RESUBMISSION_REQUIRED") {
      throw new Error(
        "Resubmission is only allowed when the submission status is RESUBMISSION_REQUIRED"
      );
    }

    // Validate that a reason is provided
    if (!data.reason || data.reason.trim().length === 0) {
      throw new Error("A reason for resubmission must be provided");
    }

    // Validate files
    if (!data.files || data.files.length === 0) {
      throw new Error("At least one file must be uploaded");
    }

    // Create the resubmission
    const resubmission = await resubmissionRepository.create(data);

    // Update the submission status to RESUBMITTED
    await submissionService.updateSubmissionStatus(
      data.submissionId,
      "RESUBMITTED"
    );

    return resubmission;
  }

  async getResubmission(id: string): Promise<Resubmission | null> {
    return await resubmissionRepository.findById(id);
  }

  async getResubmissionsByStudent(studentId: string): Promise<Resubmission[]> {
    return await resubmissionRepository.findByStudentId(studentId);
  }

  async getResubmissionsBySubmission(
    submissionId: string
  ): Promise<Resubmission[]> {
    return await resubmissionRepository.findBySubmissionId(submissionId);
  }

  async getResubmissionsByAssignment(
    assignmentId: string
  ): Promise<Resubmission[]> {
    return await resubmissionRepository.findByAssignmentId(assignmentId);
  }

  async deleteResubmission(id: string): Promise<boolean> {
    const resubmission = await resubmissionRepository.findById(id);
    if (!resubmission) {
      throw new Error("Resubmission not found");
    }

    // Check if resubmission has been processed
    const submission = await submissionRepository.findById(
      resubmission.submissionId
    );

    if (submission && submission.status !== "RESUBMITTED") {
      throw new Error(
        "Cannot delete a resubmission that has already been processed"
      );
    }

    return await resubmissionRepository.delete(id);
  }

  /**
   * Check if a student can submit a resubmission
   */
  async canResubmit(
    submissionId: string,
    studentId: string
  ): Promise<{
    canResubmit: boolean;
    reason?: string;
  }> {
    const submission = await submissionRepository.findById(submissionId);
    if (!submission) {
      return {
        canResubmit: false,
        reason: "Submission not found",
      };
    }

    if (submission.studentId !== studentId) {
      return {
        canResubmit: false,
        reason: "You can only resubmit your own submissions",
      };
    }

    const assignment = await assignmentRepository.findById(submission.assignmentId);
    if (!assignment) {
      return {
        canResubmit: false,
        reason: "Assignment not found",
      };
    }

    if (!assignment.allowResubmission) {
      return {
        canResubmit: false,
        reason: "Resubmission is not allowed for this assignment",
      };
    }

    if (submission.status !== "RESUBMISSION_REQUIRED") {
      return {
        canResubmit: false,
        reason: "Resubmission is only allowed when required by a TA",
      };
    }

    return { canResubmit: true };
  }

  /**
   * Process a resubmission (reallocate TAs and update status)
   * This is called after a resubmission is created
   */
  async processResubmission(resubmissionId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const resubmission = await resubmissionRepository.findById(resubmissionId);
    if (!resubmission) {
      return {
        success: false,
        message: "Resubmission not found",
      };
    }

    const submission = await submissionRepository.findById(
      resubmission.submissionId
    );
    if (!submission) {
      return {
        success: false,
        message: "Original submission not found",
      };
    }

    const assignment = await assignmentRepository.findById(submission.assignmentId);
    if (!assignment) {
      return {
        success: false,
        message: "Assignment not found",
      };
    }

    // Get existing TA assignments
    const existingAssignments =
      await submissionRepository.findAssignmentsBySubmissionId(submission.id);

    // Reset all assignment statuses to PENDING for re-grading
    for (const assignment of existingAssignments) {
      await submissionRepository.updateAssignmentStatus(assignment.id, "PENDING");
    }

    // Update submission status to PENDING
    await submissionService.updateSubmissionStatus(submission.id, "PENDING");

    return {
      success: true,
      message: "Resubmission processed successfully. TAs will be notified for re-grading.",
    };
  }

  /**
   * Get resubmission with full details
   */
  async getResubmissionWithDetails(
    id: string
  ): Promise<ResubmissionWithDetails | null> {
    const resubmission = await resubmissionRepository.findById(id);
    if (!resubmission) {
      return null;
    }

    const submission = await submissionRepository.findById(
      resubmission.submissionId
    );

    // Get student info
    const student = {
      id: resubmission.studentId,
      name: `Student ${resubmission.studentId.split("-")[1]}`,
    };

    return {
      ...resubmission,
      submission: submission
        ? {
            id: submission.id,
            assignmentId: submission.assignmentId,
            status: submission.status,
          }
        : undefined,
      student,
    };
  }
}

export const resubmissionService = new ResubmissionService();
