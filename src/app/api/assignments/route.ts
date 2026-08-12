import { NextRequest, NextResponse } from "next/server";
import { assignmentService } from "@/lib/assignment";
import { CreateAssignmentData } from "@/types";

// GET /api/assignments - Get all assignments
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const adminId = searchParams.get("adminId");

    if (adminId) {
      const assignments = await assignmentService.getAssignmentsByAdmin(adminId);
      return NextResponse.json(assignments);
    }

    const assignments = await assignmentService.getAllAssignments();
    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

// POST /api/assignments - Create a new assignment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const assignmentData: CreateAssignmentData = {
      title: body.title,
      description: body.description,
      deadline: new Date(body.deadline),
      taIds: body.taIds,
      taCount: body.taCount,
      allowResubmission: body.allowResubmission ?? false,
      resubmissionDescription: body.resubmissionDescription,
      createdBy: body.createdBy || "admin-1", // In a real app, this would come from auth
    };

    const assignment = await assignmentService.createAssignment(assignmentData);

    return NextResponse.json(assignment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create assignment" },
      { status: 400 }
    );
  }
}
