import {
  Assignment,
  CreateAssignmentData,
  UpdateAssignmentData,
  AssignmentStatistics,
} from "@/types";

export interface IAssignmentRepository {
  findById(id: string): Promise<Assignment | null>;
  findAll(): Promise<Assignment[]>;
  findByCreatedBy(createdBy: string): Promise<Assignment[]>;
  create(data: CreateAssignmentData): Promise<Assignment>;
  update(id: string, data: UpdateAssignmentData): Promise<Assignment | null>;
  delete(id: string): Promise<boolean>;
  getStatistics(id: string): Promise<AssignmentStatistics | null>;
}

class MockAssignmentRepository implements IAssignmentRepository {
  private assignments: Map<string, Assignment> = new Map();

  // No mock data - starting with empty repository

  async findById(id: string): Promise<Assignment | null> {
    return this.assignments.get(id) || null;
  }

  async findAll(): Promise<Assignment[]> {
    return Array.from(this.assignments.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async findByCreatedBy(createdBy: string): Promise<Assignment[]> {
    return Array.from(this.assignments.values())
      .filter((a) => a.createdBy === createdBy)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async create(data: CreateAssignmentData): Promise<Assignment> {
    const newAssignment: Assignment = {
      id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date(),
    };
    this.assignments.set(newAssignment.id, newAssignment);
    return newAssignment;
  }

  async update(
    id: string,
    data: UpdateAssignmentData
  ): Promise<Assignment | null> {
    const assignment = this.assignments.get(id);
    if (!assignment) {
      return null;
    }

    const updatedAssignment: Assignment = {
      ...assignment,
      ...data,
    };
    this.assignments.set(id, updatedAssignment);
    return updatedAssignment;
  }

  async delete(id: string): Promise<boolean> {
    return this.assignments.delete(id);
  }

  async getStatistics(id: string): Promise<AssignmentStatistics | null> {
    const assignment = this.assignments.get(id);
    if (!assignment) {
      return null;
    }

    // This will be populated by the submission repository
    return {
      id,
      title: assignment.title,
      totalSubmissions: 0,
      completedGrading: 0,
      pendingGrading: 0,
      resubmissions: 0,
      gradingProgress: 0,
    };
  }
}

export const assignmentRepository = new MockAssignmentRepository();
