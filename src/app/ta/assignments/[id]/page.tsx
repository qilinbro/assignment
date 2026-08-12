"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Star, Upload, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePreview } from "@/components/submission/image-preview";
import { FileUpload } from "@/components/submission/file-upload";
import { Badge } from "@/components/ui/badge";
import { AIAssistant } from "@/components/ta/ai-assistant";
import type { AIAnalysisResult, SubmissionStatus } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

export default function TAGradingPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [submission, setSubmission] = React.useState<any>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [comment, setComment] = React.useState("");
  const [requireResubmission, setRequireResubmission] = React.useState(false);
  const [feedbackFiles, setFeedbackFiles] = React.useState<File[]>([]);

  React.useEffect(() => {
    // TODO: Fetch submission data from API
    // const fetchData = async () => {
    //   const response = await fetch(`/api/submissions/${params.id}`);
    //   const data = await response.json();
    //   setSubmission(data);
    //   setLoading(false);
    // };
    setLoading(false);
  }, [params.id]);

  const handleApplyAIAnalysis = (analysis: AIAnalysisResult) => {
    setComment(analysis.suggestedComments);
    setRequireResubmission(analysis.requiresResubmission);
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      alert("请填写评语");
      return;
    }

    setIsSubmitting(true);

    // TODO: Upload feedback files and submit grading via API
    console.log("Submitting grading:", {
      submissionAssignmentId: params.id,
      comment,
      requireResubmission,
      feedbackFiles: feedbackFiles.length,
    });

    setIsSubmitting(false);
    router.push("/ta");
  };

  const handleDownload = async () => {
    console.log("Downloading submission files");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/ta")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
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

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-6">
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

            <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100 text-base">
                  批改指南
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-900 dark:text-blue-100">
                <ul className="space-y-2">
                  <li>• 仔细审阅所有上传的文件</li>
                  <li>• 提供具体、建设性的反馈</li>
                  <li>• 按作业标准客观评判</li>
                  <li>• 仅在确有必要时才要求重新提交</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Grading Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>提交批改</CardTitle>
                <CardDescription>
                  填写评语并上传反馈文件
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Comments */}
                <div className="space-y-2">
                  <Label htmlFor="comment">批改评语</Label>
                  <Textarea
                    id="comment"
                    placeholder="请输入给学生的反馈..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    具体说明哪些地方做得好、哪些地方需要改进
                  </p>
                </div>

                {/* Require Resubmission */}
                <div className="space-y-2">
                  <Label>是否要求重新提交？</Label>
                  <Select
                    value={requireResubmission ? "yes" : "no"}
                    onValueChange={(value) => setRequireResubmission(value === "yes")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">否，作业合格</SelectItem>
                      <SelectItem value="yes">是，需要修改</SelectItem>
                    </SelectContent>
                  </Select>
                  {requireResubmission && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      学生需要提交修改后的版本
                    </p>
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
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI 助手：可拖动浮动面板，不占布局 */}
        <AIAssistant
          submissionId={submission.id}
          assignmentTitle={submission.assignmentTitle}
          studentFiles={submission.files || []}
          onApplyAnalysis={handleApplyAIAnalysis}
        />
      </main>
    </div>
  );
}
