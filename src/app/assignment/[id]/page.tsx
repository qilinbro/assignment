"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, Calendar, User, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/submission/file-upload";
import { StatusBadge } from "@/components/assignment/status-badge";
import { format } from "date-fns";

// 模拟作业数据 - 实际应用中应来自 API
const mockAssignment = {
  id: "assignment-week-1",
  title: "第一周作业",
  description: `请完成以下练习：

1. 阅读第一章并回答理解性问题
2. 围绕核心概念撰写 200 字的读书感悟
3. 完成本章末尾的练习题

请以清晰的图片或 PDF 形式提交作业，确保所有文字清晰可读。`,
  deadline: "2026-08-20T23:59:59",
  allowResubmission: true,
  resubmissionDescription: "请说明你根据助教反馈做了哪些修改",
};

export default function AssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [hasSubmitted, setHasSubmitted] = React.useState(false);
  const [submission, setSubmission] = React.useState<{
    id: string;
    status: "PENDING" | "GRADING" | "COMPLETED" | "RESUBMISSION_REQUIRED" | "RESUBMITTED";
    submittedAt: string;
  }>({
    id: "submission-1",
    status: "COMPLETED",
    submittedAt: "2024-08-12T14:20:00",
  });

  const isDeadlinePassed = new Date(mockAssignment.deadline) < new Date();

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      alert("请至少上传一个文件");
      return;
    }

    setIsSubmitting(true);

    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Submitting files:", uploadedFiles);

    // 实际应用中会：
    // 1. 上传文件到存储
    // 2. 通过 API 创建提交
    // 3. 跳转到成功页面

    setHasSubmitted(true);
    setSubmission({
      id: `submission-${Date.now()}`,
      status: "PENDING",
      submittedAt: new Date().toISOString(),
    });

    setIsSubmitting(false);
  };

  const canShowResubmissionButton =
    isDeadlinePassed &&
    mockAssignment.allowResubmission &&
    submission.status === "RESUBMISSION_REQUIRED";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline" className="mb-2">作业</Badge>
              <h1 className="text-2xl font-bold">{mockAssignment.title}</h1>
              <p className="text-sm text-muted-foreground">{mockAssignment.id}</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/")}>
              返回首页
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Assignment Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>作业详情</CardTitle>
                  <CardDescription>提交前请先查看作业要求</CardDescription>
                </div>
                {hasSubmitted ? (
                  <StatusBadge status={submission.status} />
                ) : isDeadlinePassed ? (
                  <Badge variant="destructive">已截止</Badge>
                ) : (
                  <Badge variant="default">进行中</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-line">{mockAssignment.description}</p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">截止时间：</span>
                  <span className={isDeadlinePassed ? "text-destructive font-medium" : ""}>
                    {format(new Date(mockAssignment.deadline), "yyyy年MM月dd日 HH:mm")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {mockAssignment.allowResubmission ? "允许重新提交" : "不允许重新提交"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Status */}
          {hasSubmitted && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <CardTitle className="text-green-900 dark:text-green-100">
                      提交成功
                    </CardTitle>
                    <CardDescription className="text-green-700 dark:text-green-300">
                      你的作业已提交，正在等待助教批阅
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">提交编号：</span>
                    <span className="font-mono">{submission.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">提交时间：</span>
                    <span>{format(new Date(submission.submittedAt), "yyyy年MM月dd日 HH:mm")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">已上传文件：</span>
                    <span>{uploadedFiles.length} 个文件</span>
                  </div>
                </div>

                {submission.status === "COMPLETED" && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      查看反馈
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submission Form */}
          {!hasSubmitted && !isDeadlinePassed && (
            <Card>
              <CardHeader>
                <CardTitle>提交作业</CardTitle>
                <CardDescription>
                  上传你的作业文件（JPG、PNG、WEBP - 每个不超过 10MB）
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <FileUpload
                    onFilesChange={setUploadedFiles}
                    maxFiles={10}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    maxSizeMB={10}
                  />

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">提交须知：</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 确保所有图片清晰可读</li>
                      <li>• 拍照时注意光线充足</li>
                      <li>• 包含作业的所有页面</li>
                      <li>• 提交前请仔细检查</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || uploadedFiles.length === 0}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? "提交中..." : "提交作业"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Deadline Passed Message */}
          {!hasSubmitted && isDeadlinePassed && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-amber-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                      提交截止时间已过
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                      本作业的提交期已结束，不再接受正常提交。
                      {mockAssignment.allowResubmission &&
                        " 如果你被要求重新提交，请使用重新提交通道。"}
                    </p>
                    {canShowResubmissionButton && (
                      <Button
                        onClick={() => router.push(`/assignment/${params.id}/resubmit`)}
                        variant="outline"
                      >
                        提交重新提交
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Submission with Feedback */}
          {hasSubmitted && submission.status === "COMPLETED" && (
            <Card>
              <CardHeader>
                <CardTitle>批改结果</CardTitle>
                <CardDescription>分配给你的助教的反馈</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* TA 1 Feedback */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">助教01</span>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        分数：85
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      第 1 题解答正确。第 2、3 题请修改，使表达更清晰。
                    </p>
                    <Button variant="outline" size="sm">
                      查看反馈文件
                    </Button>
                  </div>

                  {/* TA 2 Feedback */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">助教03</span>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        分数：90
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      整体表现不错。解释清晰，答案结构合理。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
