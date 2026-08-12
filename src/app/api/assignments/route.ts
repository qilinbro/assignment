import { NextRequest, NextResponse } from "next/server";
import { assignmentService } from "@/lib/assignment";
import { CreateAssignmentData } from "@/types";
import { getCurrentUser } from "@/lib/auth/current-user";

// GET /api/assignments - Get all assignments (with stats)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const adminId = searchParams.get("adminId");

    const list = adminId
      ? await assignmentService.getAssignmentsByAdmin(adminId)
      : await assignmentService.getAllAssignments();

    // 给每个作业附加提交统计
    const enriched = await Promise.all(
      list.map(async (a) => {
        const stats = await assignmentService.getAssignmentStatistics(a.id);
        return {
          ...a,
          totalSubmissions: stats?.totalSubmissions ?? 0,
          completedGrading: stats?.completedGrading ?? 0,
          pendingGrading: stats?.pendingGrading ?? 0,
          resubmissions: stats?.resubmissions ?? 0,
          gradingProgress: stats?.gradingProgress ?? 0,
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "获取作业列表失败" },
      { status: 500 }
    );
  }
}

// POST /api/assignments - Create a new assignment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const assignmentData: CreateAssignmentData = {
      title: body.title,
      description: body.description,
      deadline: new Date(body.deadline),
      taIds: body.taIds,
      taCount: body.taCount,
      allowResubmission: body.allowResubmission ?? false,
      resubmissionDescription: body.resubmissionDescription,
      createdBy: currentUser.id,
    };

    const assignment = await assignmentService.createAssignment(assignmentData);

    return NextResponse.json(assignment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: error.message || "创建作业失败" },
      { status: 400 }
    );
  }
}
