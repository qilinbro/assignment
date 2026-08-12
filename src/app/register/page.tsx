"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, UserPlus, ArrowLeft, User, Lock, Mail, ShieldCheck, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/auth-provider";
import { roleHomePath } from "@/lib/auth/auth-storage";
import type { UserRole } from "@/types";

const REGISTER_CODE_KEY = "assignment_register_code";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [role, setRole] = React.useState<UserRole>("STUDENT");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [taInvite, setTaInvite] = React.useState(""); // 助教注册码
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  const [error, setError] = React.useState("");
  const [info, setInfo] = React.useState(""); // 演示验证码提示
  const [submitting, setSubmitting] = React.useState(false);

  // 验证码倒计时
  const [countdown, setCountdown] = React.useState(0);
  React.useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const emailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSendCode = () => {
    setError("");
    if (!emailValid(email)) {
      setError("请输入有效的邮箱");
      return;
    }
    // 生成 6 位验证码，存 sessionStorage（demo：不真发邮件）
    const generated = String(Math.floor(100000 + Math.random() * 900000));
    sessionStorage.setItem(REGISTER_CODE_KEY, generated);
    setInfo(`验证码已发送至 ${email}（演示验证码：${generated}）`);
    setCountdown(60);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!name.trim()) return setError("请输入姓名");
    if (role === "TA" && taInvite.trim() !== "114514")
      return setError("助教注册码不正确");
    if (!emailValid(email)) return setError("请输入有效的邮箱");
    const savedCode = sessionStorage.getItem(REGISTER_CODE_KEY);
    if (!code.trim()) return setError("请输入邮箱验证码");
    if (code.trim() !== savedCode) return setError("验证码不正确");
    if (password.length < 6) return setError("密码至少 6 位");
    if (password !== confirm) return setError("两次密码不一致");

    setSubmitting(true);
    const result = await register({ name, email, password, role });
    setSubmitting(false);

    if (!result.ok || !result.user) {
      setError(result.error || "注册失败");
      return;
    }
    sessionStorage.removeItem(REGISTER_CODE_KEY);
    router.push(roleHomePath(result.user.role));
  };

  return (
    <div className="min-h-screen paper-texture" style={{ background: "linear-gradient(160deg, hsl(38 35% 97%) 0%, hsl(35 25% 95%) 50%, hsl(243 20% 96%) 100%)" }}>
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm" style={{ background: "hsl(40 50% 99% / 0.6)" }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">批改坞</h1>
            </Link>
            <Link href="/login">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回登录
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Register Form */}
      <main className="container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">注册账号</CardTitle>
            <CardDescription>学生可直接注册，助教需注册码</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 身份选择 */}
              <div className="space-y-2">
                <Label>身份</Label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: "STUDENT", label: "学生" },
                    { value: "TA", label: "助教" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRole(opt.value)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        role === opt.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50 text-muted-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 助教注册码（仅助教需要） */}
              {role === "TA" && (
                <div className="space-y-2">
                  <Label htmlFor="taInvite">助教注册码</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="taInvite"
                      className="pl-9"
                      placeholder="请输入助教注册码"
                      value={taInvite}
                      onChange={(e) => setTaInvite(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* 姓名 */}
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    className="pl-9"
                    placeholder="用作登录账号"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* 邮箱 + 验证码 */}
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-9"
                    placeholder="用于接收验证码"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">邮箱验证码</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="code"
                      className="pl-9"
                      placeholder="6 位验证码"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendCode}
                    disabled={countdown > 0}
                    className="shrink-0"
                  >
                    {countdown > 0 ? `${countdown}s 后重发` : "获取验证码"}
                  </Button>
                </div>
              </div>

              {/* 密码 */}
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-9"
                    placeholder="至少 6 位"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">确认密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm"
                    type="password"
                    className="pl-9"
                    placeholder="再次输入密码"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              {info && <p className="text-sm text-primary">{info}</p>}

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                <UserPlus className="h-4 w-4 mr-2" />
                {submitting ? "注册中..." : "注册"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              已有账号？{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                返回登录
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
