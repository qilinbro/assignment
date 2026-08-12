import { NextRequest, NextResponse } from "next/server";
import { aiAssistantService } from "@/lib/ai";

// POST /api/ai/chat - Chat with AI about a submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { submissionId, message, history } = body;

    if (!submissionId || !message) {
      return NextResponse.json(
        { error: "submissionId and message are required" },
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
      { error: error.message || "Failed to process chat message" },
      { status: 500 }
    );
  }
}
