/**
 * AI 批改助手 — 基于 GLM 视觉模型
 * 分析学生作业图片，自动生成评语
 */

import type {
  AIAnalysisRequest,
  AIAnalysisResult,
  AIChatMessage,
  AIGradingAssistant,
} from "@/types/ai-assistant";
import { prisma } from "@/lib/db";
import { fetchCompressedImageAsBase64 } from "@/lib/ai/compress-image";

const GLM_BASE_URL = process.env.GLM_BASE_URL || "https://open.bigmodel.cn/api/paas/v4";
const GLM_API_KEY = process.env.GLM_API_KEY || "";
const GLM_MODEL = process.env.GLM_MODEL || "glm-4v";

/** 调用 GLM Chat Completions API */
async function callGLM(messages: any[], temperature = 0.7): Promise<string> {
  const response = await fetch(`${GLM_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GLM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GLM_MODEL,
      messages,
      temperature,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("GLM API error:", response.status, errText);
    // 尝试解析 GLM 返回的结构化错误信息
    let detail = "";
    try {
      const errJson = JSON.parse(errText);
      detail = errJson?.error?.message || errJson?.msg || "";
    } catch {}
    throw new Error(
      detail
        ? `AI 服务暂时不可用（${response.status}）：${detail}`
        : `AI 服务暂时不可用（${response.status}）`
    );
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

/** 从文本中提取 JSON */
function extractJSON(text: string): any {
  try { return JSON.parse(text); } catch {}
  const m1 = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m1) { try { return JSON.parse(m1[1].trim()); } catch {} }
  const m2 = text.match(/\{[\s\S]*\}/);
  if (m2) { try { return JSON.parse(m2[0]); } catch {} }
  return null;
}

class GLMAIAssistantService implements AIGradingAssistant {
  async analyzeSubmission(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    const analysisId = `ai-${Date.now()}`;

    // 从数据库获取提交的图片
    const submission = await prisma.submission.findUnique({
      where: { id: request.submissionId },
      include: { files: true },
    });

    if (!submission || submission.files.length === 0) {
      throw new Error("找不到提交的作业文件");
    }

    // 只取第一张可用图片，压缩后发给 GLM（避免多张大图 base64 超限触发 400）
    let imageDataUrl: string | null = null;
    for (const file of submission.files) {
      imageDataUrl = await fetchCompressedImageAsBase64(file.url);
      if (imageDataUrl) break;
    }
    if (!imageDataUrl) {
      throw new Error("作业图片无法加载，AI 暂时无法分析，请手动批改");
    }

    // 构建分析 prompt（单图）
    const content: any[] = [
      {
        type: "text",
        text: `你是一位经验丰富的英语作文批改老师。请仔细分析以下学生提交的英语作业图片（${request.assignmentTitle}），给出专业的批改分析。

请严格以 JSON 格式返回（不要包含 markdown 代码块标记或其他文字）：
{
  "summary": "总体评价（2-3句话）",
  "strengths": ["优点1", "优点2", "优点3"],
  "weaknesses": ["不足1", "不足2"],
  "improvementSuggestions": ["具体改进建议1", "具体改进建议2"],
  "suggestedComments": "给学生的完整评语（100-200字，具体指出做得好的和需要改进的地方）",
  "requiresResubmission": false
}`,
      },
      { type: "image_url", image_url: { url: imageDataUrl } },
    ];

    const raw = await callGLM([{ role: "user", content }], 0.7);
    const parsed = extractJSON(raw);

    return {
      submissionId: request.submissionId,
      analysisId,
      summary: parsed?.summary || "分析完成",
      strengths: Array.isArray(parsed?.strengths) ? parsed.strengths : ["作业已完成"],
      weaknesses: Array.isArray(parsed?.weaknesses) ? parsed.weaknesses : [],
      suggestedScore: 85,
      suggestedComments: parsed?.suggestedComments || raw.slice(0, 500),
      keyPoints: [],
      questionsAddressed: [],
      improvementSuggestions: Array.isArray(parsed?.improvementSuggestions)
        ? parsed.improvementSuggestions
        : [],
      requiresResubmission: parsed?.requiresResubmission || false,
      confidence: 0.85,
      analyzedAt: new Date(),
    };
  }

  async generateFeedback(
    analysis: AIAnalysisResult,
    customInstructions?: string
  ): Promise<string> {
    let feedback = `【AI 批改评语】\n\n${analysis.suggestedComments}\n\n`;
    if (analysis.strengths.length) {
      feedback += `【优点】\n${analysis.strengths.map((s) => `• ${s}`).join("\n")}\n\n`;
    }
    if (analysis.weaknesses.length) {
      feedback += `【待改进】\n${analysis.weaknesses.map((w) => `• ${w}`).join("\n")}\n\n`;
    }
    if (analysis.improvementSuggestions.length) {
      feedback += `【改进建议】\n${analysis.improvementSuggestions.map((s) => `• ${s}`).join("\n")}`;
    }
    if (customInstructions) {
      feedback += `\n\n【补充说明】\n${customInstructions}`;
    }
    return feedback;
  }

  async chatAboutSubmission(
    submissionId: string,
    message: string,
    history: AIChatMessage[]
  ): Promise<string> {
    const messages: any[] = [
      {
        role: "system",
        content:
          "你是一位英语作文批改助手。助教可以就学生的作业提问，你根据作业内容给出专业建议。请用中文简洁回答。",
      },
    ];
    for (const msg of history.slice(-10)) {
      messages.push({ role: msg.role, content: msg.content });
    }
    messages.push({ role: "user", content: message });
    return await callGLM(messages, 0.7);
  }

  async compareSubmissions(submissionIds: string[]): Promise<{
    comparison: string;
    rankings: Array<{ submissionId: string; score: number; notes: string }>;
  }> {
    return {
      comparison: "比较功能暂未开放",
      rankings: submissionIds.map((id, i) => ({
        submissionId: id,
        score: 90 - i * 10,
        notes: "",
      })),
    };
  }
}

export const aiAssistantService = new GLMAIAssistantService();
