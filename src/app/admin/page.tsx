"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, BarChart3, Calendar, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// 模拟数据 - 实际应用中应来自 API
const mockAssignments = [
  {
    id: "assignment-week-1",
    title: "第一周作业",
    deadline: "2026-08-20T23:59:59",
    totalSubmissions: 86,
    completedGrading: 62,
    pendingGrading: 24,
    resubmissions: 3,
    gradingProgress: 72,
  },
  {
    id: "assignment-week-2",
    title: "第二周作业",
    deadline: "2026-09-01T23:59:59",
    totalSubmissions: 93,
    completedGrading: 38,
    pendingGrading: 55,
    resubmissions: 1,
    gradingProgress: 41,
  },
  {
    id: "assignment-week-3",
    title: "第三周作业",
    deadline: "2026-08-15T23:59:59",
    totalSubmissions: 45,
    completedGrading: 12,
    pendingGrading: 33,
    resubmissions: 0,
    gradingProgress: 27,
  },
];

const mockStats = {
  totalAssignments: 3,
  totalSubmissions: 224,
  pendingGrading: 112,
  completedGrading: 112,
  pendingResubmissions: 4,
};

export default function AdminDashboard() {
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
              <h1 className="text-2xl font-bold">管理员控制台</h1>
              <p className="text-sm text-muted-foreground">管理作业并查看统计数据</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/assignments/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  创建作业
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">退出登录</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>作业总数</CardDescription>
              <CardTitle className="text-3xl">{mockStats.totalAssignments}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                进行中的作业
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>提交总数</CardDescription>
              <CardTitle className="text-3xl">{mockStats.totalSubmissions}</CardTitle>
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
              <CardTitle className="text-3xl">{mockStats.pendingGrading}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                等待助教批阅
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>已完成批改</CardDescription>
              <CardTitle className="text-3xl">{mockStats.completedGrading}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 mr-1" />
                已完成批改
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>待处理重新提交</CardDescription>
              <CardTitle className="text-3xl">{mockStats.pendingResubmissions}</CardTitle>
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>作业列表</CardTitle>
                <CardDescription>管理并监控所有作业</CardDescription>
              </div>
              <Badge variant="secondary">{mockAssignments.length} 个作业</Badge>
            </div>
          </CardHeader>
          <CardContent>
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
                  {mockAssignments.map((assignment) => (
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
                              style={{ width: `${assignment.gradingProgress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{assignment.gradingProgress}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground text-center mt-1">
                          {assignment.completedGrading} / {assignment.totalSubmissions * 2}
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
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>最近动态</CardTitle>
              <CardDescription>最新的提交与批改更新</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>学生A 提交了 第一周作业</span>
                  <span className="text-muted-foreground ml-auto">2 分钟前</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>助教01 完成了 学生B 的批改</span>
                  <span className="text-muted-foreground ml-auto">15 分钟前</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>学生C 申请了重新提交</span>
                  <span className="text-muted-foreground ml-auto">1 小时前</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>助教绩效</CardTitle>
              <CardDescription>各助教的批改完成情况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>助教01</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: "85%" }} />
                    </div>
                    <span className="font-medium">85%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>助教02</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: "72%" }} />
                    </div>
                    <span className="font-medium">72%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>助教03</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: "45%" }} />
                    </div>
                    <span className="font-medium">45%</span>
                  </div>
                </div>
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
                  <span>在线助教</span>
                  <Badge variant="secondary">5 人在线</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>活跃学生</span>
                  <Badge variant="secondary">12 人活跃</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>系统负载</span>
                  <Badge variant="default">正常</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
