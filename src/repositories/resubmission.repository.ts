import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { Resubmission, CreateResubmissionData } from "@/types";

export interface IResubmissionRepository {
  findById(id: string): Promise<Resubmission | null>;
  findBySubmissionId(submissionId: string): Promise<Resubmission[]>;
  findByStudentId(studentId: string): Promise<Resubmission[]>;
  findByAssignmentId(assignmentId: string): Promise<Resubmission[]>;
  create(data: CreateResubmissionData): Promise<Resubmission>;
  delete(id: string): Promise<boolean>;
  findAll(): Promise<Resubmission[]>;
}

type PrismaResubmissionWithFiles = Prisma.ResubmissionGetPayload<{
  include: { files: true };
}>;

function toDomain(r: PrismaResubmissionWithFiles): Resubmission {
  return {
    id: r.id,
    submissionId: r.submissionId,
    studentId: r.studentId,
    reason: r.reason,
    createdAt: r.createdAt,
    files: r.files.map((f) => ({
      id: f.id,
      url: f.url,
      fileName: f.fileName,
      fileType: f.fileType,
      size: f.size,
    })),
  };
}

class PrismaResubmissionRepository implements IResubmissionRepository {
  async findById(id: string): Promise<Resubmission | null> {
    const r = await prisma.resubmission.findUnique({
      where: { id },
      include: { files: true },
    });
    return r ? toDomain(r) : null;
  }

  async findBySubmissionId(submissionId: string): Promise<Resubmission[]> {
    const list = await prisma.resubmission.findMany({
      where: { submissionId },
      include: { files: true },
      orderBy: { createdAt: "desc" },
    });
    return list.map(toDomain);
  }

  async findByStudentId(studentId: string): Promise<Resubmission[]> {
    const list = await prisma.resubmission.findMany({
      where: { studentId },
      include: { files: true },
      orderBy: { createdAt: "desc" },
    });
    return list.map(toDomain);
  }

  async findByAssignmentId(assignmentId: string): Promise<Resubmission[]> {
    // 正确联表：resubmission -> submission -> assignment
    const list = await prisma.resubmission.findMany({
      where: { submission: { assignmentId } },
      include: { files: true },
      orderBy: { createdAt: "desc" },
    });
    return list.map(toDomain);
  }

  async create(data: CreateResubmissionData): Promise<Resubmission> {
    const r = await prisma.resubmission.create({
      data: {
        submissionId: data.submissionId,
        studentId: data.studentId,
        reason: data.reason,
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
    return toDomain(r);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.resubmission.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async findAll(): Promise<Resubmission[]> {
    const list = await prisma.resubmission.findMany({
      include: { files: true },
      orderBy: { createdAt: "desc" },
    });
    return list.map(toDomain);
  }
}

export const resubmissionRepository = new PrismaResubmissionRepository();
