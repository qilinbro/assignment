"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, LogIn, ArrowLeft, Shield, GraduationCap, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// 可选身份及其对应控制台入口
const ROLES = [
  {
    value: "admin",
    label: "管理员",
    path: "/admin",
    description: "发布作业、查看统计、统筹批改流程",
    icon: Shield,
    color: "text-blue-600",
  },
  {
    value: "ta",
    label: "助教",
    path: "/ta",
    description: "查看分配的提交、批改作业并给出反馈",
    icon: GraduationCap,
    color: "text-green-600",
  },
  {
    value: "student",
    label: "学生",
    path: "/student",
    description: "提交作业、查看反馈、管理重新提交",
    icon: UserCircle,
    color: "text-purple-600",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = React.useState<string>("");

  const selectedRole = ROLES.find((r) => r.value === role);

  const handleEnter = () => {
    if (selectedRole) {
      router.push(selectedRole.path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">作业管理系统</h1>
            </Link>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首页
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Login Card */}
      <main className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">登录</CardTitle>
            <CardDescription>选择身份以进入对应的控制台</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="role">选择身份</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="请选择身份" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 所选身份说明 */}
            {selectedRole && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                {React.createElement(selectedRole.icon, {
                  className: `h-5 w-5 mt-0.5 ${selectedRole.color}`,
                })}
                <div>
                  <p className="text-sm font-medium">{selectedRole.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRole.description}
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={handleEnter}
              disabled={!role}
              className="w-full"
              size="lg"
            >
              <LogIn className="h-4 w-4 mr-2" />
              进入控制台
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              演示版本：选择身份即可直接进入，无需账号密码
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
