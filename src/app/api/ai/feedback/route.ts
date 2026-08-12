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
        { error: "analysis is required" },
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
      { error: error.message || "Failed to generate feedback" },
      { status: 500 }
    );
  }
}
