import { NextRequest, NextResponse } from "next/server";
import { submissionService } from "@/lib/submission";
import { CreateSubmissionData } from "@/types";

// POST /api/submissions - Create a new submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const submissionData: CreateSubmissionData = {
      assignmentId: body.assignmentId,
      studentId: body.studentId || "student-1", // In a real app, this would come from auth
      files: body.files,
    };

    const submission = await submissionService.createSubmission(submissionData);

    return NextResponse.json(submission, { status: 201 });
  } catch (error: any) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create submission" },
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

    return NextResponse.json(
      { error: "Please provide studentId or assignmentId filter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
