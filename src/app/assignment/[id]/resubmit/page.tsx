"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/submission/file-upload";
import { StatusBadge } from "@/components/assignment/status-badge";
import { format } from "date-fns";
import type { SubmissionStatus } from "@/types";

export default function ResubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [assignment, setAssignment] = React.useState<any>(null);
  const [submission, setSubmission] = React.useState<any>(null);
  const [feedback, setFeedback] = React.useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [resubmissionReason, setResubmissionReason] = React.useState("");

  React.useEffect(() => {
    // TODO: Fetch data from API
    setLoading(false);
  }, [params.id]);

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      alert("请至少上传一个文件");
      return;
    }
    if (!resubmissionReason.trim()) {
      alert("请填写重新提交的原因");
      return;
    }
    setIsSubmitting(true);
    try {
      // 获取当前学生的提交记录，找到 submissionId
      const mySubsRes = await fetch("/api/submissions");
      const mySubs = await mySubsRes.json();
      const mySub = (Array.isArray(mySubs) ? mySubs : []).find(
        (s: any) => s.assignmentId === params.id
      );
      if (!mySub) {
        alert("找不到原始提交记录");
        setIsSubmitting(false);
        return;
      }
      // 上传文件
      const files = [];
      for (const file of uploadedFiles) {
        const fd = new FormData();
        fd.append("file", file);
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || "上传失败");
        files.push({ url: upData.url, fileName: upData.fileName, fileType: upData.fileType, size: upData.size });
      }
      // 创建重新提交
      const res = await fetch("/api/resubmissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: mySub.id, reason: resubmissionReason, files }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "重新提交失败");
      router.push(`/assignment/${params.id}`);
    } catch (e: any) {
      alert(e.message || "重新提交失败");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">作业不存在</h2>
              <p className="text-sm text-muted-foreground mb-4">
                无法找到该作业。
              </p>
              <Button onClick={() => router.push("/")}>返回首页</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assignment.allowResubmission) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">不允许重新提交</h2>
              <p className="text-sm text-muted-foreground mb-4">
                本作业不允许重新提交。
              </p>
              <Button onClick={() => router.push("/")}>返回首页</Button>
            </div>
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
              onClick={() => router.push(`/assignment/${params.id}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <Badge variant="outline" className="mb-2">重新提交</Badge>
              <h1 className="text-2xl font-bold">{assignment.title}</h1>
              <p className="text-sm text-muted-foreground">{assignment.id}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Original Submission Info */}
          {submission && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-amber-600 mt-1" />
                  <div>
                    <CardTitle className="text-amber-900 dark:text-amber-100">
                      需要重新提交
                    </CardTitle>
                    <CardDescription className="text-amber-700 dark:text-amber-300">
                      根据助教反馈，你的原始提交需要修改
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">原始提交：</p>
                  <p className="font-medium">
                    {format(new Date(submission.submittedAt), "yyyy年MM月dd日 HH:mm")}
                  </p>
                </div>

                {feedback.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">助教反馈：</p>
                    {feedback.map((fb) => (
                      <div key={fb.taId} className="border rounded-lg p-3 bg-background">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{fb.taName}</span>
                          <Badge variant="outline" className="text-sm">
                            分数：{fb.score}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{fb.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                {assignment.resubmissionDescription && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">重新提交说明：</p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.resubmissionDescription}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Resubmission Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                提交重新提交
              </CardTitle>
              <CardDescription>
                上传修改后的作业并说明所做的改动
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Reason for Resubmission */}
                <div className="space-y-2">
                  <Label htmlFor="reason">重新提交原因 *</Label>
                  <Textarea
                    id="reason"
                    placeholder="请说明你根据助教反馈做了哪些修改..."
                    value={resubmissionReason}
                    onChange={(e) => setResubmissionReason(e.target.value)}
                    rows={4}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    请描述你如何回应助教的意见以及做了哪些修改
                  </p>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label>上传修改后的作业 *</Label>
                  <FileUpload
                    onFilesChange={setUploadedFiles}
                    maxFiles={10}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    maxSizeMB={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    上传修改后的作业文件（JPG、PNG、WEBP - 每个不超过 10MB）
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || uploadedFiles.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? "提交中..." : "提交重新提交"}
                </Button>

                {/* Notice */}
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>注意：</strong>你的重新提交将由批改原始提交的同一批助教进行复审。原始提交和反馈将在系统历史中保留。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
