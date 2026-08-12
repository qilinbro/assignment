export interface Assignment {
  id: string;
  title: string;
  description?: string;
  deadline: Date;
  taIds: string[];
  taCount: number;
  allowResubmission: boolean;
  resubmissionDescription?: string;
  createdBy: string;
  createdAt: Date;
}

export interface CreateAssignmentData {
  title: string;
  description?: string;
  deadline: Date;
  taIds: string[];
  taCount: number;
  allowResubmission: boolean;
  resubmissionDescription?: string;
  createdBy: string;
}

export interface UpdateAssignmentData {
  title?: string;
  description?: string;
  deadline?: Date;
  taIds?: string[];
  taCount?: number;
  allowResubmission?: boolean;
  resubmissionDescription?: string;
}

export interface AssignmentStatistics {
  id: string;
  title: string;
  totalSubmissions: number;
  completedGrading: number;
  pendingGrading: number;
  resubmissions: number;
  gradingProgress: number;
}
