import { NextRequest, NextResponse } from "next/server";
import { allocationService } from "@/lib/allocation";
import { assignmentRepository } from "@/repositories";
import { submissionRepository } from "@/repositories";

// POST /api/allocation - Execute TA allocation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId, assignmentId } = body;

    if (!submissionId || !assignmentId) {
      return NextResponse.json(
        { error: "submissionId 和 assignmentId 为必填项" },
        { status: 400 }
      );
    }

    // Get assignment details to determine TA allocation
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json(
        { error: "未找到作业" },
        { status: 404 }
      );
    }

    // Execute allocation
    const result = await allocationService.allocateTeachingAssistants(
      submissionId,
      assignmentId,
      assignment.taIds,
      assignment.taCount
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error executing allocation:", error);
    return NextResponse.json(
      { error: "执行分配失败" },
      { status: 500 }
    );
  }
}

// GET /api/allocation?assignmentId=:id - Get allocation statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json(
        { error: "assignmentId 为必填项" },
        { status: 400 }
      );
    }

    const stats = await allocationService.getAssignmentStatistics(assignmentId);
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Error fetching allocation statistics:", error);
    return NextResponse.json(
      { error: error.message || "获取统计数据失败" },
      { status: 500 }
    );
  }
}
