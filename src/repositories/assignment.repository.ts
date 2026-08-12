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

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create some mock assignments
    const week1Assignment: Assignment = {
      id: "assignment-week-1",
      title: "第一周作业",
      description: "完成第一章的练习题",
      deadline: new Date("2026-08-20T23:59:59"),
      taIds: ["ta-1", "ta-2", "ta-3", "ta-4", "ta-5"],
      taCount: 2,
      allowResubmission: true,
      resubmissionDescription:
        "请说明你根据反馈做了哪些修改",
      createdBy: "admin-1",
      createdAt: new Date("2024-08-01"),
    };

    const week2Assignment: Assignment = {
      id: "assignment-week-2",
      title: "第二周作业",
      description: "作文写作练习",
      deadline: new Date("2026-09-01T23:59:59"),
      taIds: ["ta-1", "ta-2", "ta-3", "ta-4"],
      taCount: 2,
      allowResubmission: true,
      resubmissionDescription: "请回应所有助教的评语",
      createdBy: "admin-1",
      createdAt: new Date("2024-08-08"),
    };

    const week3Assignment: Assignment = {
      id: "assignment-week-3",
      title: "第三周作业",
      description: "阅读理解与分析",
      deadline: new Date("2026-08-15T23:59:59"),
      taIds: ["ta-1", "ta-2", "ta-3"],
      taCount: 1,
      allowResubmission: false,
      createdBy: "admin-1",
      createdAt: new Date("2024-08-12"),
    };

    this.assignments.set(week1Assignment.id, week1Assignment);
    this.assignments.set(week2Assignment.id, week2Assignment);
    this.assignments.set(week3Assignment.id, week3Assignment);
  }

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
