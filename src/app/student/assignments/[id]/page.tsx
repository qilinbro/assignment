"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImagePreview } from "@/components/submission/image-preview";
import { StatusBadge } from "@/components/assignment/status-badge";
import { format } from "date-fns";
import type { SubmissionStatus } from "@/types";

// 模拟数据
const mockSubmission = {
  id: "submission-1",
  assignmentId: "assignment-week-1",
  assignmentTitle: "第一周作业",
  studentId: "student-1",
  submittedAt: "2024-08-12T14:20:00",
  status: "COMPLETED" as SubmissionStatus,
  files: [
    {
      id: "file-1",
      url: "/uploads/student-1-app.png",
      fileName: "应用文.png",
      fileType: "image/png",
      size: 340207,
    },
    {
      id: "file-1-2",
      url: "/uploads/student-1-read.png",
      fileName: "读后续.png",
      fileType: "image/png",
      size: 522688,
    },
  ],
};

const mockFeedback = [
  {
    id: "feedback-1",
    taName: "助教01",
    score: 85,
    comment:
      "第 1 题解答正确。第 2、3 题请修改，使表达更清晰。",
    requireResubmission: false,
    files: [],
  },
  {
    id: "feedback-2",
    taName: "助教03",
    score: 90,
    comment: "整体表现不错。解释清晰，答案结构合理。",
    requireResubmission: false,
    files: [],
  },
];

export default function StudentAssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/student")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">作业详情</h1>
              <p className="text-sm text-muted-foreground">{mockSubmission.assignmentTitle}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Submission Status */}
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                    提交已完成
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    你的作业已批改完成，可以查看反馈
                  </p>
                </div>
                <StatusBadge status={mockSubmission.status} />
              </div>
            </CardContent>
          </Card>

          {/* Submission Info */}
          <Card>
            <CardHeader>
              <CardTitle>提交信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">提交人：</span>
                  <span className="font-medium">学生A</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">提交时间：</span>
                  <span className="font-medium">
                    {format(new Date(mockSubmission.submittedAt), "yyyy年MM月dd日 HH:mm")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submitted Files */}
          <Card>
            <CardHeader>
              <CardTitle>我的提交</CardTitle>
              <CardDescription>你为本作业上传的文件</CardDescription>
            </CardHeader>
            <CardContent>
              <ImagePreview files={mockSubmission.files} />
            </CardContent>
          </Card>

          {/* TA Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>批改结果</CardTitle>
              <CardDescription>
                {mockFeedback.length} 名助教的反馈
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockFeedback.map((feedback) => (
                  <div key={feedback.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{feedback.taName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">助教</p>
                      </div>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {feedback.score}/100
                      </Badge>
                    </div>
                    <p className="text-sm mb-3">{feedback.comment}</p>
                    {feedback.requireResubmission && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          <strong>需要重新提交：</strong>请根据反馈进行修改。
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Average Score */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">平均分</span>
                    <Badge variant="default" className="text-lg px-3 py-1">
                      {(mockFeedback.reduce((acc, f) => acc + f.score, 0) / mockFeedback.length).toFixed(1)}/100
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push("/student")}>
              返回控制台
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
