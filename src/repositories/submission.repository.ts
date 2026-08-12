import { prisma } from "@/lib/db";
import type {
  Submission as PrismaSubmission,
  SubmissionAssignment as PrismaSubmissionAssignment,
} from "@prisma/client";
import {
  Submission,
  SubmissionAssignment,
  CreateSubmissionData,
  SubmissionStatus,
} from "@/types";

export interface ISubmissionRepository {
  findById(id: string): Promise<Submission | null>;
  findByAssignmentId(assignmentId: string): Promise<Submission[]>;
  findByStudentId(studentId: string): Promise<Submission[]>;
  findByAssignmentAndStudent(
    assignmentId: string,
    studentId: string
  ): Promise<Submission | null>;
  create(data: CreateSubmissionData): Promise<Submission>;
  updateStatus(id: string, status: SubmissionStatus): Promise<Submission | null>;
  delete(id: string): Promise<boolean>;
  createAssignment(
    assignment: Omit<SubmissionAssignment, "id" | "assignedAt">
  ): Promise<SubmissionAssignment>;
  findAssignmentsBySubmissionId(
    submissionId: string
  ): Promise<SubmissionAssignment[]>;
  findAssignmentsByTaId(taId: string): Promise<SubmissionAssignment[]>;
  findAssignmentById(id: string): Promise<SubmissionAssignment | null>;
  updateAssignmentStatus(
    id: string,
    status: SubmissionAssignment["status"]
  ): Promise<SubmissionAssignment | null>;
  updateAssignment(
    id: string,
    data: Partial<SubmissionAssignment>
  ): Promise<SubmissionAssignment | null>;
}

function toDomain(s: PrismaSubmission): Submission {
  return {
    id: s.id,
    assignmentId: s.assignmentId,
    studentId: s.studentId,
    status: s.status as SubmissionStatus,
    submittedAt: s.submittedAt,
    createdAt: s.createdAt,
    files: s.files.map((f) => ({
      id: f.id,
      url: f.url,
      fileName: f.fileName,
      fileType: f.fileType,
      size: f.size,
    })),
  };
}

function toDomainAssignment(a: PrismaSubmissionAssignment): SubmissionAssignment {
  return {
    id: a.id,
    submissionId: a.submissionId,
    taId: a.taId,
    status: a.status as SubmissionAssignment["status"],
    assignedAt: a.assignedAt,
    completedAt: a.completedAt ?? undefined,
  };
}

class PrismaSubmissionRepository implements ISubmissionRepository {
  async findById(id: string): Promise<Submission | null> {
    const s = await prisma.submission.findUnique({
      where: { id },
      include: { files: true },
    });
    return s ? toDomain(s) : null;
  }

  async findByAssignmentId(assignmentId: string): Promise<Submission[]> {
    const list = await prisma.submission.findMany({
      where: { assignmentId },
      include: { files: true },
    });
    return list.map(toDomain);
  }

  async findByStudentId(studentId: string): Promise<Submission[]> {
    const list = await prisma.submission.findMany({
      where: { studentId },
      include: { files: true },
      orderBy: { submittedAt: "desc" },
    });
    return list.map(toDomain);
  }

  async findByAssignmentAndStudent(
    assignmentId: string,
    studentId: string
  ): Promise<Submission | null> {
    const s = await prisma.submission.findFirst({
      where: { assignmentId, studentId },
      include: { files: true },
    });
    return s ? toDomain(s) : null;
  }

  async create(data: CreateSubmissionData): Promise<Submission> {
    const s = await prisma.submission.create({
      data: {
        assignmentId: data.assignmentId,
        studentId: data.studentId,
        status: "PENDING",
        submittedAt: new Date(),
        files: {
          create: data.files.map((f) => ({
            url: f.url,
            fileName: f.fileName,
            fileType: f.fileType,
            size: f.size,
          })),
        },
      },
      include: { files: true },
    });
    return toDomain(s);
  }

  async updateStatus(
    id: string,
    status: SubmissionStatus
  ): Promise<Submission | null> {
    try {
      const s = await prisma.submission.update({
        where: { id },
        data: { status },
        include: { files: true },
      });
      return toDomain(s);
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.submission.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  // ---- SubmissionAssignment ----
  async createAssignment(
    assignment: Omit<SubmissionAssignment, "id" | "assignedAt">
  ): Promise<SubmissionAssignment> {
    const a = await prisma.submissionAssignment.create({
      data: {
        submissionId: assignment.submissionId,
        taId: assignment.taId,
        status: assignment.status,
        assignedAt: new Date(),
        completedAt: assignment.completedAt ?? null,
      },
    });
    return toDomainAssignment(a);
  }

  async findAssignmentsBySubmissionId(
    submissionId: string
  ): Promise<SubmissionAssignment[]> {
    const list = await prisma.submissionAssignment.findMany({
      where: { submissionId },
      orderBy: { assignedAt: "asc" },
    });
    return list.map(toDomainAssignment);
  }

  async findAssignmentsByTaId(taId: string): Promise<SubmissionAssignment[]> {
    const list = await prisma.submissionAssignment.findMany({
      where: { taId },
      orderBy: { assignedAt: "desc" },
    });
    return list.map(toDomainAssignment);
  }

  async findAssignmentById(id: string): Promise<SubmissionAssignment | null> {
    const a = await prisma.submissionAssignment.findUnique({ where: { id } });
    return a ? toDomainAssignment(a) : null;
  }

  async updateAssignmentStatus(
    id: string,
    status: SubmissionAssignment["status"]
  ): Promise<SubmissionAssignment | null> {
    try {
      const a = await prisma.submissionAssignment.update({
        where: { id },
        data: {
          status,
          completedAt:
            status === "COMPLETED" || status === "RESUBMISSION_REQUIRED"
              ? new Date()
              : undefined,
        },
      });
      return toDomainAssignment(a);
    } catch {
      return null;
    }
  }

  async updateAssignment(
    id: string,
    data: Partial<SubmissionAssignment>
  ): Promise<SubmissionAssignment | null> {
    try {
      const a = await prisma.submissionAssignment.update({
        where: { id },
        data: {
          ...(data.status !== undefined && { status: data.status }),
          ...(data.completedAt !== undefined && { completedAt: data.completedAt }),
        },
      });
      return toDomainAssignment(a);
    } catch {
      return null;
    }
  }
}

export const submissionRepository = new PrismaSubmissionRepository();
