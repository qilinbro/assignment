"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3, LogOut, SlidersHorizontal } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/assignment/status-badge";
import { useAuth } from "@/components/providers/auth-provider";
import { useRequireAuth } from "@/lib/auth/use-require-auth";
import type { SubmissionStatus } from "@/types/submission";

type Filter = "ACTION" | "ALL" | "COMPLETED";

type GradingTask = {
  id: string;
  status: SubmissionStatus;
  submission?: {
    assignmentId?: string;
    studentId?: string;
    submittedAt?: string | Date;
  } | null;
  student?: {
    name?: string | null;
  } | null;
};

export default function TADashboard() {
  useRequireAuth();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [assignments, setAssignments] = React.useState<GradingTask[]>([]);
  const [assignmentTitles, setAssignmentTitles] = React.useState<Record<string, string>>({});
  const [filter, setFilter] = React.useState<Filter>("ACTION");

  React.useEffect(() => {
    Promise.all([
      fetch("/api/ta/assignments").then((response) => (response.ok ? response.json() : [])),
      fetch("/api/assignments").then((response) => (response.ok ? response.json() : [])),
    ])
      .then(([taskData, assignmentData]) => {
        setAssignments(Array.isArray(taskData) ? taskData : []);

        if (Array.isArray(assignmentData)) {
          const titles: Record<string, string> = {};
          assignmentData.forEach((assignment) => {
            if (assignment?.id && assignment?.title) {
              titles[assignment.id] = assignment.title;
            }
          });
          setAssignmentTitles(titles);
        }
      })
      .catch(() => {
        setAssignments([]);
        setAssignmentTitles({});
      })
      .finally(() => setLoading(false));
  }, []);

  const pending = assignments.filter(
    (assignment) => assignment.status === "PENDING" || assignment.status === "GRADING"
  );
  const completed = assignments.filter((assignment) => assignment.status === "COMPLETED");
  const visibleAssignments =
    filter === "ACTION" ? pending : filter === "COMPLETED" ? completed : assignments;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getStudentName = (assignment: GradingTask) =>
    assignment.student?.name ||
    (assignment.submission?.studentId ? `学生 ${assignment.submission.studentId.slice(-6)}` : "未知学生");

  const getAssignmentTitle = (assignment: GradingTask) =>
    (assignment.submission?.assignmentId && assignmentTitles[assignment.submission.assignmentId]) || "作业提交";

  const getSubmissionTime = (assignment: GradingTask) => {
    if (!assignment.submission?.submittedAt) return "提交时间未知";
    return `提交于 ${format(new Date(assignment.submission.submittedAt), "MM月dd日 HH:mm")}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b bg-white/90 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">批改坞 · 助教端</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">今天先完成批改</h1>
          </div>
          <div className="flex items-center gap-3">
            {user && <Badge variant="outline" className="hidden sm:inline-flex">{user.name}</Badge>}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              退出
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {loading ? (
          <div className="rounded-xl border bg-white px-6 py-16 text-center dark:bg-slate-900">
            <p className="text-sm text-muted-foreground">正在加载分配给你的提交…</p>
          </div>
        ) : (
          <>
            <section className="mb-6 rounded-2xl border bg-white p-5 shadow-sm dark:bg-slate-900 sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">待处理队列</p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight">
                    {pending.length > 0 ? `${pending.length} 份提交等待批改` : "当前没有待批改提交"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {pending.length > 0 ? "从第一份开始，完成后返回这里继续下一份。" : "新的学生提交会自动出现在这里。"}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4 text-primary" />
                    待处理 {pending.length}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    已完成 {completed.length}
                  </span>
                </div>
              </div>
            </section>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <SlidersHorizontal className="mr-1 h-4 w-4 text-muted-foreground" />
              {([
                ["ACTION", `待处理${pending.length ? ` ${pending.length}` : ""}`],
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
                  <h2 className="text-lg font-semibold">
                    {filter === "COMPLETED" ? "还没有已完成的批改" : "暂无分配的提交"}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">有新的任务时，它们会显示在这里。</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="divide-y p-0">
                  {visibleAssignments.map((assignment) => {
                    const isCompleted = assignment.status === "COMPLETED";

                    return (
                      <div
                        key={assignment.id}
                        className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-medium">{getAssignmentTitle(assignment)}</p>
                            <StatusBadge status={assignment.status} />
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{getStudentName(assignment)}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{getSubmissionTime(assignment)}</p>
                        </div>
                        <Link href={`/ta/assignments/${assignment.id}`} className="shrink-0">
                          <Button variant={isCompleted ? "outline" : "default"} className="w-full sm:w-auto">
                            {isCompleted ? "查看批改" : "开始批改"}
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
