export interface Resubmission {
  id: string;
  submissionId: string;
  studentId: string;
  reason: string;
  files: {
    id: string;
    url: string;
    fileName: string;
    fileType: string;
    size: number;
  }[];
  createdAt: Date;
}

export interface CreateResubmissionData {
  submissionId: string;
  studentId: string;
  reason: string;
  files: {
    url: string;
    fileName: string;
    fileType: string;
    size: number;
  }[];
}

export interface ResubmissionWithDetails extends Resubmission {
  submission?: {
    id: string;
    assignmentId: string;
    status: string;
  };
  student?: {
    id: string;
    name: string;
  };
}
