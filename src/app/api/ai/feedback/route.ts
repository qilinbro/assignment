import { NextRequest, NextResponse } from "next/server";
import { aiAssistantService } from "@/lib/ai";
import type { AIAnalysisResult } from "@/types";

// POST /api/ai/feedback - Generate feedback from AI analysis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { analysis, customInstructions } = body;

    if (!analysis) {
      return NextResponse.json(
        { error: "analysis 为必填项" },
        { status: 400 }
      );
    }

    const feedback = await aiAssistantService.generateFeedback(
      analysis as AIAnalysisResult,
      customInstructions
    );

    return NextResponse.json({ feedback });
  } catch (error: any) {
    console.error("Error generating feedback:", error);
    return NextResponse.json(
      { error: error.message || "生成反馈失败" },
      { status: 500 }
    );
  }
}
