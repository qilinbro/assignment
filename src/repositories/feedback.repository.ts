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

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create some mock feedback
    const feedback1: Feedback = {
      id: "feedback-1",
      submissionAssignmentId: "sa-1",
      score: 85,
      comment:
        "第 1 题解答正确。第 2、3 题请修改。",
      files: [],
      requireResubmission: false,
      createdAt: new Date("2024-08-12T16:00:00"),
    };

    const feedback2: Feedback = {
      id: "feedback-2",
      submissionAssignmentId: "sa-2",
      score: 90,
      comment: "整体表现不错。解释清晰。",
      files: [],
      requireResubmission: false,
      createdAt: new Date("2024-08-12T16:30:00"),
    };

    const feedback3: Feedback = {
      id: "feedback-3",
      submissionAssignmentId: "sa-3",
      score: 78,
      comment:
        "部分概念需要澄清。请查看反馈并重新提交。",
      files: [],
      requireResubmission: true,
      createdAt: new Date("2024-08-12T17:00:00"),
    };

    const feedback4: Feedback = {
      id: "feedback-4",
      submissionAssignmentId: "sa-4",
      score: 88,
      comment: "答案结构合理，例子恰当。",
      files: [],
      requireResubmission: false,
      createdAt: new Date("2024-08-12T17:30:00"),
    };

    this.feedback.set(feedback1.id, feedback1);
    this.feedback.set(feedback2.id, feedback2);
    this.feedback.set(feedback3.id, feedback3);
    this.feedback.set(feedback4.id, feedback4);
  }

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
