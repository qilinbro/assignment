"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, CheckCircle, AlertCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/assignment/status-badge";
import { format } from "date-fns";
import type { SubmissionStatus } from "@/types";

// 模拟助教数据
const mockTAId = "ta-1";
const mockTAName = "助教01";

const mockAssignments = [
  {
    id: "sa-5",
    assignmentTitle: "第一周作业",
    assignmentId: "assignment-week-1",
    studentId: "student-3",
    studentName: "学生C",
    submittedAt: "2024-08-12T15:00:00",
    status: "GRADING" as SubmissionStatus,
    submissionId: "submission-3",
  },
  {
    id: "sa-1",
    assignmentTitle: "第一周作业",
    assignmentId: "assignment-week-1",
    studentId: "student-1",
    studentName: "学生A",
    submittedAt: "2024-08-12T14:20:00",
    status: "COMPLETED" as SubmissionStatus,
    submissionId: "submission-1",
  },
  {
    id: "sa-2",
    assignmentTitle: "第一周作业",
    assignmentId: "assignment-week-1",
    studentId: "student-1",
    studentName: "学生A",
    submittedAt: "2024-08-12T14:20:00",
    status: "COMPLETED" as SubmissionStatus,
    submissionId: "submission-1",
  },
  {
    id: "sa-6",
    assignmentTitle: "第一周作业",
    assignmentId: "assignment-week-1",
    studentId: "student-3",
    studentName: "学生C",
    submittedAt: "2024-08-12T15:00:00",
    status: "PENDING" as SubmissionStatus,
    submissionId: "submission-3",
  },
];

const mockStats = {
  pending: 1,
  inProgress: 1,
  completed: 2,
  total: 4,
};

export default function TADashboard() {
  const pendingAssignments = mockAssignments.filter((a) => a.status === "PENDING");
  const gradingAssignments = mockAssignments.filter((a) => a.status === "GRADING");
  const completedAssignments = mockAssignments.filter((a) => a.status === "COMPLETED");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">助教控制台</h1>
                <Badge variant="outline">{mockTAName}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                查看并批改分配给你的提交
              </p>
            </div>
            <Button variant="outline" onClick={() => (window.location.href = "/login")}>
              退出登录
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>分配总数</CardDescription>
              <CardTitle className="text-3xl">{mockStats.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Star className="h-4 w-4 mr-1" />
                所有作业
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>待处理</CardDescription>
              <CardTitle className="text-3xl">{mockStats.pending}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                尚未开始
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>进行中</CardDescription>
              <CardTitle className="text-3xl">{mockStats.inProgress}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mr-1" />
                正在批改
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>已完成</CardDescription>
              <CardTitle className="text-3xl">{mockStats.completed}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 mr-1" />
                已完成批改
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Grading */}
        {(pendingAssignments.length > 0 || gradingAssignments.length > 0) && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>待批改</CardTitle>
                  <CardDescription>
                    {pendingAssignments.length + gradingAssignments.length} 份作业需要处理
                  </CardDescription>
                </div>
                <Badge variant="destructive">
                  {pendingAssignments.length + gradingAssignments.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...pendingAssignments, ...gradingAssignments].map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium">{assignment.studentName}</span>
                        <StatusBadge status={assignment.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        提交于 {format(new Date(assignment.submittedAt), "MM月dd日 HH:mm")}
                      </p>
                    </div>
                    <Link href={`/ta/assignments/${assignment.id}`}>
                      <Button>开始批改</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed Grading */}
        {completedAssignments.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>已完成批改</CardTitle>
                  <CardDescription>
                    {completedAssignments.length} 份作业已完成
                  </CardDescription>
                </div>
                <Badge variant="secondary">{completedAssignments.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium">{assignment.studentName}</span>
                        <StatusBadge status={assignment.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        批改于 {format(new Date(assignment.submittedAt), "MM月dd日 HH:mm")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/ta/assignments/${assignment.id}`}>
                        <Button variant="outline" size="sm">
                          查看
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {mockAssignments.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">暂无分配的作业</h3>
              <p className="text-sm text-muted-foreground mb-4">
                目前还没有分配给你批改的提交。
              </p>
              <p className="text-sm text-muted-foreground">
                请稍后再来查看，或联系管理员了解更多信息。
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Tips */}
        <Card className="mt-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">
              批改指南
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span>
                  提供建设性的反馈，帮助学生改进作业
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span>
                  具体说明哪些地方需要修改、哪些地方做得好
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span>
                  仅在需要大幅修改时才勾选"要求重新提交"
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span>
                  上传反馈文件（图片、PDF）以提供详细的批注
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
