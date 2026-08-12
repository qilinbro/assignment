import { submissionRepository } from "@/repositories";
import { assignmentRepository } from "@/repositories";
import type { Assignment } from "@/types";

/**
 * Allocation Service
 *
 * Core service for randomly assigning TAs to student submissions.
 * This is server-side logic to ensure fair and random distribution.
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

    if (taCount <= 0) {
      return {
        valid: false,
        error: "助教数量必须大于 0",
      };
    }

    if (taCount > taIds.length) {
      return {
        valid: false,
        error: `助教数量（${taCount}）不能超过可用助教的数量（${taIds.length}）`,
      };
    }

    return { valid: true };
  }

  /**
   * Randomly allocate TAs to a submission
   *
   * This is the core algorithm that ensures:
   * 1. Server-side random selection
   * 2. Exactly N TAs are assigned
   * 3. TAs are selected from the available pool
   * 4. Each submission can have multiple TA assignments
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

    // Randomly select N TAs from the available pool
    // Using Fisher-Yates shuffle for unbiased random selection
    const selectedTAIds = this.randomlySelectTAs(taIds, taCount);

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
   * Randomly select N TAs from the available pool
   * Uses Fisher-Yates shuffle for unbiased random selection
   */
  private randomlySelectTAs(taIds: string[], count: number): string[] {
    // Create a copy of the array to avoid modifying the original
    const shuffled = [...taIds];

    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Return the first N elements
    return shuffled.slice(0, count);
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
