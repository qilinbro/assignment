import { NextRequest, NextResponse } from "next/server";
import { feedbackService } from "@/lib/feedback";
import { CreateFeedbackData } from "@/types";

// POST /api/feedback - Submit grading feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const feedbackData: CreateFeedbackData = {
      submissionAssignmentId: body.submissionAssignmentId,
      score: body.score,
      comment: body.comment,
      files: body.files || [],
      requireResubmission: body.requireResubmission ?? false,
    };

    const result = await feedbackService.submitGrading(feedbackData);

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: error.message || "提交反馈失败" },
      { status: 400 }
    );
  }
}

// GET /api/feedback?submissionId=:id - Get feedback for a submission
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const submissionId = searchParams.get("submissionId");

    if (!submissionId) {
      return NextResponse.json(
        { error: "submissionId 为必填项" },
        { status: 400 }
      );
    }

    const feedback = await feedbackService.getSubmissionFeedbackWithDetails(submissionId);

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "获取反馈失败" },
      { status: 500 }
    );
  }
}
