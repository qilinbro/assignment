"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, Calendar, User, FileText, CheckCircle, AlertCircle, Download, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/submission/file-upload";
import { ImagePreview } from "@/components/submission/image-preview";
import { StatusBadge } from "@/components/assignment/status-badge";
import { format } from "date-fns";
import { useRequireAuth } from "@/lib/auth/use-require-auth";

export default function AssignmentPage() {
  useRequireAuth();
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [assignment, setAssignment] = React.useState<any>(null);
  const [submission, setSubmission] = React.useState<any>(null);
  const [feedbackList, setFeedbackList] = React.useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      const [assignmentRes, submissionsRes] = await Promise.all([
        fetch(`/api/assignments/${params.id}`),
        fetch("/api/submissions"),
      ]);
      const assignmentData = assignmentRes.ok ? await assignmentRes.json() : null;
      const submissions = submissionsRes.ok ? await submissionsRes.json() : [];
      const current = (Array.isArray(submissions) ? submissions : []).find((item: any) => item.assignmentId === params.id);
      setAssignment(assignmentData);
      setSubmission(current || null);
      if (current) {
        const feedbackRes = await fetch(`/api/feedback?submissionId=${current.id}`);
        if (feedbackRes.ok) {
          const feedbackData = await feedbackRes.json();
          setFeedbackList(Array.isArray(feedbackData) ? feedbackData : []);
        }
      }
    } catch {
      setError("暂时无法加载作业，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (uploadedFiles.length === 0) {
      setError("请至少上传一个作业文件。");
      return;
    }

    setIsSubmitting(true);
    try {
      const files = [];
      for (const file of uploadedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "文件上传失败");
        files.push({ url: uploadData.url, fileName: uploadData.fileName, fileType: uploadData.fileType, size: uploadData.size });
      }

      const submitRes = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId: params.id, files }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData.error || "提交失败");
      setSubmission(submitData);
      setUploadedFiles([]);
      setSuccess("作业已提交，等待助教批改。你可以在这里查看最新状态。");
    } catch (submitError: any) {
      setError(submitError.message || "提交失败，请稍后重试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950"><p className="text-sm text-muted-foreground">正在加载作业…</p></div>;
  }

  if (!assignment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <Card className="w-full max-w-md"><CardContent className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-amber-600" />
          <p className="text-sm text-muted-foreground">{error || "未找到作业。"}</p>
          <Button className="mt-5" variant="outline" onClick={() => router.push("/student")}>返回作业列表</Button>
        </CardContent></Card>
      </div>
    );
  }

  const isDeadlinePassed = new Date(assignment.deadline) < new Date();
  const hasSubmitted = !!submission;
  const needsResubmission = submission?.status === "RESUBMISSION_REQUIRED";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b bg-white/90 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/student")} aria-label="返回作业列表"><ArrowLeft className="h-4 w-4" /></Button>
          <div className="min-w-0 flex-1"><p className="text-xs text-muted-foreground">作业</p><h1 className="truncate text-xl font-bold">{assignment.title}</h1></div>
          {hasSubmitted ? <StatusBadge status={submission.status} /> : <Badge variant={isDeadlinePassed ? "destructive" : "outline"}>{isDeadlinePassed ? "已截止" : "未提交"}</Badge>}
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
        <Card>
          <CardHeader>
            <CardTitle>作业要求</CardTitle>
            <CardDescription>先确认要求，再上传文件。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="whitespace-pre-line text-sm leading-7">{assignment.description}</p>
            <div className="flex flex-col gap-2 border-t pt-4 text-sm sm:flex-row sm:items-center sm:gap-5">
              <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" />截止 {format(new Date(assignment.deadline), "yyyy年MM月dd日 HH:mm")}</span>
              <span className="inline-flex items-center gap-2 text-muted-foreground"><Clock3 className="h-4 w-4" />{assignment.allowResubmission ? "允许重新提交" : "不允许重新提交"}</span>
            </div>
          </CardContent>
        </Card>

        {!hasSubmitted && !isDeadlinePassed && (
          <Card>
            <CardHeader><CardTitle>提交作业</CardTitle><CardDescription>支持 JPG、PNG、WEBP，每个文件不超过 10MB。</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              <FileUpload onFilesChange={setUploadedFiles} maxFiles={10} accept="image/jpeg,image/jpg,image/png,image/webp" maxSizeMB={10} />
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-muted-foreground dark:bg-slate-900">请确保图片清晰、页面完整，并在提交前检查文件顺序。</p>
              {error && <p className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"><AlertCircle className="h-4 w-4" />{error}</p>}
              <Button onClick={handleSubmit} disabled={isSubmitting || uploadedFiles.length === 0} className="w-full" size="lg">{isSubmitting ? "提交中…" : "提交作业"}</Button>
            </CardContent>
          </Card>
        )}

          {/* Deadline Passed Message */}
          {!hasSubmitted && isDeadlinePassed && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-amber-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                      提交截止时间已过
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      本作业的提交期已结束，不再接受正常提交。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 批改结果（学生查看助教评语） */}
          {hasSubmitted && feedbackList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>批改结果</CardTitle>
                <CardDescription>{feedbackList.length} 名助教的评语</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedbackList.map((fb, i) => (
                    <div key={fb.id || i} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">助教 {i + 1}</span>
                        {fb.requireResubmission && (
                          <Badge variant="destructive" className="text-xs">需要重新提交</Badge>
                        )}
                      </div>
                      {fb.comment && (
                        <p className="text-sm whitespace-pre-line">{fb.comment}</p>
                      )}

                      {/* 助教上传的反馈文件（批注图片/PDF） */}
                      {(() => {
                        const files: any[] = Array.isArray(fb.files) ? fb.files : [];
                        if (files.length === 0) return null;
                        const imageFiles = files.filter((f) =>
                          (f.fileType || "").startsWith("image/")
                        );
                        const otherFiles = files.filter(
                          (f) => !(f.fileType || "").startsWith("image/")
                        );
                        return (
                          <div className="mt-3 space-y-3">
                            {imageFiles.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                  <Paperclip className="h-3 w-3" />
                                  助教反馈图片（{imageFiles.length}）
                                </p>
                                <ImagePreview files={imageFiles} />
                              </div>
                            )}
                            {otherFiles.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                  <Paperclip className="h-3 w-3" />
                                  助教反馈文件（{otherFiles.length}）
                                </p>
                                <div className="space-y-1.5">
                                  {otherFiles.map((f) => (
                                    <a
                                      key={f.id}
                                      href={f.url}
                                      download={f.fileName}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-sm p-2 rounded-md border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                      <span className="flex-1 truncate">{f.fileName}</span>
                                      <Download className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {fb.createdAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(fb.createdAt), "yyyy年MM月dd日 HH:mm")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {hasSubmitted && feedbackList.length === 0 && submission.status !== "COMPLETED" && <Card><CardContent className="flex items-center gap-3 p-5"><Clock3 className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">作业已提交，等待助教批改中。</p></CardContent></Card>}

        {needsResubmission && assignment.allowResubmission && <Button className="w-full sm:w-auto" onClick={() => router.push(`/assignment/${params.id}/resubmit`)}>根据反馈重新提交</Button>}
      </main>
    </div>
  );
}
