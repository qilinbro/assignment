import { submissionRepository } from "@/repositories";
import { assignmentRepository } from "@/repositories";
import { allocationService } from "@/lib/allocation";
import type {
  Submission,
  CreateSubmissionData,
  SubmissionStatus,
  SubmissionWithDetails,
} from "@/types";

/**
 * Submission Service
 *
 * Business logic for managing student submissions
 */
export interface ISubmissionService {
  createSubmission(data: CreateSubmissionData): Promise<Submission>;
  getSubmission(id: string): Promise<Submission | null>;
  getSubmissionByAssignmentAndStudent(
    assignmentId: string,
    studentId: string
  ): Promise<Submission | null>;
  getSubmissionsByStudent(studentId: string): Promise<Submission[]>;
  getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]>;
  updateSubmissionStatus(
    id: string,
    status: SubmissionStatus
  ): Promise<Submission | null>;
  deleteSubmission(id: string): Promise<boolean>;
  canSubmit(assignmentId: string): Promise<{ canSubmit: boolean; reason?: string }>;
  getSubmissionWithDetails(id: string): Promise<SubmissionWithDetails | null>;
}

class SubmissionService implements ISubmissionService {
  async createSubmission(data: CreateSubmissionData): Promise<Submission> {
    // Verify assignment exists and is open
    const assignment = await assignmentRepository.findById(data.assignmentId);
    if (!assignment) {
      throw new Error("未找到作业");
    }

    // Check if deadline has passed
    const now = new Date();
    if (now >= assignment.deadline) {
      throw new Error("作业截止时间已过");
    }

    // Check if student already submitted
    const existingSubmission =
      await submissionRepository.findByAssignmentAndStudent(
        data.assignmentId,
        data.studentId
      );

    if (existingSubmission) {
      throw new Error("你已经提交过本作业");
    }

    // Validate files
    if (!data.files || data.files.length === 0) {
      throw new Error("必须至少上传一个文件");
    }

    // Validate file types (images only for now)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    for (const file of data.files) {
      if (!allowedTypes.includes(file.fileType)) {
        throw new Error(
          `文件类型无效：${file.fileType}。仅允许 JPG、PNG 和 WEBP。`
        );
      }
    }

    // Create the submission
    const submission = await submissionRepository.create(data);

    // Automatically allocate TAs to the submission
    const allocationResult = await allocationService.allocateTeachingAssistants(
      submission.id,
      data.assignmentId,
      assignment.taIds,
      assignment.taCount
    );

    if (!allocationResult.success) {
      // If allocation fails, we should probably handle this gracefully
      // For now, we'll log it and the submission will still exist
      console.error("TA allocation failed:", allocationResult.message);
    }

    return submission;
  }

  async getSubmission(id: string): Promise<Submission | null> {
    return await submissionRepository.findById(id);
  }

  async getSubmissionByAssignmentAndStudent(
    assignmentId: string,
    studentId: string
  ): Promise<Submission | null> {
    return await submissionRepository.findByAssignmentAndStudent(
      assignmentId,
      studentId
    );
  }

  async getSubmissionsByStudent(studentId: string): Promise<Submission[]> {
    return await submissionRepository.findByStudentId(studentId);
  }

  async getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]> {
    return await submissionRepository.findByAssignmentId(assignmentId);
  }

  async updateSubmissionStatus(
    id: string,
    status: SubmissionStatus
  ): Promise<Submission | null> {
    const submission = await submissionRepository.findById(id);
    if (!submission) {
      throw new Error("未找到提交");
    }

    // Validate status transitions
    const validTransitions: Record<SubmissionStatus, SubmissionStatus[]> = {
      PENDING: ["GRADING"],
      GRADING: ["COMPLETED", "RESUBMISSION_REQUIRED"],
      COMPLETED: ["RESUBMISSION_REQUIRED"],
      RESUBMISSION_REQUIRED: ["RESUBMITTED"],
      RESUBMITTED: ["PENDING"],
    };

    const currentStatus = submission.status;
    const allowedStatuses = validTransitions[currentStatus];

    if (!allowedStatuses.includes(status)) {
      throw new Error(
        `无效的状态转换：从 ${currentStatus} 到 ${status}`
      );
    }

    return await submissionRepository.updateStatus(id, status);
  }

  async deleteSubmission(id: string): Promise<boolean> {
    const submission = await submissionRepository.findById(id);
    if (!submission) {
      throw new Error("未找到提交");
    }

    // Check if grading has started
    const assignments =
      await submissionRepository.findAssignmentsBySubmissionId(id);

    const hasStartedGrading = assignments.some(
      (a) => a.status !== "PENDING"
    );

    if (hasStartedGrading) {
      throw new Error(
        "无法删除已批改或正在批改的提交"
      );
    }

    return await submissionRepository.delete(id);
  }

  /**
   * Check if a student can submit to an assignment
   */
  async canSubmit(assignmentId: string): Promise<{
    canSubmit: boolean;
    reason?: string;
  }> {
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      return {
        canSubmit: false,
        reason: "未找到作业",
      };
    }

    const now = new Date();
    if (now >= assignment.deadline) {
      return {
        canSubmit: false,
        reason: "作业截止时间已过",
      };
    }

    return { canSubmit: true };
  }

  /**
   * Get submission with full details (assignment, student, TA assignments)
   */
  async getSubmissionWithDetails(
    id: string
  ): Promise<SubmissionWithDetails | null> {
    const submission = await submissionRepository.findById(id);
    if (!submission) {
      return null;
    }

    const assignment = await assignmentRepository.findById(
      submission.assignmentId
    );

    // Get student info (in a real system, this would come from user repository)
    const student = {
      id: submission.studentId,
      name: `学生${submission.studentId.split("-")[1]}`,
    };

    const assignments =
      await submissionRepository.findAssignmentsBySubmissionId(id);

    return {
      ...submission,
      assignment: assignment
        ? {
            id: assignment.id,
            title: assignment.title,
            deadline: assignment.deadline,
          }
        : undefined,
      student,
      assignments,
    };
  }
}

export const submissionService = new SubmissionService();
