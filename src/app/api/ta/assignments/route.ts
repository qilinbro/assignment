import { NextRequest, NextResponse } from "next/server";
import { submissionRepository } from "@/repositories";

// GET /api/ta/assignments - Get TA's grading tasks
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const taId = searchParams.get("taId") || "ta-1"; // In a real app, this would come from auth

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
      { error: "Failed to fetch TA assignments" },
      { status: 500 }
    );
  }
}
