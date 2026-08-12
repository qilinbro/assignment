"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/auth-provider";
import { roleHomePath } from "@/lib/auth/auth-storage";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();
  const [pw, setPw] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // 需登录才能改密
  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (pw.length < 6) return setError("新密码至少 6 位");
    if (pw !== confirm) return setError("两次输入不一致");

    setSubmitting(true);
    const r = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: pw }),
    });
    const data = await r.json();
    setSubmitting(false);

    if (!r.ok) {
      setError(data.error || "修改失败");
      return;
    }
    // 改密成功：刷新用户状态（mustChangePassword → false），再进入控制台
    await refresh();
    if (user) router.push(roleHomePath(user.role));
    else router.push("/login");
  };

  return (
    <div className="min-h-screen paper-texture" style={{ background: "linear-gradient(160deg, hsl(38 35% 97%) 0%, hsl(35 25% 95%) 50%, hsl(243 20% 96%) 100%)" }}>
      <header className="border-b border-border/50 backdrop-blur-sm" style={{ background: "hsl(40 50% 99% / 0.6)" }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">批改坞</h1>
            </div>
            <Link href="/login">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回登录
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-7 w-7 text-amber-600" />
            </div>
            <CardTitle className="text-2xl">修改密码</CardTitle>
            <CardDescription>
              首次登录请设置新密码后继续{user ? `（账号：${user.name}）` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pw">新密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="pw"
                    type="password"
                    className="pl-9"
                    placeholder="至少 6 位"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">确认新密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm"
                    type="password"
                    className="pl-9"
                    placeholder="再次输入新密码"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? "提交中..." : "修改密码并继续"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
