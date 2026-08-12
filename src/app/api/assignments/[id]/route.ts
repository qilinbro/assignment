import { NextRequest, NextResponse } from "next/server";
import { assignmentService } from "@/lib/assignment";
import { prisma } from "@/lib/db";

// GET /api/assignments/:id - Get assignment details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assignment = await assignmentService.getAssignment(id);

    if (!assignment) {
      return NextResponse.json(
        { error: "未找到作业" },
        { status: 404 }
      );
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json(
      { error: "获取作业失败" },
      { status: 500 }
    );
  }
}

// PUT /api/assignments/:id - Update an assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

    const assignment = await assignmentService.updateAssignment(id, {
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
        { error: "未找到作业" },
        { status: 404 }
      );
    }

    return NextResponse.json(assignment);
  } catch (error: any) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: error.message || "更新作业失败" },
      { status: 400 }
    );
  }
}

// DELETE /api/assignments/:id - Delete an assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // 级联删除作业 + 所有关联数据（提交、批改、重新提交等）
    await prisma.assignment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: error.message || "删除作业失败" },
      { status: 400 }
    );
  }
}
