"use client";

import * as React from "react";
import { Sparkles, MessageSquare, Send, Loader2, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  const [errorMsg, setErrorMsg] = React.useState("");
  const [customInstructions, setCustomInstructions] = React.useState("");
  const [isGeneratingFeedback, setIsGeneratingFeedback] = React.useState(false);
  const [generatedFeedback, setGeneratedFeedback] = React.useState("");

  // 聊天状态
  const [chatMode, setChatMode] = React.useState(false);
  const [chatMessage, setChatMessage] = React.useState("");
  const [isChatting, setIsChatting] = React.useState(false);
  const [chatHistory, setChatHistory] = React.useState<AIChatMessage[]>([]);

  // 浮动面板状态
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);
  const [collapsed, setCollapsed] = React.useState(true);
  const [dragging, setDragging] = React.useState(false);
  const dragStart = React.useRef<{ dx: number; dy: number } | null>(null);

  // 初始化默认位置（右上角）
  React.useEffect(() => {
    if (pos === null) {
      setPos({ x: window.innerWidth - 360, y: 96 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos]);

  // 拖拽中监听全局鼠标事件
  React.useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      if (!dragStart.current) return;
      setPos({
        x: e.clientX - dragStart.current.dx,
        y: e.clientY - dragStart.current.dy,
      });
    };
    const onUp = () => {
      setDragging(false);
      dragStart.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  const onHandleMouseDown = (e: React.MouseEvent) => {
    if (!pos) return;
    dragStart.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    setDragging(true);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    setErrorMsg("");

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
      if (!response.ok) {
        setErrorMsg(result.error || "分析失败，请稍后重试");
        return;
      }
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      setErrorMsg("网络错误，请稍后重试");
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
    <div
      className="fixed z-50 w-[340px] max-w-[calc(100vw-32px)] print:hidden"
      style={pos ? { left: pos.x, top: pos.y } : { right: 24, top: 96 }}
    >
      <Card className="border-purple-200 dark:border-purple-800 shadow-2xl">
        {/* 拖拽手柄 */}
        <div
          onMouseDown={onHandleMouseDown}
          className="flex items-center justify-between px-3 py-2 cursor-move border-b bg-purple-50/60 dark:bg-purple-900/20 select-none rounded-t-lg"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-sm">AI 批改助手</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "展开" : "收起"}
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>

        {/* 展开内容 */}
        {!collapsed && (
          <CardContent className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
            {/* 分析按钮（未分析时） */}
            {!analysis && !isAnalyzing && (
              <Button onClick={handleAnalyze} size="sm" className="w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                分析提交
              </Button>
            )}

            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600 mb-2" />
                <p className="text-sm text-muted-foreground">正在分析提交...</p>
              </div>
            )}

            {errorMsg && !isAnalyzing && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            {analysis && !chatMode && (
              <div className="space-y-3">
                {/* Summary */}
                <div>
                  <h4 className="font-medium mb-1 text-sm">摘要</h4>
                  <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                </div>

                {/* Strengths */}
                <div>
                  <h4 className="font-medium mb-1 text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    优点
                  </h4>
                  <ul className="space-y-1">
                    {(analysis.strengths || []).map((strength, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div>
                  <h4 className="font-medium mb-1 text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    待改进之处
                  </h4>
                  <ul className="space-y-1">
                    {(analysis.weaknesses || []).map((weakness, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">!</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Question Analysis */}
                <div>
                  <h4 className="font-medium mb-1 text-sm">逐题分析</h4>
                  <div className="space-y-2">
                    {(analysis.questionsAddressed || []).map((q) => (
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
                  <h4 className="font-medium mb-1 text-sm">改进建议</h4>
                  <ul className="space-y-1">
                    {(analysis.improvementSuggestions || []).map((suggestion, i) => (
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
              <div className="space-y-3">
                <Button onClick={() => setChatMode(false)} variant="ghost" size="sm">
                  ← 返回分析
                </Button>

                {/* Chat Messages */}
                <div className="h-56 overflow-y-auto space-y-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  {chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-2 rounded-lg ${
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
                      <div className="bg-white dark:bg-slate-800 border p-2 rounded-lg">
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
        )}
      </Card>
    </div>
  );
}
