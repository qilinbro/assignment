"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePreview } from "@/components/submission/image-preview";
import { FileUpload } from "@/components/submission/file-upload";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import type { AIAnalysisResult } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useRequireAuth } from "@/lib/auth/use-require-auth";

const AIAssistant = dynamic(
  () => import("@/components/ta/ai-assistant").then((module) => module.AIAssistant),
  { ssr: false }
);

const enableAIUI = process.env.NEXT_PUBLIC_ENABLE_AI_UI === "true";

export default function TAGradingPage() {
  useRequireAuth();
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [submission, setSubmission] = React.useState<any>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [comment, setComment] = React.useState("");
  const [requireResubmission, setRequireResubmission] = React.useState(false);
  const [feedbackFiles, setFeedbackFiles] = React.useState<File[]>([]);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [taRes, assignRes] = await Promise.all([
          fetch("/api/ta/assignments"),
          fetch("/api/assignments"),
        ]);
        const taList = taRes.ok ? await taRes.json() : [];
        const assignList = assignRes.ok ? await assignRes.json() : [];

        const item = (Array.isArray(taList) ? taList : []).find(
          (a: any) => a.id === params.id
        );
        if (item && item.submission) {
          const assignment = assignList.find(
            (a: any) => a.id === item.submission.assignmentId
          );
          setSubmission({
            id: item.submission.id,
            files: item.submission.files || [],
            submittedAt: item.submission.submittedAt,
            studentId: item.submission.studentId,
            studentName: item.student?.name || `学生 ${item.submission.studentId?.slice(-6) || ""}`,
            assignmentTitle: assignment?.title || "作业",
            assignmentId: item.submission.assignmentId,
            taAssignmentId: item.id,
            status: item.status,
          });
        }
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, [params.id]);

  const handleApplyAIAnalysis = (analysis: AIAnalysisResult) => {
    setComment(analysis.suggestedComments);
    setRequireResubmission(analysis.requiresResubmission);
  };

  const handleSubmit = async () => {
    setError("");
    if (!comment.trim()) {
      setError("请先填写给学生的反馈。");
      return;
    }
    setIsSubmitting(true);
    try {
      // 上传反馈文件（如果有）
      const files = [];
      for (const file of feedbackFiles) {
        const fd = new FormData();
        fd.append("file", file);
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || "上传失败");
        files.push({ url: upData.url, fileName: upData.fileName, fileType: upData.fileType, size: upData.size });
      }
      // 提交批改
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionAssignmentId: params.id, comment, requireResubmission, files }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "批改失败");
      router.push("/ta");
    } catch (e: any) {
      setError(e.message || "批改失败，请稍后重试。");
      setIsSubmitting(false);
    }
  };

  const handleDownload = async () => {
    console.log("Downloading submission files");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">未找到提交记录</p>
            <Button variant="outline" onClick={() => router.push("/ta")}>
              返回控制台
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/ta")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h1 className="text-xl font-bold">批改提交</h1>
                <Badge variant="outline">{submission.assignmentTitle}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {submission.studentName} • 提交于{" "}
                {format(new Date(submission.submittedAt), "yyyy年MM月dd日 HH:mm")}
              </p>
            </div>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              下载文件
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          {/* Left Column - Student Submission */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>学生提交</CardTitle>
                <CardDescription>
                  查看学生上传的作业
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImagePreview files={submission.files || []} />
              </CardContent>
            </Card>

            <div className="rounded-lg border bg-slate-50 p-4 text-sm leading-6 text-muted-foreground dark:bg-slate-900">
              先查看全部文件，再填写具体反馈；只有确实需要修改时才要求重新提交。
            </div>
          </div>

          {/* Middle Column - Grading Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>填写反馈</CardTitle>
                <CardDescription>评语是必填项，反馈文件为可选项。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Comments */}
                <div className="space-y-2">
                  <Label htmlFor="comment">给学生的反馈</Label>
                  <Textarea
                    id="comment"
                    placeholder="请输入给学生的反馈..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">建议包含做得好的地方和下一步改进方向。</p>
                </div>

                {/* Require Resubmission */}
                <div className="space-y-2">
                  <Label>需要学生重新提交吗？</Label>
                  <Select
                    value={requireResubmission ? "yes" : "no"}
                    onValueChange={(value) => setRequireResubmission(value === "yes")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">不需要，反馈已完成</SelectItem>
                      <SelectItem value="yes">需要，修改后再交</SelectItem>
                    </SelectContent>
                  </Select>
                  {requireResubmission && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">学生会看到反馈，并获得重新提交入口。</p>
                  )}
                </div>

                {/* Feedback Files Upload */}
                <div className="space-y-2">
                  <Label>上传反馈文件（可选）</Label>
                  <FileUpload
                    onFilesChange={setFeedbackFiles}
                    maxFiles={5}
                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                    maxSizeMB={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    上传带批注的图片、PDF 或其他反馈文档
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/ta")}
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "提交中..." : "提交批改"}
                  </Button>
                </div>
                {error && (
                  <p className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {enableAIUI && (
          <div className="mt-6 lg:max-w-[calc(56%_-_12px)]">
            <AIAssistant
              submissionId={submission.id}
              assignmentTitle={submission.assignmentTitle}
              studentFiles={submission.files || []}
              onApplyAnalysis={handleApplyAIAnalysis}
            />
          </div>
        )}
      </main>
    </div>
  );
}
