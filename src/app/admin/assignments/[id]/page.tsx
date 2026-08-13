"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Users, CheckCircle, AlertCircle, FileText, Trash2, Eye, Pencil, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/assignment/status-badge";
import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function AssignmentDetailPage() {
  useRequireAuth();
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [assignment, setAssignment] = React.useState<any>(null);
  const [submissions, setSubmissions] = React.useState<any[]>([]);
  const [userNameMap, setUserNameMap] = React.useState<Record<string, string>>({});
  const [viewingSubmission, setViewingSubmission] = React.useState<any>(null);
  const [viewingFeedback, setViewingFeedback] = React.useState<any[]>([]);
  const [feedbackLoading, setFeedbackLoading] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState({ title: "", description: "", deadline: "", allowResubmission: false, resubmissionDescription: "" });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const id = params.id as string;
    Promise.all([
      fetch(`/api/assignments/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/submissions?assignmentId=${id}`).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/users`).then((r) => (r.ok ? r.json() : { users: [] })),
    ])
      .then(([a, s, u]) => {
        setAssignment(a);
        setSubmissions(Array.isArray(s) ? s : []);
        const map: Record<string, string> = {};
        (u?.users || []).forEach((user: any) => {
          map[user.id] = user.name;
        });
        setUserNameMap(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

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
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">未找到作业</p>
            <Button variant="outline" onClick={() => router.push("/admin")}>
              返回控制台
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const total = submissions.length;
  const completed = submissions.filter((s) => s.status === "COMPLETED").length;
  const pending = submissions.filter(
    (s) => s.status === "PENDING" || s.status === "GRADING"
  ).length;
  const resubmissionReq = submissions.filter(
    (s) => s.status === "RESUBMISSION_REQUIRED"
  ).length;
  const isDeadlinePassed = new Date(assignment.deadline) < new Date();
  const gradingProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/admin")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{assignment.title}</h1>
                {isDeadlinePassed ? (
                  <Badge variant="destructive">已截止</Badge>
                ) : (
                  <Badge variant="default">进行中</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{assignment.id}</p>
            </div>
            <div className="flex gap-2">
            {!isEditing && (
              <Button
                variant="outline"
                onClick={() => {
                  const dl = new Date(assignment.deadline);
                  const localDL = new Date(dl.getTime() - dl.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                  setEditForm({
                    title: assignment.title || "",
                    description: assignment.description || "",
                    deadline: localDL,
                    allowResubmission: assignment.allowResubmission,
                    resubmissionDescription: assignment.resubmissionDescription || "",
                  });
                  setIsEditing(true);
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                编辑
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={async () => {
                if (!confirm("确定要删除此作业吗？所有相关的学生提交和批改记录都会被一并删除。")) return;
                const res = await fetch(`/api/assignments/${params.id}`, { method: "DELETE" });
                if (res.ok) {
                  alert("作业已删除");
                  router.push("/admin");
                } else {
                  alert("删除失败");
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              删除作业
            </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>总提交</CardDescription>
                <CardTitle className="text-3xl">{total}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  学生提交数
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>待批改</CardDescription>
                <CardTitle className="text-3xl">{pending}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  等待批阅
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>已批改</CardDescription>
                <CardTitle className="text-3xl">{completed}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  完成批改
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>需重新提交</CardDescription>
                <CardTitle className="text-3xl">{resubmissionReq}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  需要关注
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 批改进度条 */}
          {total > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">批改进度</span>
                  <span className="text-sm text-muted-foreground">
                    {completed} / {total}（{gradingProgress}%）
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${gradingProgress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* 作业详情 / 编辑表单 */}
          {isEditing ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>编辑作业</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4 mr-1" />取消
                    </Button>
                    <Button size="sm" disabled={saving} onClick={async () => {
                      setSaving(true);
                      try {
                        const res = await fetch(`/api/assignments/${params.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            title: editForm.title,
                            description: editForm.description || null,
                            deadline: new Date(editForm.deadline).toISOString(),
                            allowResubmission: editForm.allowResubmission,
                            resubmissionDescription: editForm.resubmissionDescription || null,
                          }),
                        });
                        if (res.ok) {
                          const updated = await res.json();
                          setAssignment(updated);
                          setIsEditing(false);
                        } else {
                          const data = await res.json();
                          alert(data.error || "保存失败");
                        }
                      } catch { alert("网络错误"); }
                      setSaving(false);
                    }}>
                      <Save className="h-4 w-4 mr-1" />{saving ? "保存中..." : "保存"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>作业标题</Label>
                  <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>作业描述</Label>
                  <Textarea rows={5} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>截止时间</Label>
                  <Input type="datetime-local" value={editForm.deadline} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>允许重新提交</Label>
                  <div className="flex gap-2">
                    <Button size="sm" type="button" variant={editForm.allowResubmission ? "default" : "outline"} onClick={() => setEditForm({ ...editForm, allowResubmission: true })}>是</Button>
                    <Button size="sm" type="button" variant={!editForm.allowResubmission ? "default" : "outline"} onClick={() => setEditForm({ ...editForm, allowResubmission: false })}>否</Button>
                  </div>
                </div>
                {editForm.allowResubmission && (
                  <div className="space-y-2">
                    <Label>重新提交说明</Label>
                    <Textarea rows={2} value={editForm.resubmissionDescription} onChange={(e) => setEditForm({ ...editForm, resubmissionDescription: e.target.value })} />
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>作业详情</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignment.description && (
                  <div>
                    <p className="text-sm font-medium mb-1">作业描述</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {assignment.description}
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">截止时间：</span>
                    <span className={isDeadlinePassed ? "text-destructive font-medium" : ""}>
                      {format(new Date(assignment.deadline), "yyyy年MM月dd日 HH:mm")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">允许重新提交：</span>
                    <span>{assignment.allowResubmission ? "是" : "否"}</span>
                  </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">每份分配助教数：</span>
                  <span>{assignment.taCount} 名</span>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* 提交列表 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>学生提交</CardTitle>
                  <CardDescription>查看所有学生的提交与批改详情</CardDescription>
                </div>
                <Badge variant="secondary">{total} 份提交</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">暂无学生提交</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((s) => (
                    <div key={s.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {userNameMap[s.studentId] || s.studentId.slice(-8)}
                          </span>
                          <StatusBadge status={s.status} />
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{format(new Date(s.submittedAt), "MM月dd日 HH:mm")}</span>
                          <span>{s.files?.length || 0} 个文件</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-1"
                        onClick={async () => {
                          setViewingSubmission(s);
                          setFeedbackLoading(true);
                          setViewingFeedback([]);
                          try {
                            const res = await fetch(`/api/feedback?submissionId=${s.id}`);
                            if (res.ok) {
                              const fb = await res.json();
                              setViewingFeedback(Array.isArray(fb) ? fb : []);
                            }
                          } catch {}
                          setFeedbackLoading(false);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        查看批改
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 批改详情弹窗 */}
          <Dialog open={!!viewingSubmission} onOpenChange={(v) => !v && setViewingSubmission(null)}>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>批改详情</DialogTitle>
                <DialogDescription>
                  {viewingSubmission ? (userNameMap[viewingSubmission.studentId] || viewingSubmission.studentId.slice(-8)) : ""} 的作业批改
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                {feedbackLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-4">加载中...</p>
                ) : viewingFeedback.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">暂无批改评语</p>
                ) : (
                  viewingFeedback.map((fb, i) => {
                    const taName =
                      fb.ta?.name ||
                      userNameMap[fb.submissionAssignment?.taId] ||
                      `助教 ${i + 1}`;
                    return (
                    <div key={fb.id || i} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">{taName}</span>
                        {fb.requireResubmission && (
                          <Badge variant="destructive" className="text-xs">需要重新提交</Badge>
                        )}
                      </div>
                      {fb.comment ? (
                        <p className="text-sm whitespace-pre-line">{fb.comment}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">（无评语）</p>
                      )}
                      {fb.createdAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(fb.createdAt), "yyyy年MM月dd日 HH:mm")}
                        </p>
                      )}
                    </div>
                    );
                  })
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
