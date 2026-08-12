import { NextRequest, NextResponse } from "next/server";
import { submissionService } from "@/lib/submission";
import { CreateSubmissionData } from "@/types";
import { getCurrentUser } from "@/lib/auth/current-user";

// POST /api/submissions - Create a new submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const submissionData: CreateSubmissionData = {
      assignmentId: body.assignmentId,
      studentId: currentUser.id,
      files: body.files,
    };

    const submission = await submissionService.createSubmission(submissionData);

    return NextResponse.json(submission, { status: 201 });
  } catch (error: any) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { error: error.message || "创建提交失败" },
      { status: 400 }
    );
  }
}

// GET /api/submissions - Get submissions with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get("studentId");
    const assignmentId = searchParams.get("assignmentId");

    if (studentId) {
      const submissions = await submissionService.getSubmissionsByStudent(studentId);
      return NextResponse.json(submissions);
    }

    if (assignmentId) {
      const submissions = await submissionService.getSubmissionsByAssignment(assignmentId);
      return NextResponse.json(submissions);
    }

    // 无参数时，返回当前登录学生的提交
    const me = await getCurrentUser();
    if (me) {
      const submissions = await submissionService.getSubmissionsByStudent(me.id);
      return NextResponse.json(submissions);
    }

    return NextResponse.json(
      { error: "请提供 studentId 或 assignmentId 筛选条件" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "获取提交列表失败" },
      { status: 500 }
    );
  }
}
