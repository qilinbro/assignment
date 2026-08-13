import { feedbackRepository } from "@/repositories";
import { submissionRepository } from "@/repositories";
import { submissionService } from "@/lib/submission";
import type {
  Feedback,
  CreateFeedbackData,
  FeedbackWithDetails,
} from "@/types";

/**
 * Feedback Service
 *
 * Business logic for managing TA feedback on submissions
 */
export interface IFeedbackService {
  createFeedback(data: CreateFeedbackData): Promise<Feedback>;
  getFeedback(id: string): Promise<Feedback | null>;
  getFeedbackBySubmissionAssignmentId(
    submissionAssignmentId: string
  ): Promise<Feedback[]>;
  getFeedbackBySubmissionId(submissionId: string): Promise<Feedback[]>;
  updateFeedback(
    id: string,
    data: Partial<Feedback>
  ): Promise<Feedback | null>;
  deleteFeedback(id: string): Promise<boolean>;
  submitGrading(data: CreateFeedbackData): Promise<{
    feedback: Feedback;
    submissionStatus: string;
  }>;
}

class FeedbackService implements IFeedbackService {
  async createFeedback(data: CreateFeedbackData): Promise<Feedback> {
    // Verify the submission assignment exists
    const submissionAssignment =
      await submissionRepository.findAssignmentById(data.submissionAssignmentId);
    if (!submissionAssignment) {
      throw new Error("未找到提交分配");
    }

    // Check if grading has already been completed
    if (
      submissionAssignment.status === "COMPLETED" ||
      submissionAssignment.status === "RESUBMISSION_REQUIRED"
    ) {
      throw new Error("本作业已完成批改");
    }

    // Validate score if provided
    if (data.score !== undefined) {
      if (data.score < 0 || data.score > 100) {
        throw new Error("分数必须在 0 到 100 之间");
      }
    }

    // Validate that at least a comment or score is provided
    if (!data.score && !data.comment) {
      throw new Error("必须提供分数或评语");
    }

    return await feedbackRepository.create(data);
  }

  async getFeedback(id: string): Promise<Feedback | null> {
    return await feedbackRepository.findById(id);
  }

  async getFeedbackBySubmissionAssignmentId(
    submissionAssignmentId: string
  ): Promise<Feedback[]> {
    return await feedbackRepository.findBySubmissionAssignmentId(
      submissionAssignmentId
    );
  }

  async getFeedbackBySubmissionId(submissionId: string): Promise<Feedback[]> {
    // Get all submission assignments for this submission
    const submissionAssignments =
      await submissionRepository.findAssignmentsBySubmissionId(submissionId);

    // Get feedback for each assignment
    const allFeedback: Feedback[] = [];
    for (const assignment of submissionAssignments) {
      const feedbackList =
        await feedbackRepository.findBySubmissionAssignmentId(assignment.id);
      allFeedback.push(...feedbackList);
    }

    return allFeedback;
  }

  async updateFeedback(
    id: string,
    data: Partial<Feedback>
  ): Promise<Feedback | null> {
    const existingFeedback = await feedbackRepository.findById(id);
    if (!existingFeedback) {
      throw new Error("未找到反馈");
    }

    // Validate score if being updated
    if (data.score !== undefined) {
      if (data.score < 0 || data.score > 100) {
        throw new Error("分数必须在 0 到 100 之间");
      }
    }

    return await feedbackRepository.update(id, data);
  }

  async deleteFeedback(id: string): Promise<boolean> {
    const feedback = await feedbackRepository.findById(id);
    if (!feedback) {
      throw new Error("未找到反馈");
    }

    // Check if the submission assignment is still in grading status
    const submissionAssignment =
      await submissionRepository.findAssignmentById(
        feedback.submissionAssignmentId
      );

    if (!submissionAssignment) {
      throw new Error("未找到提交分配");
    }

    // Only allow deletion if grading hasn't been completed
    if (
      submissionAssignment.status === "COMPLETED" ||
      submissionAssignment.status === "RESUBMISSION_REQUIRED"
    ) {
      throw new Error(
        "无法删除已完成批改的反馈，请新建一条反馈。"
      );
    }

    return await feedbackRepository.delete(id);
  }

  /**
   * Submit grading (create feedback and update submission status)
   * This is the main method TAs use to complete grading
   */
  async submitGrading(data: CreateFeedbackData): Promise<{
    feedback: Feedback;
    submissionStatus: string;
  }> {
    // Verify the submission assignment exists
    const submissionAssignment =
      await submissionRepository.findAssignmentById(data.submissionAssignmentId);
    if (!submissionAssignment) {
      throw new Error("未找到提交分配");
    }

    // Validate score if provided
    if (data.score !== undefined) {
      if (data.score < 0 || data.score > 100) {
        throw new Error("分数必须在 0 到 100 之间");
      }
    }

    // Validate that at least a comment or score is provided
    if (!data.score && !data.comment) {
      throw new Error("必须提供分数或评语");
    }

    // Create the feedback
    const feedback = await feedbackRepository.create(data);

    // Update the submission assignment status
    const newStatus = data.requireResubmission
      ? "RESUBMISSION_REQUIRED"
      : "COMPLETED";

    await submissionRepository.updateAssignmentStatus(
      data.submissionAssignmentId,
      newStatus
    );

    // 先到先得：一份提交被任一助教批改即视为完成。
    // 把本提交其他仍未完成的 SubmissionAssignment 同步为同一状态，
    // 这样其他助教的列表里该提交也会进入"已完成"，且因 createFeedback 拒绝对已完成作业再批，
    // 天然避免同一份提交被多名助教重复批改。
    const allAssignments =
      await submissionRepository.findAssignmentsBySubmissionId(
        submissionAssignment.submissionId
      );

    for (const a of allAssignments) {
      if (a.id === data.submissionAssignmentId) continue; // 当前这条已更新
      if (a.status !== "COMPLETED" && a.status !== "RESUBMISSION_REQUIRED") {
        await submissionRepository.updateAssignmentStatus(a.id, newStatus);
      }
    }

    // 提交整体状态：任一批改完成即完成（不再要求所有助教都批改）
    const newSubmissionStatus = data.requireResubmission
      ? "RESUBMISSION_REQUIRED"
      : "COMPLETED";

    await submissionService.updateSubmissionStatus(
      submissionAssignment.submissionId,
      newSubmissionStatus as any
    );

    return {
      feedback,
      submissionStatus: newSubmissionStatus,
    };
  }

  /**
   * Get all feedback for a submission with TA details
   */
  async getSubmissionFeedbackWithDetails(
    submissionId: string
  ): Promise<FeedbackWithDetails[]> {
    const feedbackList = await this.getFeedbackBySubmissionId(submissionId);

    // Enrich with TA details
    const enrichedFeedback: FeedbackWithDetails[] = [];
    for (const feedback of feedbackList) {
      const assignment = await submissionRepository.findAssignmentById(
        feedback.submissionAssignmentId
      );

      if (assignment) {
        // In a real system, we'd get TA details from user repository
        enrichedFeedback.push({
          ...feedback,
          submissionAssignment: assignment,
          ta: {
            id: assignment.taId,
            name: `助教${assignment.taId.split("-")[1]}`,
          },
        });
      }
    }

    return enrichedFeedback;
  }
}

export const feedbackService = new FeedbackService();
