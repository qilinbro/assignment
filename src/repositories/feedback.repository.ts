import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { Feedback, CreateFeedbackData } from "@/types";

export interface IFeedbackRepository {
  findById(id: string): Promise<Feedback | null>;
  findBySubmissionAssignmentId(submissionAssignmentId: string): Promise<Feedback[]>;
  create(data: CreateFeedbackData): Promise<Feedback>;
  update(id: string, data: Partial<Feedback>): Promise<Feedback | null>;
  delete(id: string): Promise<boolean>;
  findBySubmissionId(submissionId: string): Promise<Feedback[]>;
}

type PrismaFeedbackWithFiles = Prisma.FeedbackGetPayload<{
  include: { files: true };
}>;

function toDomain(f: PrismaFeedbackWithFiles): Feedback {
  return {
    id: f.id,
    submissionAssignmentId: f.submissionAssignmentId,
    score: f.score ?? undefined,
    comment: f.comment ?? undefined,
    requireResubmission: f.requireResubmission,
    createdAt: f.createdAt,
    files: f.files.map((file) => ({
      id: file.id,
      url: file.url,
      fileName: file.fileName,
      fileType: file.fileType,
      size: file.size,
    })),
  };
}

class PrismaFeedbackRepository implements IFeedbackRepository {
  async findById(id: string): Promise<Feedback | null> {
    const f = await prisma.feedback.findUnique({
      where: { id },
      include: { files: true },
    });
    return f ? toDomain(f) : null;
  }

  async findBySubmissionAssignmentId(
    submissionAssignmentId: string
  ): Promise<Feedback[]> {
    const list = await prisma.feedback.findMany({
      where: { submissionAssignmentId },
      include: { files: true },
      orderBy: { createdAt: "asc" },
    });
    return list.map(toDomain);
  }

  async create(data: CreateFeedbackData): Promise<Feedback> {
    const f = await prisma.feedback.create({
      data: {
        submissionAssignmentId: data.submissionAssignmentId,
        score: data.score ?? null,
        comment: data.comment ?? null,
        requireResubmission: data.requireResubmission,
        files: {
          create: data.files.map((file) => ({
            url: file.url,
            fileName: file.fileName,
            fileType: file.fileType,
            size: file.size,
          })),
        },
      },
      include: { files: true },
    });
    return toDomain(f);
  }

  async update(id: string, data: Partial<Feedback>): Promise<Feedback | null> {
    try {
      const f = await prisma.feedback.update({
        where: { id },
        data: {
          ...(data.score !== undefined && { score: data.score }),
          ...(data.comment !== undefined && { comment: data.comment }),
          ...(data.requireResubmission !== undefined && {
            requireResubmission: data.requireResubmission,
          }),
        },
        include: { files: true },
      });
      return toDomain(f);
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.feedback.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async findBySubmissionId(submissionId: string): Promise<Feedback[]> {
    // 正确联表：feedback -> submissionAssignment -> submission
    const list = await prisma.feedback.findMany({
      where: { submissionAssignment: { submissionId } },
      include: { files: true },
      orderBy: { createdAt: "asc" },
    });
    return list.map(toDomain);
  }
}

export const feedbackRepository = new PrismaFeedbackRepository();
