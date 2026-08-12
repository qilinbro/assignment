/**
 * AI Grading Assistant Service
 *
 * Helps TAs/teachers examine and grade student assignments using AI
 */

import type {
  AIAnalysisRequest,
  AIAnalysisResult,
  AIChatMessage,
  AIGradingAssistant,
} from "@/types/ai-assistant";

/**
 * Mock AI Service for demonstration
 * In production, this would integrate with Claude API, OpenAI, or similar
 */
class MockAIAssistantService implements AIGradingAssistant {
  private analyses: Map<string, AIAnalysisResult> = new Map();

  async analyzeSubmission(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate mock analysis results
    const analysisId = `ai-analysis-${Date.now()}`;
    const analysis: AIAnalysisResult = {
      submissionId: request.submissionId,
      analysisId,
      summary: this.generateSummary(request),
      strengths: this.generateStrengths(),
      weaknesses: this.generateWeaknesses(),
      suggestedScore: this.generateScore(),
      suggestedComments: this.generateComments(),
      keyPoints: this.generateKeyPoints(),
      questionsAddressed: this.generateQuestionAnalysis(),
      improvementSuggestions: this.generateImprovements(),
      requiresResubmission: Math.random() > 0.7, // 30% chance of requiring resubmission
      confidence: 0.8 + Math.random() * 0.15, // 0.8-0.95
      analyzedAt: new Date(),
    };

    this.analyses.set(analysisId, analysis);
    return analysis;
  }

  async generateFeedback(
    analysis: AIAnalysisResult,
    customInstructions?: string
  ): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let feedback = `**AI 生成的反馈：**

${analysis.summary}

**优点：**
${analysis.strengths.map((s) => `- ${s}`).join("\n")}

**待改进之处：**
${analysis.weaknesses.map((w) => `- ${w}`).join("\n")}

**具体建议：**
${analysis.improvementSuggestions.map((i) => `- ${i}`).join("\n")}

**建议分数：${analysis.suggestedScore}/100**`;

    if (customInstructions) {
      feedback += `\n\n**补充说明：**\n${customInstructions}`;
    }

    return feedback;
  }

  async chatAboutSubmission(
    submissionId: string,
    message: string,
    history: AIChatMessage[]
  ): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock response generation
    const responses = [
      "根据提交的作业，该学生对核心概念有较好的理解。第 1 题的解答结构尤为清晰。",
      "我注意到第 2 题的解释可以更详细一些。目前的答案涵盖了基本要点，但分析深度不足。",
      "第 3 题给出的例子相关且选用恰当，但可以考虑补充更多背景来加强论证。",
      "总体而言，这份作业体现了学生的努力与理解。若能针对上述问题做一些修改，可以达到优秀水平。",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  async compareSubmissions(submissionIds: string[]): Promise<{
    comparison: string;
    rankings: Array<{ submissionId: string; score: number; notes: string }>;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
      comparison:
        "对比各份提交，学生A 对概念的理解最为深入，答案结构清晰。学生B 内容不错但需要更清晰的表述。学生C 的作业需要大幅修改。",
      rankings: submissionIds.map((id, index) => ({
        submissionId: id,
        score: 90 - index * 10,
        notes: index === 0 ? "最优秀的提交" : index === 1 ? "表现良好" : "需要修改",
      })),
    };
  }

  // Helper methods for generating mock analysis
  private generateSummary(request: AIAnalysisRequest): string {
    const summaries = [
      "学生已完成本作业，对主要概念理解较好。作业组织有序，在回答所有问题时都体现出用心。",
      "本提交表明学生对材料有令人满意的理解。基本要求已达到，但分析的深度仍有提升空间。",
      "学生展现出对学科内容的深入理解。答案论证充分，并配有恰当的例子作为支撑。",
    ];
    return summaries[Math.floor(Math.random() * summaries.length)];
  }

  private generateStrengths(): string[] {
    const allStrengths = [
      "表述清晰、条理有序",
      "善于用例子支撑观点",
      "体现出对关键概念的理解",
      "回答结构合理",
      "术语使用得当",
      "思路逻辑流畅",
      "知识点覆盖全面",
      "分析中体现了批判性思维",
    ];
    // Return 2-4 random strengths
    const count = 2 + Math.floor(Math.random() * 3);
    return allStrengths.sort(() => Math.random() - 0.5).slice(0, count);
  }

  private generateWeaknesses(): string[] {
    const allWeaknesses = [
      "部分解释细节不足",
      "可以提供更多支撑性例子",
      "分析可以更深入",
      "部分结论缺乏证据支撑",
      "组织结构有待改进",
      "存在少量语法问题",
      "某些要点需要澄清",
      "可以加强批判性分析",
    ];
    // Return 1-3 random weaknesses
    const count = 1 + Math.floor(Math.random() * 3);
    return allWeaknesses.sort(() => Math.random() - 0.5).slice(0, count);
  }

  private generateScore(): number {
    // Generate score between 70 and 95
    return 70 + Math.floor(Math.random() * 26);
  }

  private generateComments(): string {
    return "总体而言，这是一份扎实的提交，体现出对核心概念的理解。若能针对上述问题做一些修改，这份作业可以达到优秀水平。";
  }

  private generateKeyPoints(): string[] {
    return [
      "准确识别了主要概念",
      "例子相关且恰当",
      "结构符合逻辑推进",
      "论点总体上有充分支撑",
    ];
  }

  private generateQuestionAnalysis(): Array<{
    questionNumber: number;
    addressed: boolean;
    quality: "excellent" | "good" | "fair" | "poor";
    notes: string;
  }> {
    return [
      {
        questionNumber: 1,
        addressed: true,
        quality: "good",
        notes: "回答得当，例子恰当",
      },
      {
        questionNumber: 2,
        addressed: true,
        quality: "fair",
        notes: "正确但解释细节不足",
      },
      {
        questionNumber: 3,
        addressed: true,
        quality: "excellent",
        notes: "回答全面、论证充分",
      },
    ];
  }

  private generateImprovements(): string[] {
    return [
      "增加更具体的例子来支撑你的论点",
      "对第 2 题进行更深入的分析",
      "在适用处引用课程材料",
      "澄清各要点之间的联系",
    ];
  }
}

/**
 * Real AI Service using Claude API
 *
 * To use this service, you need:
 * 1. Anthropic API key
 * 2. @anthropic-ai SDK installed
 *
 * Uncomment and configure when ready to use real AI
 */
/*
class ClaudeAIAssistantService implements AIGradingAssistant {
  private apiKey: string;
  private baseURL = "https://api.anthropic.com";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeSubmission(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    // Call Claude API with the submission content
    // Return structured analysis

    const prompt = this.buildAnalysisPrompt(request);

    const response = await fetch(`${this.baseURL}/v1/messages`, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();
    return this.parseAnalysisResponse(data);
  }

  private buildAnalysisPrompt(request: AIAnalysisRequest): string {
    return `You are an AI teaching assistant helping to grade student assignments.

Assignment: ${request.assignmentTitle}
${request.assignmentDescription ? `Description: ${request.assignmentDescription}` : ""}
${request.gradingCriteria ? `Grading Criteria: ${request.gradingCriteria}` : ""}

Please analyze the student's submission and provide:
1. A brief summary of the work
2. Key strengths (3-4 points)
3. Areas needing improvement (2-3 points)
4. Suggested score (0-100)
5. Detailed feedback comments
6. Analysis of each question addressed
7. Specific improvement suggestions
8. Whether resubmission is recommended

Format your response as JSON matching the AIAnalysisResult structure.`;
  }

  private parseAnalysisResponse(data: any): AIAnalysisResult {
    // Parse Claude's response into structured data
    // Implementation depends on response format
    return {} as AIAnalysisResult;
  }
}
*/

// Export singleton instance
export const aiAssistantService = new MockAIAssistantService();

// To use real Claude API:
// export const aiAssistantService = new ClaudeAIAssistantService("your-api-key-here");
