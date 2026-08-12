"use client";

import * as React from "react";
import { Sparkles, MessageSquare, Send, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AIAnalysisResult, AIChatMessage } from "@/types";
import { format } from "date-fns";

// 质量等级标签映射
const QUALITY_LABELS: Record<string, string> = {
  excellent: "优秀",
  good: "良好",
  fair: "一般",
  poor: "较差",
};

interface AIAssistantProps {
  submissionId: string;
  assignmentTitle: string;
  assignmentDescription?: string;
  studentFiles: Array<{
    id: string;
    fileName: string;
  }>;
  onApplyAnalysis?: (analysis: AIAnalysisResult) => void;
}

export function AIAssistant({
  submissionId,
  assignmentTitle,
  assignmentDescription,
  studentFiles,
  onApplyAnalysis,
}: AIAssistantProps) {
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<AIAnalysisResult | null>(null);
  const [customInstructions, setCustomInstructions] = React.useState("");
  const [isGeneratingFeedback, setIsGeneratingFeedback] = React.useState(false);
  const [generatedFeedback, setGeneratedFeedback] = React.useState("");

  // 聊天状态
  const [chatMode, setChatMode] = React.useState(false);
  const [chatMessage, setChatMessage] = React.useState("");
  const [isChatting, setIsChatting] = React.useState(false);
  const [chatHistory, setChatHistory] = React.useState<AIChatMessage[]>([]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          assignmentTitle,
          assignmentDescription,
          studentFiles,
        }),
      });

      const result = await response.json();
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateFeedback = async () => {
    if (!analysis) return;

    setIsGeneratingFeedback(true);
    try {
      const response = await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis,
          customInstructions,
        }),
      });

      const result = await response.json();
      setGeneratedFeedback(result.feedback);
    } catch (error) {
      console.error("Feedback generation failed:", error);
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const handleApplyAnalysis = () => {
    if (analysis && onApplyAnalysis) {
      onApplyAnalysis(analysis);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const newMessage: AIChatMessage = {
      role: "user",
      content: chatMessage,
      timestamp: new Date(),
    };

    const updatedHistory = [...chatHistory, newMessage];
    setChatHistory(updatedHistory);
    setChatMessage("");
    setIsChatting(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          message: chatMessage,
          history: updatedHistory,
        }),
      });

      const result = await response.json();

      setChatHistory([
        ...updatedHistory,
        {
          role: "assistant",
          content: result.response,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Chat failed:", error);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Analysis Card */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">AI 批改助手</CardTitle>
            </div>
            {!analysis && !isAnalyzing && (
              <Button onClick={handleAnalyze} size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                分析提交
              </Button>
            )}
          </div>
          <CardDescription>
            获取 AI 洞察以辅助批改
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-3" />
              <p className="text-sm text-muted-foreground">正在分析提交...</p>
            </div>
          )}

          {analysis && !chatMode && (
            <div className="space-y-4">
              {/* Summary */}
              <div>
                <h4 className="font-medium mb-2">摘要</h4>
                <p className="text-sm text-muted-foreground">{analysis.summary}</p>
              </div>

              {/* Strengths */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  优点
                </h4>
                <ul className="space-y-1">
                  {analysis.strengths.map((strength, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  待改进之处
                </h4>
                <ul className="space-y-1">
                  {analysis.weaknesses.map((weakness, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">!</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Question Analysis */}
              <div>
                <h4 className="font-medium mb-2">逐题分析</h4>
                <div className="space-y-2">
                  {analysis.questionsAddressed.map((q) => (
                    <div key={q.questionNumber} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium">第 {q.questionNumber} 题</span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            q.quality === "excellent" || q.quality === "good"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {QUALITY_LABELS[q.quality] ?? q.quality}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{q.notes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvement Suggestions */}
              <div>
                <h4 className="font-medium mb-2">改进建议</h4>
                <ul className="space-y-1">
                  {analysis.improvementSuggestions.map((suggestion, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">→</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resubmission Recommendation */}
              {analysis.requiresResubmission && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    <strong>AI 建议：</strong>本提交可能需要重新提交，以改进上述指出的方面。
                  </p>
                </div>
              )}

              {/* Confidence Score */}
              <div className="text-xs text-muted-foreground">
                分析置信度：{Math.round(analysis.confidence * 100)}%
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t">
                <Button onClick={handleApplyAnalysis} variant="default" size="sm">
                  应用建议
                </Button>
                <Button
                  onClick={() => setChatMode(true)}
                  variant="outline"
                  size="sm"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  与 AI 对话
                </Button>
              </div>
            </div>
          )}

          {chatMode && (
            <div className="space-y-4">
              <Button onClick={() => setChatMode(false)} variant="ghost" size="sm">
                ← 返回分析
              </Button>

              {/* Chat Messages */}
              <div className="h-64 overflow-y-auto space-y-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === "user"
                          ? "bg-purple-600 text-white"
                          : "bg-white dark:bg-slate-800 border"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {format(new Date(msg.timestamp), "HH:mm")}
                      </p>
                    </div>
                  </div>
                ))}
                {isChatting && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 border p-3 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="就本提交提问..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} size="icon" disabled={isChatting}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
