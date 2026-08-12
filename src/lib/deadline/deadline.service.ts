import { assignmentRepository } from "@/repositories";
import type { Assignment } from "@/types";

/**
 * Deadline Service
 *
 * Handles all deadline-related business logic
 */

export interface DeadlineStatus {
  isOpen: boolean;
  isPast: boolean;
  timeRemaining: number | null; // in milliseconds
  deadline: Date;
  canSubmit: boolean;
  canResubmit: boolean;
}

export interface DeadlineService {
  checkDeadline(assignmentId: string): Promise<DeadlineStatus>;
  checkMultipleDeadlines(assignmentIds: string[]): Promise<Map<string, DeadlineStatus>>;
  getTimeRemaining(deadline: Date): number | null;
  formatTimeRemaining(ms: number): string;
  isAssignmentOpen(assignmentId: string): Promise<boolean>;
  validateSubmission(assignmentId: string): Promise<{ allowed: boolean; reason?: string }>;
  validateResubmission(assignmentId: string): Promise<{ allowed: boolean; reason?: string }>;
}

class DeadlineService implements DeadlineService {
  /**
   * Check the deadline status for an assignment
   */
  async checkDeadline(assignmentId: string): Promise<DeadlineStatus> {
    const assignment = await assignmentRepository.findById(assignmentId);

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    const now = new Date();
    const deadline = new Date(assignment.deadline);
    const isPast = now >= deadline;
    const timeRemaining = isPast ? null : deadline.getTime() - now.getTime();

    return {
      isOpen: !isPast,
      isPast,
      timeRemaining,
      deadline,
      canSubmit: !isPast,
      canResubmit: assignment.allowResubmission,
    };
  }

  /**
   * Check deadlines for multiple assignments
   */
  async checkMultipleDeadlines(
    assignmentIds: string[]
  ): Promise<Map<string, DeadlineStatus>> {
    const statuses = new Map<string, DeadlineStatus>();

    for (const id of assignmentIds) {
      try {
        const status = await this.checkDeadline(id);
        statuses.set(id, status);
      } catch (error) {
        console.error(`Error checking deadline for ${id}:`, error);
      }
    }

    return statuses;
  }

  /**
   * Get time remaining in milliseconds
   */
  getTimeRemaining(deadline: Date): number | null {
    const now = new Date();
    const ms = deadline.getTime() - now.getTime();
    return ms > 0 ? ms : null;
  }

  /**
   * Format time remaining for display
   */
  formatTimeRemaining(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days !== 1 ? "s" : ""}`;
    }
    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    }
    if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    }
    return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  }

  /**
   * Check if an assignment is still open for submissions
   */
  async isAssignmentOpen(assignmentId: string): Promise<boolean> {
    const status = await this.checkDeadline(assignmentId);
    return status.isOpen;
  }

  /**
   * Validate if a normal submission is allowed
   */
  async validateSubmission(
    assignmentId: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    const status = await this.checkDeadline(assignmentId);

    if (!status.isOpen) {
      return {
        allowed: false,
        reason: "The assignment submission period has ended",
      };
    }

    return { allowed: true };
  }

  /**
   * Validate if a resubmission is allowed
   */
  async validateResubmission(
    assignmentId: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    const assignment = await assignmentRepository.findById(assignmentId);

    if (!assignment) {
      return {
        allowed: false,
        reason: "Assignment not found",
      };
    }

    if (!assignment.allowResubmission) {
      return {
        allowed: false,
        reason: "Resubmissions are not allowed for this assignment",
      };
    }

    // Resubmissions are allowed even after the deadline
    // as long as the assignment allows resubmission
    return { allowed: true };
  }

  /**
   * Get upcoming deadlines (assignments due within specified time)
   */
  async getUpcomingDeadlines(withinMs: number = 86400000): Promise<
    Array<{ assignment: Assignment; timeRemaining: number }>
  > {
    const assignments = await assignmentRepository.findAll();
    const upcoming: Array<{ assignment: Assignment; timeRemaining: number }> = [];

    for (const assignment of assignments) {
      const timeRemaining = this.getTimeRemaining(new Date(assignment.deadline));

      if (timeRemaining !== null && timeRemaining <= withinMs) {
        upcoming.push({
          assignment,
          timeRemaining,
        });
      }
    }

    // Sort by deadline (soonest first)
    upcoming.sort((a, b) => a.timeRemaining - b.timeRemaining);

    return upcoming;
  }

  /**
   * Get past deadlines (assignments that have closed)
   */
  async getPastDeadlines(): Promise<Array<{ assignment: Assignment; pastSince: number }>> {
    const assignments = await assignmentRepository.findAll();
    const past: Array<{ assignment: Assignment; pastSince: number }> = [];

    for (const assignment of assignments) {
      const timeRemaining = this.getTimeRemaining(new Date(assignment.deadline));

      if (timeRemaining === null) {
        const pastSince = new Date().getTime() - new Date(assignment.deadline).getTime();
        past.push({
          assignment,
          pastSince,
        });
      }
    }

    // Sort by how recently closed (most recent first)
    past.sort((a, b) => b.pastSince - a.pastSince);

    return past;
  }
}

// Singleton instance
export const deadlineService = new DeadlineService();

/**
 * Helper function for middleware/auth checks
 */
export async function requireOpenAssignment(assignmentId: string): Promise<{
  success: boolean;
  assignment?: Assignment;
  error?: string;
}> {
  const assignment = await assignmentRepository.findById(assignmentId);

  if (!assignment) {
    return {
      success: false,
      error: "Assignment not found",
    };
  }

  const validation = await deadlineService.validateSubmission(assignmentId);

  if (!validation.allowed) {
    return {
      success: false,
      error: validation.error,
    };
  }

  return {
    success: true,
    assignment,
  };
}
