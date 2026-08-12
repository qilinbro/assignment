import { NextRequest, NextResponse } from "next/server";
import { aiAssistantService } from "@/lib/ai";

// POST /api/ai/chat - Chat with AI about a submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { submissionId, message, history } = body;

    if (!submissionId || !message) {
      return NextResponse.json(
        { error: "submissionId 和 message 为必填项" },
        { status: 400 }
      );
    }

    const response = await aiAssistantService.chatAboutSubmission(
      submissionId,
      message,
      history || []
    );

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("Error in AI chat:", error);
    return NextResponse.json(
      { error: error.message || "处理聊天消息失败" },
      { status: 500 }
    );
  }
}
