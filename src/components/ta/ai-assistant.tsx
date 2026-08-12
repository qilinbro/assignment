"use client";

import * as React from "react";
import {
  Sparkles,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AIAnalysisResult } from "@/types";

interface AIAssistantProps {
  submissionId: string;
  assignmentTitle: string;
  studentFiles: Array<{
    id: string;
    fileName: string;
  }>;
  onApplyAnalysis?: (analysis: AIAnalysisResult) => void;
}

export function AIAssistant({
  submissionId,
  assignmentTitle,
  studentFiles,
  onApplyAnalysis,
}: AIAssistantProps) {
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<AIAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = React.useState("");

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

  const handleApplyAnalysis = () => {
    if (analysis && onApplyAnalysis) {
      onApplyAnalysis(analysis);
      setCollapsed(true);
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
            {/* 主操作按钮：分析 / 重新分析 */}
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  正在分析提交...
                </>
              ) : analysis ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  重新分析
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  开始智能分析
                </>
              )}
            </Button>

            {errorMsg && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {analysis && (
              <div className="space-y-3">
                {/* Summary */}
                <div>
                  <h4 className="font-medium mb-1 text-sm">摘要</h4>
                  <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                </div>

                {/* Strengths */}
                {analysis.strengths?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-1 text-sm flex items-center gap-2">
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
                )}

                {/* Weaknesses */}
                {analysis.weaknesses?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-1 text-sm flex items-center gap-2">
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
                )}

                {/* Improvement Suggestions */}
                {analysis.improvementSuggestions?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-1 text-sm">改进建议</h4>
                    <ul className="space-y-1">
                      {analysis.improvementSuggestions.map((suggestion, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-purple-600 mt-0.5">→</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Resubmission Recommendation */}
                {analysis.requiresResubmission && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      <strong>AI 建议：</strong>本提交可能需要重新提交，以改进上述指出的方面。
                    </p>
                  </div>
                )}

                {/* Apply Button */}
                <Button
                  onClick={handleApplyAnalysis}
                  variant="default"
                  size="sm"
                  className="w-full"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  应用 AI 评语到批改
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
