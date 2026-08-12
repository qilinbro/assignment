"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/assignment/status-badge";
import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { useAuth } from "@/components/providers/auth-provider";
import { format } from "date-fns";
import type { SubmissionStatus } from "@/types";

export default function StudentDashboard() {
  useRequireAuth();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const [loading, setLoading] = React.useState(true);
  const [submissions, setSubmissions] = React.useState<any[]>([]);
  const [assignments, setAssignments] = React.useState<any[]>([]);

  React.useEffect(() => {
    // 获取所有已发布的作业
    fetch("/api/assignments")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setAssignments(Array.isArray(d) ? d : []))
      .catch(() => setAssignments([]));
    // 获取学生自己的提交记录
    fetch("/api/submissions")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setSubmissions(Array.isArray(d) ? d : []))
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }, []);

  // 按作业 id 查找学生的提交
  const getSubmissionFor = (assignmentId: string) =>
    submissions.find((s) => s.assignmentId === assignmentId);

  const stats = {
    totalAssignments: assignments.length,
    submitted: submissions.length,
    pendingGrading: submissions.filter((s) => s.status === "GRADING" || s.status === "PENDING").length,
    completed: submissions.filter((s) => s.status === "COMPLETED").length,
    resubmissionRequired: submissions.filter((s) => s.status === "RESUBMISSION_REQUIRED").length,
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const getSubmissionStatus = (submission: any) => {
    if (submission.status === "COMPLETED") {
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        text: "已完成",
        color: "text-green-600",
      };
    }
    if (submission.status === "RESUBMISSION_REQUIRED") {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        text: "需要重新提交",
        color: "text-amber-600",
      };
    }
    return {
      icon: <Clock className="h-4 w-4" />,
      text: "待批改",
      color: "text-blue-600",
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">学生控制台</h1>
                {user && <Badge variant="outline">{user.name}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                查看你的提交与反馈
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              退出登录
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>作业总数</CardDescription>
                  <CardTitle className="text-3xl">{stats.totalAssignments}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4 mr-1" />
                    可用作业数
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>已提交</CardDescription>
                  <CardTitle className="text-3xl">{stats.submitted}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    已提交作业数
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>待批改</CardDescription>
                  <CardTitle className="text-3xl">{stats.pendingGrading}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    等待反馈
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Needed Alert */}
            {stats.resubmissionRequired > 0 && (
              <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-900/10">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-amber-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                        需要处理
                      </h3>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                        你有 {stats.resubmissionRequired} 份作业需要重新提交。请查看助教反馈并提交修改后的作业。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 作业列表 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>作业列表</CardTitle>
                    <CardDescription>查看所有已发布的作业并提交</CardDescription>
                  </div>
                  <Badge variant="secondary">{assignments.length} 个作业</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">暂无作业</h3>
                    <p className="text-sm text-muted-foreground">老师还没有发布作业。</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment) => {
                      const sub = getSubmissionFor(assignment.id);
                      const isPast = isDeadlinePassed(assignment.deadline);
                      return (
                        <div
                          key={assignment.id}
                          className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{assignment.title}</h3>
                                {isPast && (
                                  <Badge variant="destructive" className="text-xs">
                                    已截止
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                截止时间：{format(new Date(assignment.deadline), "yyyy年MM月dd日 HH:mm")}
                              </p>
                            </div>
                            {sub ? (
                              <StatusBadge status={sub.status} />
                            ) : (
                              <Badge variant="outline">未提交</Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              {sub
                                ? `提交于 ${format(new Date(sub.submittedAt), "yyyy年MM月dd日 HH:mm")}`
                                : "尚未提交"}
                            </div>

                            <div className="flex gap-2">
                              {!sub && !isPast && (
                                <Link href={`/assignment/${assignment.id}`}>
                                  <Button size="sm">去提交</Button>
                                </Link>
                              )}
                              {sub && (
                                <Link href={`/assignment/${assignment.id}`}>
                                  <Button variant="outline" size="sm">
                                    查看详情
                                  </Button>
                                </Link>
                              )}
                              {sub?.status === "RESUBMISSION_REQUIRED" && (
                                <Link href={`/assignment/${assignment.id}/resubmit`}>
                                  <Button size="sm">重新提交</Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">需要帮助？</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>•</span>
                    <span>联系你的助教进行答疑</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>•</span>
                    <span>提交前请仔细阅读作业要求</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>•</span>
                    <span>查看反馈评语以获取改进建议</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">即将到来的截止时间</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {assignments
                    .filter((a) => !isDeadlinePassed(a.deadline))
                    .map((assignment) => (
                      <div key={assignment.id} className="flex justify-between">
                        <span>{assignment.title}</span>
                        <span className="text-muted-foreground">
                          {format(new Date(assignment.deadline), "MM月dd日")}
                        </span>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
