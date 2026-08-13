"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/submission/file-upload";
import { ImagePreview } from "@/components/submission/image-preview";
import { format } from "date-fns";
import { useRequireAuth } from "@/lib/auth/use-require-auth";

export default function ResubmissionPage() {
  useRequireAuth();
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [assignment, setAssignment] = React.useState<any>(null);
  const [submission, setSubmission] = React.useState<any>(null);
  const [feedback, setFeedback] = React.useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
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
            setFeedback(Array.isArray(feedbackData) ? feedbackData : []);
          }
        }
      } catch {
        setError("暂时无法加载这份作业，请稍后重试。");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!submission) return setError("找不到原始提交记录。");
    if (uploadedFiles.length === 0) return setError("请至少上传一个修改后的文件。");
    if (!reason.trim()) return setError("请简要说明你做了哪些修改。");

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

      const res = await fetch("/api/resubmissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: submission.id, reason: reason.trim(), files }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "重新提交失败");
      setSuccess("已提交修改版本，助教会重新查看。正在返回作业详情…");
      window.setTimeout(() => router.push(`/assignment/${params.id}`), 900);
    } catch (e: any) {
      setError(e.message || "重新提交失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950"><p className="text-sm text-muted-foreground">正在加载重交要求…</p></div>;
  }

  if (!assignment || !submission) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <Card className="w-full max-w-md"><CardContent className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-amber-600" />
          <h1 className="text-lg font-semibold">暂时无法开始重新提交</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error || "未找到作业或原始提交记录。"}</p>
          <Button className="mt-5" variant="outline" onClick={() => router.push("/student")}>返回作业列表</Button>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b bg-white/90 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/assignment/${params.id}`)} aria-label="返回作业详情"><ArrowLeft className="h-4 w-4" /></Button>
          <div className="min-w-0"><p className="text-xs text-muted-foreground">重新提交</p><h1 className="truncate text-xl font-bold">{assignment.title}</h1></div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
        <Card className="border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/20">
          <CardContent className="flex gap-3 p-5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div><h2 className="font-semibold text-amber-950 dark:text-amber-100">请根据反馈修改后重新提交</h2><p className="mt-1 text-sm leading-6 text-amber-900/75 dark:text-amber-200/80">原始提交于 {format(new Date(submission.submittedAt), "yyyy年MM月dd日 HH:mm")}，原记录会被完整保留。</p></div>
          </CardContent>
        </Card>

        {feedback.length > 0 && <Card><CardHeader><CardTitle className="text-lg">助教反馈</CardTitle></CardHeader><CardContent className="space-y-3">
          {feedback.map((item, index) => <div key={item.id || index} className="rounded-lg border bg-slate-50/70 p-4 dark:bg-slate-900/60"><div className="mb-2 flex flex-wrap items-center gap-2"><Badge variant="outline">助教 {index + 1}</Badge>{item.score !== undefined && <span className="text-sm text-muted-foreground">分数 {item.score}</span>}</div><p className="whitespace-pre-line text-sm leading-6">{item.comment || "请查看附件中的批注。"}</p></div>)}
        </CardContent></Card>}

        {assignment.resubmissionDescription && <Card><CardHeader><CardTitle className="text-lg">重新提交要求</CardTitle></CardHeader><CardContent><p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">{assignment.resubmissionDescription}</p></CardContent></Card>}

        {submission.files?.length > 0 && <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5" />原始提交</CardTitle></CardHeader><CardContent><ImagePreview files={submission.files} /></CardContent></Card>}

        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><RefreshCw className="h-5 w-5" />上传修改后的作业</CardTitle></CardHeader><CardContent className="space-y-5">
          <FileUpload onFilesChange={setUploadedFiles} maxFiles={10} accept="image/jpeg,image/jpg,image/png,image/webp" maxSizeMB={10} />
          <div><label htmlFor="resubmission-reason" className="mb-2 block text-sm font-medium">修改说明</label><Textarea id="resubmission-reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="简要说明你根据反馈做了哪些修改" rows={4} /></div>
          {error && <p className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"><AlertCircle className="h-4 w-4" />{error}</p>}
          {success && <p className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"><CheckCircle2 className="h-4 w-4" />{success}</p>}
          <Button className="w-full" size="lg" onClick={handleSubmit} disabled={isSubmitting || !!success}>{isSubmitting ? "提交中…" : "提交修改版本"}</Button>
        </CardContent></Card>
      </main>
    </div>
  );
}
