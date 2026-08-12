"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImagePreview } from "@/components/submission/image-preview";
import { StatusBadge } from "@/components/assignment/status-badge";
import { format } from "date-fns";
import type { SubmissionStatus } from "@/types";

export default function StudentAssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [submission, setSubmission] = React.useState<any>(null);
  const [feedback, setFeedback] = React.useState<any[]>([]);

  React.useEffect(() => {
    // TODO: Fetch submission data from API
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">未找到提交记录</p>
            <Button variant="outline" onClick={() => router.push("/student")}>
              返回控制台
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <p className="text-sm text-muted-foreground">{submission.assignmentTitle}</p>
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
                <StatusBadge status={submission.status} />
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
                  <span className="text-muted-foreground">提交时间：</span>
                  <span className="font-medium">
                    {format(new Date(submission.submittedAt), "yyyy年MM月dd日 HH:mm")}
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
              <ImagePreview files={submission.files || []} />
            </CardContent>
          </Card>

          {/* TA Feedback */}
          {feedback.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>批改结果</CardTitle>
                <CardDescription>
                  {feedback.length} 名助教的反馈
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {feedback.map((fb) => (
                    <div key={fb.id} className="border rounded-lg p-4">
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{fb.taName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">助教</p>
                      </div>
                      <p className="text-sm mb-3">{fb.comment}</p>
                      {fb.requireResubmission && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            <strong>需要重新提交：</strong>请根据反馈进行修改。
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
