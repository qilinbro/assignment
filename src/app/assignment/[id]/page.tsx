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

export default function AssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [assignment, setAssignment] = React.useState<any>(null);
  const [submission, setSubmission] = React.useState<any>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [feedbackList, setFeedbackList] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取作业详情
        const assignRes = await fetch(`/api/assignments/${params.id}`);
        if (assignRes.ok) setAssignment(await assignRes.json());

        // 获取当前学生的提交记录，找到这份作业的提交
        const subRes = await fetch("/api/submissions");
        const allSubs = await subRes.json();
        const mySub = (Array.isArray(allSubs) ? allSubs : []).find(
          (s: any) => s.assignmentId === params.id
        );
        if (mySub) {
          setSubmission(mySub);
          // 如果有提交，获取批改反馈
          const fbRes = await fetch(`/api/feedback?submissionId=${mySub.id}`);
          if (fbRes.ok) {
            const fb = await fbRes.json();
            setFeedbackList(Array.isArray(fb) ? fb : []);
          }
        }
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, [params.id]);

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      alert("请至少上传一个文件");
      return;
    }
    setIsSubmitting(true);
    try {
      // 上传文件到服务器
      const files = [];
      for (const file of uploadedFiles) {
        const fd = new FormData();
        fd.append("file", file);
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || "上传失败");
        files.push({ url: upData.url, fileName: upData.fileName, fileType: upData.fileType, size: upData.size });
      }
      // 创建提交
      const subRes = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId: params.id, files }),
      });
      const subData = await subRes.json();
      if (!subRes.ok) throw new Error(subData.error || "提交失败");
      setSubmission(subData);
    } catch (e: any) {
      alert(e.message || "提交失败");
    }
    setIsSubmitting(false);
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
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">未找到作业</p>
            <Button variant="outline" onClick={() => router.push("/")}>
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isDeadlinePassed = new Date(assignment.deadline) < new Date();
  const hasSubmitted = !!submission;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline" className="mb-2">作业</Badge>
              <h1 className="text-2xl font-bold">{assignment.title}</h1>
              <p className="text-sm text-muted-foreground">{assignment.id}</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/")}>
              返回首页
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Assignment Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>作业详情</CardTitle>
                  <CardDescription>提交前请先查看作业要求</CardDescription>
                </div>
                {hasSubmitted ? (
                  <StatusBadge status={submission?.status} />
                ) : isDeadlinePassed ? (
                  <Badge variant="destructive">已截止</Badge>
                ) : (
                  <Badge variant="default">进行中</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-line">{assignment.description}</p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">截止时间：</span>
                  <span className={isDeadlinePassed ? "text-destructive font-medium" : ""}>
                    {format(new Date(assignment.deadline), "yyyy年MM月dd日 HH:mm")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {assignment.allowResubmission ? "允许重新提交" : "不允许重新提交"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Form */}
          {!hasSubmitted && !isDeadlinePassed && (
            <Card>
              <CardHeader>
                <CardTitle>提交作业</CardTitle>
                <CardDescription>
                  上传你的作业文件（JPG、PNG、WEBP - 每个不超过 10MB）
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <FileUpload
                    onFilesChange={setUploadedFiles}
                    maxFiles={10}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    maxSizeMB={10}
                  />

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">提交须知：</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 确保所有图片清晰可读</li>
                      <li>• 拍照时注意光线充足</li>
                      <li>• 包含作业的所有页面</li>
                      <li>• 提交前请仔细检查</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || uploadedFiles.length === 0}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? "提交中..." : "提交作业"}
                  </Button>
                </div>
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

          {/* 已提交但未批改 */}
          {hasSubmitted && feedbackList.length === 0 && submission?.status !== "COMPLETED" && (
            <Card>
              <CardContent className="py-8 text-center">
                <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  作业已提交，等待助教批改中…
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
