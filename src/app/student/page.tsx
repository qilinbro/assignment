"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Clock3, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/assignment/status-badge";
import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { useAuth } from "@/components/providers/auth-provider";
import { format } from "date-fns";

type Filter = "ALL" | "ACTION" | "COMPLETED";

export default function StudentDashboard() {
  useRequireAuth();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [submissions, setSubmissions] = React.useState<any[]>([]);
  const [assignments, setAssignments] = React.useState<any[]>([]);
  const [filter, setFilter] = React.useState<Filter>("ACTION");

  React.useEffect(() => {
    Promise.all([
      fetch("/api/assignments").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/submissions").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([assignmentData, submissionData]) => {
        setAssignments(Array.isArray(assignmentData) ? assignmentData : []);
        setSubmissions(Array.isArray(submissionData) ? submissionData : []);
      })
      .catch(() => {
        setAssignments([]);
        setSubmissions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getSubmissionFor = React.useCallback(
    (assignmentId: string) => submissions.find((item) => item.assignmentId === assignmentId),
    [submissions]
  );

  const isDeadlinePassed = (deadline: string) => new Date(deadline) < new Date();

  const actionAssignments = React.useMemo(
    () =>
      assignments.filter((assignment) => {
        const submission = getSubmissionFor(assignment.id);
        return !submission || submission.status === "RESUBMISSION_REQUIRED";
      }),
    [assignments, getSubmissionFor]
  );

  const completedAssignments = React.useMemo(
    () =>
      assignments.filter((assignment) => getSubmissionFor(assignment.id)?.status === "COMPLETED"),
    [assignments, getSubmissionFor]
  );

  const visibleAssignments = React.useMemo(() => {
    if (filter === "ACTION") return actionAssignments;
    if (filter === "COMPLETED") return completedAssignments;
    return assignments;
  }, [actionAssignments, assignments, completedAssignments, filter]);

  const resubmissionCount = submissions.filter((item) => item.status === "RESUBMISSION_REQUIRED").length;
  const unsubmittedCount = assignments.filter((assignment) => !getSubmissionFor(assignment.id)).length;
  const actionCount = actionAssignments.length;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b bg-white/90 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">批改坞 · 学生端</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">你好，{user?.name || "同学"}</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            退出
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {loading ? (
          <div className="rounded-xl border bg-white px-6 py-16 text-center dark:bg-slate-900">
            <p className="text-sm text-muted-foreground">正在加载你的作业…</p>
          </div>
        ) : (
          <>
            <section className="mb-6 rounded-2xl border bg-white p-5 shadow-sm dark:bg-slate-900 sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">现在最需要处理</p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight">
                    {actionCount > 0 ? `${actionCount} 份作业等你处理` : "目前没有待处理作业"}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    {resubmissionCount > 0
                      ? `${resubmissionCount} 份作业需要根据反馈重新提交。`
                      : unsubmittedCount > 0
                        ? `${unsubmittedCount} 份作业尚未提交，先完成最近的截止任务。`
                        : "你可以查看已完成作业和助教反馈。"}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600" />已完成 {completedAssignments.length}</span>
                  <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-primary" />共 {assignments.length}</span>
                </div>
              </div>
            </section>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              {([
                ["ACTION", `待处理${actionCount ? ` ${actionCount}` : ""}`],
                ["ALL", "全部"],
                ["COMPLETED", "已完成"],
              ] as const).map(([value, label]) => (
                <Button
                  key={value}
                  size="sm"
                  variant={filter === value ? "default" : "outline"}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </Button>
              ))}
            </div>

            {visibleAssignments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center px-6 py-16 text-center">
                  <CheckCircle2 className="mb-4 h-10 w-10 text-emerald-600" />
                  <h2 className="text-lg font-semibold">{filter === "COMPLETED" ? "还没有已完成的作业" : "这里暂时没有作业"}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">有新的作业或反馈时，它们会显示在这里。</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {visibleAssignments.map((assignment) => {
                  const submission = getSubmissionFor(assignment.id);
                  const deadlinePassed = isDeadlinePassed(assignment.deadline);
                  const needsResubmission = submission?.status === "RESUBMISSION_REQUIRED";
                  const canSubmit = !submission && !deadlinePassed;
                  const actionHref = needsResubmission
                    ? `/assignment/${assignment.id}/resubmit`
                    : `/assignment/${assignment.id}`;
                  const actionLabel = needsResubmission ? "重新提交" : canSubmit ? "去提交" : "查看详情";

                  return (
                    <Card key={assignment.id} className="transition-colors hover:border-primary/40">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate font-semibold">{assignment.title}</h3>
                              {submission ? <StatusBadge status={submission.status} /> : <Badge variant={deadlinePassed ? "destructive" : "outline"}>{deadlinePassed ? "已截止" : "未提交"}</Badge>}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />截止 {format(new Date(assignment.deadline), "MM月dd日 HH:mm")}</span>
                              {submission && <span>提交于 {format(new Date(submission.submittedAt), "MM月dd日 HH:mm")}</span>}
                            </div>
                          </div>
                          <Link href={actionHref} className="shrink-0">
                            <Button variant={needsResubmission || canSubmit ? "default" : "outline"} className="w-full sm:w-auto">
                              {actionLabel}
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
