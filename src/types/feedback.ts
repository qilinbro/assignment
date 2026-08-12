export interface Feedback {
  id: string;
  submissionAssignmentId: string;
  score?: number;
  comment?: string;
  files: FeedbackFile[];
  requireResubmission: boolean;
  createdAt: Date;
}

export interface FeedbackFile {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  size: number;
}

export interface CreateFeedbackData {
  submissionAssignmentId: string;
  score?: number;
  comment?: string;
  files: {
    url: string;
    fileName: string;
    fileType: string;
    size: number;
  }[];
  requireResubmission: boolean;
}

export interface FeedbackWithDetails extends Feedback {
  submissionAssignment?: {
    id: string;
    submissionId: string;
    taId: string;
    status: string;
  };
  ta?: {
    id: string;
    name: string;
  };
}
