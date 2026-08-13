import { NextRequest, NextResponse } from "next/server";
import { submissionRepository } from "@/repositories";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";

// GET /api/ta/assignments - Get TA's grading tasks
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    const taId = currentUser.id;

    const assignments = await submissionRepository.findAssignmentsByTaId(taId);

    // Enrich with submission details and student info
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const submission = await submissionRepository.findById(assignment.submissionId);
        // 获取学生信息（学生编号/学号）
        const student = submission?.studentId
          ? await prisma.user.findUnique({
              where: { id: submission.studentId },
              select: { id: true, name: true },
            })
          : null;

        return {
          ...assignment,
          submission,
          student,
        };
      })
    );

    return NextResponse.json(enrichedAssignments);
  } catch (error) {
    console.error("Error fetching TA assignments:", error);
    return NextResponse.json(
      { error: "获取助教分配列表失败" },
      { status: 500 }
    );
  }
}
