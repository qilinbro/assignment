import {
  Feedback,
  CreateFeedbackData,
  FeedbackWithDetails,
} from "@/types";

export interface IFeedbackRepository {
  findById(id: string): Promise<Feedback | null>;
  findBySubmissionAssignmentId(submissionAssignmentId: string): Promise<Feedback[]>;
  create(data: CreateFeedbackData): Promise<Feedback>;
  update(id: string, data: Partial<Feedback>): Promise<Feedback | null>;
  delete(id: string): Promise<boolean>;
  findBySubmissionId(submissionId: string): Promise<Feedback[]>;
}

class MockFeedbackRepository implements IFeedbackRepository {
  private feedback: Map<string, Feedback> = new Map();

  // No mock data - starting with empty repository

  async findById(id: string): Promise<Feedback | null> {
    return this.feedback.get(id) || null;
  }

  async findBySubmissionAssignmentId(
    submissionAssignmentId: string
  ): Promise<Feedback[]> {
    return Array.from(this.feedback.values()).filter(
      (f) => f.submissionAssignmentId === submissionAssignmentId
    );
  }

  async findBySubmissionId(submissionId: string): Promise<Feedback[]> {
    // This would need to join with submission assignments
    // For now, return all feedback (will be filtered by service layer)
    return Array.from(this.feedback.values());
  }

  async create(data: CreateFeedbackData): Promise<Feedback> {
    const newFeedback: Feedback = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      files: data.files.map((file) => ({
        ...file,
        id: `fb-file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })),
      createdAt: new Date(),
    };
    this.feedback.set(newFeedback.id, newFeedback);
    return newFeedback;
  }

  async update(
    id: string,
    data: Partial<Feedback>
  ): Promise<Feedback | null> {
    const existingFeedback = this.feedback.get(id);
    if (!existingFeedback) {
      return null;
    }

    const updatedFeedback: Feedback = {
      ...existingFeedback,
      ...data,
    };
    this.feedback.set(id, updatedFeedback);
    return updatedFeedback;
  }

  async delete(id: string): Promise<boolean> {
    return this.feedback.delete(id);
  }
}

export const feedbackRepository = new MockFeedbackRepository();
