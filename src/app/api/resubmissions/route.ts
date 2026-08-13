import { NextRequest, NextResponse } from "next/server";
import { resubmissionService } from "@/lib/resubmission";
import { CreateResubmissionData } from "@/types";
import { getCurrentUser } from "@/lib/auth/current-user";

// POST /api/resubmissions - Create a resubmission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const resubmissionData: CreateResubmissionData = {
      submissionId: body.submissionId,
      studentId: currentUser.id,
      reason: body.reason,
      files: body.files,
    };

    const resubmission = await resubmissionService.createResubmission(resubmissionData);

    // Process the resubmission (update submission status)
    await resubmissionService.processResubmission(resubmission.id);

    return NextResponse.json(resubmission, { status: 201 });
  } catch (error: any) {
    console.error("Error creating resubmission:", error);
    return NextResponse.json(
      { error: error.message || "创建重新提交失败" },
      { status: 400 }
    );
  }
}

// GET /api/resubmissions?submissionId=:id - Get resubmissions for a submission
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const submissionId = searchParams.get("submissionId");
    const studentId = searchParams.get("studentId");

    if (submissionId) {
      const resubmissions = await resubmissionService.getResubmissionsBySubmission(submissionId);
      return NextResponse.json(resubmissions);
    }

    if (studentId) {
      const resubmissions = await resubmissionService.getResubmissionsByStudent(studentId);
      return NextResponse.json(resubmissions);
    }

    return NextResponse.json(
      { error: "请提供 submissionId 或 studentId 筛选条件" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching resubmissions:", error);
    return NextResponse.json(
      { error: "获取重新提交列表失败" },
      { status: 500 }
    );
  }
}
