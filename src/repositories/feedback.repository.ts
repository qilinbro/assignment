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
        "The solution to Question 1 is correct. Please revise Questions 2 and 3.",
      files: [
        {
          id: "fb-file-1",
          url: "/uploads/feedback-1-1.jpg",
          fileName: "feedback.jpg",
          fileType: "image/jpeg",
          size: 512000,
        },
      ],
      requireResubmission: false,
      createdAt: new Date("2024-08-12T16:00:00"),
    };

    const feedback2: Feedback = {
      id: "feedback-2",
      submissionAssignmentId: "sa-2",
      score: 90,
      comment: "Good work overall. Clear explanations.",
      files: [],
      requireResubmission: false,
      createdAt: new Date("2024-08-12T16:30:00"),
    };

    const feedback3: Feedback = {
      id: "feedback-3",
      submissionAssignmentId: "sa-3",
      score: 78,
      comment:
        "Some concepts need clarification. Please review the feedback and resubmit.",
      files: [
        {
          id: "fb-file-2",
          url: "/uploads/feedback-3-1.pdf",
          fileName: "detailed-feedback.pdf",
          fileType: "application/pdf",
          size: 204800,
        },
      ],
      requireResubmission: true,
      createdAt: new Date("2024-08-12T17:00:00"),
    };

    const feedback4: Feedback = {
      id: "feedback-4",
      submissionAssignmentId: "sa-4",
      score: 88,
      comment: "Well-structured answer. Good examples.",
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
