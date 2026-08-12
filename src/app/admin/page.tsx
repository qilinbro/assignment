"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, BarChart3, Calendar, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { useAuth } from "@/components/providers/auth-provider";
import { StatusBadge } from "@/components/assignment/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "管理员",
  TA: "助教",
  STUDENT: "学生",
};

export default function AdminDashboard() {
  useRequireAuth();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const [loading, setLoading] = React.useState(true);
  const [assignments, setAssignments] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [pendingDialog, setPendingDialog] = React.useState(false);
  const [pendingList, setPendingList] = React.useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = React.useState(false);

  const fetchPending = async () => {
    setPendingLoading(true);
    setPendingList([]);
    try {
      const assignRes = await fetch("/api/assignments");
      const assignList = assignRes.ok ? await assignRes.json() : [];
      const allPending: any[] = [];
      for (const a of assignList) {
        const subRes = await fetch(`/api/submissions?assignmentId=${a.id}`);
        if (subRes.ok) {
          const subs = await subRes.json();
          for (const s of subs) {
            if (s.status === "PENDING" || s.status === "GRADING") {
              allPending.push({ ...s, assignmentTitle: a.title });
            }
          }
        }
      }
      setPendingList(allPending);
    } catch {}
    setPendingLoading(false);
    setPendingDialog(true);
  };

  React.useEffect(() => {
    // 从数据库读取作业列表
    fetch("/api/assignments")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setAssignments(Array.isArray(d) ? d : []))
      .catch(() => setAssignments([]));
    // 从数据库读取全部用户
    fetch("/api/users")
      .then((r) => (r.ok ? r.json() : { users: [] }))
      .then((d) => setUsers(d.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    totalAssignments: assignments.length,
    totalSubmissions: assignments.reduce((sum, a) => sum + (a.totalSubmissions || 0), 0),
    pendingGrading: assignments.reduce((sum, a) => sum + (a.pendingGrading || 0), 0),
    completedGrading: assignments.reduce((sum, a) => sum + (a.completedGrading || 0), 0),
    pendingResubmissions: assignments.reduce((sum, a) => sum + (a.resubmissions || 0), 0),
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const passed = isDeadlinePassed(deadline);
    return (
      <span className={passed ? "text-destructive" : ""}>
        {date.toLocaleDateString("zh-CN", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
        {passed && "（已截止）"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">管理员控制台</h1>
                {user && <Badge variant="outline">{user.name}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">管理作业并查看统计数据</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/assignments/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  创建作业
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>退出登录</Button>
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => document.getElementById("assignments-table")?.scrollIntoView({ behavior: "smooth" })}>
                <CardHeader className="pb-3">
                  <CardDescription>作业总数</CardDescription>
                  <CardTitle className="text-3xl">{stats.totalAssignments}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    进行中的作业
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => document.getElementById("assignments-table")?.scrollIntoView({ behavior: "smooth" })}>
                <CardHeader className="pb-3">
                  <CardDescription>提交总数</CardDescription>
                  <CardTitle className="text-3xl">{stats.totalSubmissions}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    学生提交数
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={fetchPending}>
                <CardHeader className="pb-3">
                  <CardDescription>待批改</CardDescription>
                  <CardTitle className="text-3xl">{stats.pendingGrading}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    点击查看未批改
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => document.getElementById("assignments-table")?.scrollIntoView({ behavior: "smooth" })}>
                <CardHeader className="pb-3">
                  <CardDescription>已完成批改</CardDescription>
                  <CardTitle className="text-3xl">{stats.completedGrading}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    已完成批改
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => document.getElementById("assignments-table")?.scrollIntoView({ behavior: "smooth" })}>
                <CardHeader className="pb-3">
                  <CardDescription>待处理重新提交</CardDescription>
                  <CardTitle className="text-3xl">{stats.pendingResubmissions}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    需要关注
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Assignments Table */}
            <Card id="assignments-table">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>作业列表</CardTitle>
                    <CardDescription>管理并监控所有作业</CardDescription>
                  </div>
                  <Badge variant="secondary">{assignments.length} 个作业</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">暂无作业</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      点击"创建作业"开始创建第一个作业。
                    </p>
                    <Link href="/admin/assignments/create">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        创建作业
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-medium">作业</th>
                          <th className="text-left p-4 font-medium">截止时间</th>
                          <th className="text-center p-4 font-medium">提交数</th>
                          <th className="text-center p-4 font-medium">批改进度</th>
                          <th className="text-center p-4 font-medium">状态</th>
                          <th className="text-right p-4 font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignments.map((assignment) => (
                          <tr key={assignment.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                            <td className="p-4">
                              <div>
                                <div className="font-medium">{assignment.title}</div>
                                <div className="text-sm text-muted-foreground">{assignment.id}</div>
                              </div>
                            </td>
                            <td className="p-4">{formatDeadline(assignment.deadline)}</td>
                            <td className="p-4 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-medium">{assignment.totalSubmissions}</span>
                                <span className="text-xs text-muted-foreground">
                                  {assignment.resubmissions} 次重新提交
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary"
                                    style={{ width: `${assignment.gradingProgress ?? 0}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{assignment.gradingProgress ?? 0}%</span>
                              </div>
                              <div className="text-xs text-muted-foreground text-center mt-1">
                                {assignment.completedGrading ?? 0} / {assignment.totalSubmissions ?? 0}
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              {isDeadlinePassed(assignment.deadline) ? (
                                <Badge variant="destructive">已截止</Badge>
                              ) : (
                                <Badge variant="default">进行中</Badge>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex justify-end gap-2">
                                <Link href={`/admin/assignments/${assignment.id}`}>
                                  <Button variant="outline" size="sm">
                                    <BarChart3 className="h-4 w-4 mr-1" />
                                    查看详情
                                  </Button>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 用户管理 */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>用户管理</CardTitle>
                    <CardDescription>已注册的用户（共 {users.length} 人）</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">助教 {users.filter((u) => u.role === "TA").length}</Badge>
                    <Badge variant="secondary">学生 {users.filter((u) => u.role === "STUDENT").length}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">姓名</th>
                        <th className="text-left p-3 font-medium">邮箱</th>
                        <th className="text-left p-3 font-medium">身份</th>
                        <th className="text-left p-3 font-medium">注册时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                          <td className="p-3 font-medium">{u.name}</td>
                          <td className="p-3 text-muted-foreground">{u.email}</td>
                          <td className="p-3">
                            <Badge variant="outline">{ROLE_LABELS[u.role]}</Badge>
                            {u.mustChangePassword && (
                              <Badge variant="secondary" className="ml-1 text-xs">待改密</Badge>
                            )}
                          </td>
                          <td className="p-3 text-muted-foreground text-sm">
                            {new Date(u.createdAt).toLocaleDateString("zh-CN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>最近动态</CardTitle>
              <CardDescription>最新的提交与批改更新</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-sm text-muted-foreground">
                暂无动态
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>助教绩效</CardTitle>
              <CardDescription>各助教的批改完成情况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-sm text-muted-foreground">
                暂无数据
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>系统状态</CardTitle>
              <CardDescription>整体系统健康状况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>系统负载</span>
                  <Badge variant="default">正常</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 待批改详情弹窗 */}
      <Dialog open={pendingDialog} onOpenChange={setPendingDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>待批改列表</DialogTitle>
            <DialogDescription>尚未完成批改的学生提交</DialogDescription>
          </DialogHeader>
          {pendingLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">加载中...</p>
          ) : pendingList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">暂无待批改的提交 🎉</p>
          ) : (
            <div className="space-y-3">
              {pendingList.map((s) => (
                <div key={s.id} className="border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{s.assignmentTitle}</span>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      学生 {s.studentId?.slice(-6)} · {format(new Date(s.submittedAt), "MM月dd日 HH:mm")} · {s.files?.length || 0} 个文件
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/admin/assignments/${s.assignmentId}`)}>
                    查看
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
