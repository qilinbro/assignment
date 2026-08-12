import { NextRequest, NextResponse } from "next/server";
import { aiAssistantService } from "@/lib/ai";
import type { AIAnalysisRequest } from "@/types";

// POST /api/ai/analyze - Analyze a submission with AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const analysisRequest: AIAnalysisRequest = {
      submissionId: body.submissionId,
      assignmentTitle: body.assignmentTitle,
      assignmentDescription: body.assignmentDescription,
      studentFiles: body.studentFiles || [],
      gradingCriteria: body.gradingCriteria,
    };

    const analysis = await aiAssistantService.analyzeSubmission(analysisRequest);

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("Error analyzing submission:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze submission" },
      { status: 500 }
    );
  }
}
