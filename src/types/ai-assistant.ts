/**
 * AI Grading Assistant Types
 */

export interface AIAnalysisRequest {
  submissionId: string;
  assignmentTitle: string;
  assignmentDescription?: string;
  studentFiles: {
    id: string;
    url: string;
    fileName: string;
    content?: string; // OCR'd text content
  }[];
  gradingCriteria?: string;
}

export interface AIAnalysisResult {
  submissionId: string;
  analysisId: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestedScore: number;
  suggestedComments: string;
  keyPoints: string[];
  questionsAddressed: {
    questionNumber: number;
    addressed: boolean;
    quality: "excellent" | "good" | "fair" | "poor";
    notes: string;
  }[];
  improvementSuggestions: string[];
  requiresResubmission: boolean;
  confidence: number; // 0-1
  analyzedAt: Date;
}

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AIGradingAssistant {
  analyzeSubmission(request: AIAnalysisRequest): Promise<AIAnalysisResult>;
  generateFeedback(analysis: AIAnalysisResult, customInstructions?: string): Promise<string>;
  chatAboutSubmission(submissionId: string, message: string, history: AIChatMessage[]): Promise<string>;
  compareSubmissions(submissionIds: string[]): Promise<{
    comparison: string;
    rankings: Array<{ submissionId: string; score: number; notes: string }>;
  }>;
}
