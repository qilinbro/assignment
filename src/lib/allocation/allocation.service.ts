import { submissionRepository } from "@/repositories";
import { assignmentRepository } from "@/repositories";
import type { Assignment } from "@/types";

/**
 * Allocation Service
 *
 * 把每份学生提交分配给该作业选中的全部助教：所有参与助教都能看到并可以批改，
 * 任一助教批改完成即视为该提交完成（先到先得），避免随机抽取导致部分助教看不到作业。
 */

export interface AllocationResult {
  success: boolean;
  message: string;
  assignedTAs?: string[];
  submissionAssignmentIds?: string[];
}

export interface AllocationService {
  allocateTeachingAssistants(
    submissionId: string,
    assignmentId: string,
    taIds: string[],
    taCount: number
  ): Promise<AllocationResult>;
  validateAllocation(
    taIds: string[],
    taCount: number
  ): { valid: boolean; error?: string };
  getAssignmentStatistics(assignmentId: string): Promise<any>;
  reassignSubmission(
    submissionId: string,
    newTaIds: string[]
  ): Promise<AllocationResult>;
}

class MockAllocationService implements AllocationService {
  /**
   * Validate TA allocation parameters
   */
  validateAllocation(taIds: string[], taCount: number): {
    valid: boolean;
    error?: string;
  } {
    if (taIds.length === 0) {
      return {
        valid: false,
        error: "至少需要一名可用的助教来进行分配",
      };
    }

    // 分配方式为"所有参与助教全部可见"，不再按 taCount 抽取，故无需校验 taCount
    return { valid: true };
  }

  /**
   * Allocate a submission to TAs
   *
   * 为该提交分配给作业选中的全部助教：
   * 1. 所有被选中的助教都会得到一条 SubmissionAssignment（都能看到该提交）
   * 2. 任一助教批改完成即视为提交完成（先到先得）
   */
  async allocateTeachingAssistants(
    submissionId: string,
    assignmentId: string,
    taIds: string[],
    taCount: number
  ): Promise<AllocationResult> {
    // Validate the allocation parameters
    const validation = this.validateAllocation(taIds, taCount);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.error || "无效的分配参数",
      };
    }

    // Check if submission exists
    const submission = await submissionRepository.findById(submissionId);
    if (!submission) {
      return {
        success: false,
        message: "未找到提交",
      };
    }

    // Check if assignment exists
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      return {
        success: false,
        message: "未找到作业",
      };
    }

    // 所有被选中的助教都将看到并可以批改该提交（先到先得，任一批改即完成），
    // 不再按 taCount 随机抽取部分助教，避免出现"被选中的助教看不到作业"。
    const selectedTAIds = taIds;

    // Create submission assignment records for each selected TA
    const assignmentIds: string[] = [];
    for (const taId of selectedTAIds) {
      const assignment = await submissionRepository.createAssignment({
        submissionId,
        taId,
        status: "PENDING",
      });
      assignmentIds.push(assignment.id);
    }

    // Update submission status to indicate it's been assigned
    await submissionRepository.updateStatus(submissionId, "GRADING");

    return {
      success: true,
      message: `已成功为提交分配 ${selectedTAIds.length} 名助教`,
      assignedTAs: selectedTAIds,
      submissionAssignmentIds: assignmentIds,
    };
  }

  /**
   * Get allocation statistics for an assignment
   */
  async getAssignmentStatistics(assignmentId: string) {
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new Error("未找到作业");
    }

    const submissions = await submissionRepository.findByAssignmentId(
      assignmentId
    );

    let totalAssignments = 0;
    let completedAssignments = 0;
    let pendingAssignments = 0;

    for (const submission of submissions) {
      const assignments =
        await submissionRepository.findAssignmentsBySubmissionId(submission.id);

      totalAssignments += assignments.length;
      completedAssignments += assignments.filter(
        (a) => a.status === "COMPLETED"
      ).length;
      pendingAssignments += assignments.filter(
        (a) => a.status === "PENDING" || a.status === "GRADING"
      ).length;
    }

    const gradingProgress =
      totalAssignments > 0
        ? Math.round((completedAssignments / totalAssignments) * 100)
        : 0;

    return {
      assignmentId,
      totalSubmissions: submissions.length,
      totalAssignments,
      completedAssignments,
      pendingAssignments,
      gradingProgress,
    };
  }

  /**
   * Reassign a submission to new TAs
   * Useful when a TA is unavailable or when rebalancing is needed
   */
  async reassignSubmission(
    submissionId: string,
    newTaIds: string[]
  ): Promise<AllocationResult> {
    const submission = await submissionRepository.findById(submissionId);
    if (!submission) {
      return {
        success: false,
        message: "未找到提交",
      };
    }

    const assignment = await assignmentRepository.findById(
      submission.assignmentId
    );
    if (!assignment) {
      return {
        success: false,
        message: "未找到作业",
      };
    }

    // Get existing assignments
    const existingAssignments =
      await submissionRepository.findAssignmentsBySubmissionId(submissionId);

    // Delete existing assignments (in a real system, we might want to keep history)
    for (const existingAssignment of existingAssignments) {
      // In a real system, we might mark these as cancelled rather than deleting
      // For now, we'll create new assignments
    }

    // Create new assignments
    const assignmentIds: string[] = [];
    for (const taId of newTaIds) {
      const assignment = await submissionRepository.createAssignment({
        submissionId,
        taId,
        status: "PENDING",
      });
      assignmentIds.push(assignment.id);
    }

    return {
      success: true,
      message: `已成功将提交重新分配给 ${newTaIds.length} 名助教`,
      assignedTAs: newTaIds,
      submissionAssignmentIds: assignmentIds,
    };
  }
}

// Singleton instance
export const allocationService = new MockAllocationService();
