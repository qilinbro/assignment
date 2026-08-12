import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col paper-texture" style={{ background: "linear-gradient(160deg, hsl(38 35% 97%) 0%, hsl(35 25% 95%) 50%, hsl(243 20% 96%) 100%)" }}>
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm" style={{ background: "hsl(40 50% 99% / 0.6)" }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "hsl(243 75% 59%)" }}>
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">批改坞</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8" style={{ background: "hsl(243 75% 96%)", color: "hsl(243 75% 40%)" }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "hsl(243 75% 59%)" }} />
            <span className="text-sm font-medium">英语作文 · 应用文 · 读后续写</span>
          </div>

          <h2 className="animate-slide-up text-5xl md:text-6xl font-bold mb-5 tracking-tight" style={{ color: "hsl(220 25% 15%)" }}>
            英语作文<br />在线批改平台
          </h2>

          <p className="animate-slide-up delay-100 text-lg mb-12" style={{ color: "hsl(220 10% 42%)" }}>
            学生在线提交 · 助教看图批改 · AI 智能辅助评语
          </p>

          <div className="animate-slide-up delay-200">
            <Link href="/login">
              <Button size="lg" className="px-10 text-base h-12 transition-transform hover:scale-105 active:scale-95">
                进入系统
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* 角色概览 */}
          <div className="animate-fade-in delay-300 mt-20 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="text-center p-4 rounded-xl" style={{ background: "hsl(40 50% 99% / 0.8)", border: "1px solid hsl(35 15% 90%)" }}>
              <div className="text-sm font-semibold mb-1" style={{ color: "hsl(243 75% 50%)" }}>管理员</div>
              <div className="text-xs" style={{ color: "hsl(220 10% 50%)" }}>发布作业 · 数据总览</div>
            </div>
            <div className="text-center p-4 rounded-xl" style={{ background: "hsl(40 50% 99% / 0.8)", border: "1px solid hsl(35 15% 90%)" }}>
              <div className="text-sm font-semibold mb-1" style={{ color: "hsl(160 60% 40%)" }}>助教</div>
              <div className="text-xs" style={{ color: "hsl(220 10% 50%)" }}>看图批改 · AI 辅助</div>
            </div>
            <div className="text-center p-4 rounded-xl" style={{ background: "hsl(40 50% 99% / 0.8)", border: "1px solid hsl(35 15% 90%)" }}>
              <div className="text-sm font-semibold mb-1" style={{ color: "hsl(35 75% 45%)" }}>学生</div>
              <div className="text-xs" style={{ color: "hsl(220 10% 50%)" }}>在线提交 · 查看反馈</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 text-center">
        <p className="text-sm" style={{ color: "hsl(220 10% 55%)" }}>
          批改坞
        </p>
      </footer>
    </div>
  );
}
