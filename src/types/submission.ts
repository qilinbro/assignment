export type SubmissionStatus =
  | "PENDING"
  | "GRADING"
  | "COMPLETED"
  | "RESUBMISSION_REQUIRED"
  | "RESUBMITTED";

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  files: SubmissionFile[];
  status: SubmissionStatus;
  submittedAt: Date;
  createdAt: Date;
}

export interface SubmissionFile {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  size: number;
}

export interface CreateSubmissionData {
  assignmentId: string;
  studentId: string;
  files: {
    url: string;
    fileName: string;
    fileType: string;
    size: number;
  }[];
}

export interface SubmissionAssignment {
  id: string;
  submissionId: string;
  taId: string;
  status:
    | "PENDING"
    | "GRADING"
    | "COMPLETED"
    | "RESUBMISSION_REQUIRED";
  assignedAt: Date;
  completedAt?: Date;
}

export interface SubmissionWithDetails extends Submission {
  assignment?: {
    id: string;
    title: string;
    deadline: Date;
  };
  student?: {
    id: string;
    name: string;
  };
  assignments?: SubmissionAssignment[];
}
