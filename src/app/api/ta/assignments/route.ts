import { NextRequest, NextResponse } from "next/server";
import { submissionRepository } from "@/repositories";
import { getCurrentUser } from "@/lib/auth/current-user";

// GET /api/ta/assignments - Get TA's grading tasks
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    const taId = currentUser.id;

    const assignments = await submissionRepository.findAssignmentsByTaId(taId);

    // Enrich with submission details
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const submission = await submissionRepository.findById(assignment.submissionId);
        return {
          ...assignment,
          submission,
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
