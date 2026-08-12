"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 模拟助教 - 实际应用中应来自 API
const mockTAs = [
  { id: "ta-1", name: "助教01" },
  { id: "ta-2", name: "助教02" },
  { id: "ta-3", name: "助教03" },
  { id: "ta-4", name: "助教04" },
  { id: "ta-5", name: "助教05" },
];

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedTAs, setSelectedTAs] = React.useState<string[]>([]);

  const toggleTA = (taId: string) => {
    setSelectedTAs((prev) =>
      prev.includes(taId) ? prev.filter((id) => id !== taId) : [...prev, taId]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const assignmentData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      deadline: new Date(formData.get("deadline") as string),
      taIds: selectedTAs,
      taCount: parseInt(formData.get("taCount") as string),
      allowResubmission: formData.get("allowResubmission") === "true",
      resubmissionDescription: formData.get("resubmissionDescription") as string,
      createdBy: "admin-1", // 实际应用中应来自认证信息
    };

    // 校验
    if (!assignmentData.title || !assignmentData.deadline) {
      alert("请填写所有必填项");
      setIsSubmitting(false);
      return;
    }

    if (selectedTAs.length === 0) {
      alert("请至少选择一名助教");
      setIsSubmitting(false);
      return;
    }

    if (assignmentData.taCount > selectedTAs.length) {
      alert("助教数量不能超过所选助教的总数");
      setIsSubmitting(false);
      return;
    }

    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Creating assignment:", assignmentData);

    // 实际应用中会调用 API
    // const result = await assignmentService.createAssignment(assignmentData);

    setIsSubmitting(false);
    router.push("/admin");
  };

  const getMinDeadline = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">创建作业</h1>
              <p className="text-sm text-muted-foreground">
                新建作业并分配助教
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
                <CardDescription>
                  填写本作业的基本信息
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">作业标题 *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="例如：8月12日作业"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">作业描述</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="请输入作业说明..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">截止时间 *</Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="datetime-local"
                    min={getMinDeadline()}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    超过此时间后，学生将无法提交
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* TA Selection */}
            <Card>
              <CardHeader>
                <CardTitle>助教分配</CardTitle>
                <CardDescription>
                  选择参与的助教并设置分配数量
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>参与的助教 *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {mockTAs.map((ta) => (
                      <button
                        key={ta.id}
                        type="button"
                        onClick={() => toggleTA(ta.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedTAs.includes(ta.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="font-medium">{ta.name}</div>
                        <div className="text-sm text-muted-foreground">{ta.id}</div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    已选择 {selectedTAs.length} 名助教
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taCount">每份提交分配的助教数 *</Label>
                  <Select name="taCount" defaultValue="2" required>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择数量" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">每份提交 1 名助教</SelectItem>
                      <SelectItem value="2">每份提交 2 名助教</SelectItem>
                      <SelectItem value="3">每份提交 3 名助教</SelectItem>
                      <SelectItem value="4">每份提交 4 名助教</SelectItem>
                      <SelectItem value="5">每份提交 5 名助教</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    每份提交将被随机分配给相应数量的助教
                  </p>
                </div>

                {selectedTAs.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>分配概要：</strong>每份学生提交将从{" "}
                      <strong>{selectedTAs.length}</strong> 名所选助教中随机分配给{" "}
                      <strong>2</strong> 名助教批改。
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resubmission Settings */}
            <Card>
              <CardHeader>
                <CardTitle>重新提交设置</CardTitle>
                <CardDescription>
                  配置重新提交的权限与说明
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="allowResubmission">允许重新提交</Label>
                  <Select name="allowResubmission" defaultValue="true">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">是，允许重新提交</SelectItem>
                      <SelectItem value="false">否，不允许重新提交</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    当助教要求时，学生可以提交修改后的作业
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resubmissionDescription">
                    重新提交说明
                  </Label>
                  <Textarea
                    id="resubmissionDescription"
                    name="resubmissionDescription"
                    placeholder="说明学生重新提交时应包含的内容..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    这些说明将在学生重新提交时显示
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Link href="/admin">
                <Button variant="outline" type="button">
                  取消
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "创建中..." : "创建作业"}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
