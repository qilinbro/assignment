import { NextRequest, NextResponse } from "next/server";
import { submissionService } from "@/lib/submission";

// GET /api/submissions/:id - Get submission details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const submission = await submissionService.getSubmissionWithDetails(id);

    if (!submission) {
      return NextResponse.json(
        { error: "未找到提交" },
        { status: 404 }
      );
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      { error: "获取提交失败" },
      { status: 500 }
    );
  }
}

// DELETE /api/submissions/:id - Delete a submission
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await submissionService.deleteSubmission(id);

    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    console.error("Error deleting submission:", error);
    return NextResponse.json(
      { error: error.message || "删除提交失败" },
      { status: 400 }
    );
  }
}
