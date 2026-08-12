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

  // Chat state
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
              <CardTitle className="text-lg">AI Grading Assistant</CardTitle>
            </div>
            {!analysis && !isAnalyzing && (
              <Button onClick={handleAnalyze} size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze Submission
              </Button>
            )}
          </div>
          <CardDescription>
            Get AI-powered insights to assist with grading
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-3" />
              <p className="text-sm text-muted-foreground">Analyzing submission...</p>
            </div>
          )}

          {analysis && !chatMode && (
            <div className="space-y-4">
              {/* Summary */}
              <div>
                <h4 className="font-medium mb-2">Summary</h4>
                <p className="text-sm text-muted-foreground">{analysis.summary}</p>
              </div>

              {/* Suggested Score */}
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span className="text-sm font-medium">Suggested Score</span>
                <Badge variant="default" className="text-lg px-3 py-1">
                  {analysis.suggestedScore}/100
                </Badge>
              </div>

              {/* Strengths */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Strengths
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
                  Areas for Improvement
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
                <h4 className="font-medium mb-2">Question-by-Question Analysis</h4>
                <div className="space-y-2">
                  {analysis.questionsAddressed.map((q) => (
                    <div key={q.questionNumber} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium">Question {q.questionNumber}</span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            q.quality === "excellent" || q.quality === "good"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {q.quality}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{q.notes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvement Suggestions */}
              <div>
                <h4 className="font-medium mb-2">Suggested Improvements</h4>
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
                    <strong>AI Recommendation:</strong> This submission may benefit from
                    resubmission to address the identified areas.
                  </p>
                </div>
              )}

              {/* Confidence Score */}
              <div className="text-xs text-muted-foreground">
                Analysis confidence: {Math.round(analysis.confidence * 100)}%
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t">
                <Button onClick={handleApplyAnalysis} variant="default" size="sm">
                  Apply Suggestions
                </Button>
                <Button
                  onClick={() => setChatMode(true)}
                  variant="outline"
                  size="sm"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat with AI
                </Button>
              </div>
            </div>
          )}

          {chatMode && (
            <div className="space-y-4">
              <Button onClick={() => setChatMode(false)} variant="ghost" size="sm">
                ← Back to Analysis
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
                  placeholder="Ask about this submission..."
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
