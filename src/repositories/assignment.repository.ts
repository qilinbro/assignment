import { prisma } from "@/lib/db";
import type { Assignment as PrismaAssignment } from "@prisma/client";
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

function toDomain(a: PrismaAssignment): Assignment {
  return {
    id: a.id,
    title: a.title,
    description: a.description ?? undefined,
    deadline: a.deadline,
    taIds: a.taIds,
    taCount: a.taCount,
    allowResubmission: a.allowResubmission,
    resubmissionDescription: a.resubmissionDescription ?? undefined,
    createdBy: a.createdById,
    createdAt: a.createdAt,
  };
}

class PrismaAssignmentRepository implements IAssignmentRepository {
  async findById(id: string): Promise<Assignment | null> {
    const a = await prisma.assignment.findUnique({ where: { id } });
    return a ? toDomain(a) : null;
  }

  async findAll(): Promise<Assignment[]> {
    const list = await prisma.assignment.findMany({
      orderBy: { createdAt: "desc" },
    });
    return list.map(toDomain);
  }

  async findByCreatedBy(createdBy: string): Promise<Assignment[]> {
    const list = await prisma.assignment.findMany({
      where: { createdById: createdBy },
      orderBy: { createdAt: "desc" },
    });
    return list.map(toDomain);
  }

  async create(data: CreateAssignmentData): Promise<Assignment> {
    const a = await prisma.assignment.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        deadline: data.deadline,
        taIds: data.taIds,
        taCount: data.taCount,
        allowResubmission: data.allowResubmission,
        resubmissionDescription: data.resubmissionDescription ?? null,
        createdById: data.createdBy,
      },
    });
    return toDomain(a);
  }

  async update(id: string, data: UpdateAssignmentData): Promise<Assignment | null> {
    try {
      const a = await prisma.assignment.update({
        where: { id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.deadline !== undefined && { deadline: data.deadline }),
          ...(data.taIds !== undefined && { taIds: data.taIds }),
          ...(data.taCount !== undefined && { taCount: data.taCount }),
          ...(data.allowResubmission !== undefined && { allowResubmission: data.allowResubmission }),
          ...(data.resubmissionDescription !== undefined && {
            resubmissionDescription: data.resubmissionDescription,
          }),
        },
      });
      return toDomain(a);
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.assignment.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async getStatistics(id: string): Promise<AssignmentStatistics | null> {
    const a = await prisma.assignment.findUnique({ where: { id } });
    if (!a) return null;
    const totalSubmissions = await prisma.submission.count({
      where: { assignmentId: id },
    });
    return {
      id,
      title: a.title,
      totalSubmissions,
      completedGrading: 0,
      pendingGrading: 0,
      resubmissions: 0,
      gradingProgress: 0,
    };
  }
}

export const assignmentRepository = new PrismaAssignmentRepository();
