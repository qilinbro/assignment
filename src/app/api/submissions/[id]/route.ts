import { NextRequest, NextResponse } from "next/server";
import { submissionService } from "@/lib/submission";

// GET /api/submissions/:id - Get submission details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const submission = await submissionService.getSubmissionWithDetails(params.id);

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission" },
      { status: 500 }
    );
  }
}

// DELETE /api/submissions/:id - Delete a submission
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await submissionService.deleteSubmission(params.id);

    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    console.error("Error deleting submission:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete submission" },
      { status: 400 }
    );
  }
}
