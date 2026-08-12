import { NextRequest, NextResponse } from "next/server";
import { assignmentService } from "@/lib/assignment";

// GET /api/assignments/:id - Get assignment details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignment = await assignmentService.getAssignment(params.id);

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
}

// PUT /api/assignments/:id - Update an assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const assignment = await assignmentService.updateAssignment(params.id, {
      title: body.title,
      description: body.description,
      deadline: body.deadline ? new Date(body.deadline) : undefined,
      taIds: body.taIds,
      taCount: body.taCount,
      allowResubmission: body.allowResubmission,
      resubmissionDescription: body.resubmissionDescription,
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(assignment);
  } catch (error: any) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update assignment" },
      { status: 400 }
    );
  }
}

// DELETE /api/assignments/:id - Delete an assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await assignmentService.deleteAssignment(params.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete assignment" },
      { status: 400 }
    );
  }
}
