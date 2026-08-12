import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">作业管理系统</h1>
          </div>
        </div>
      </header>

      {/* Hero（纯入口，无介绍） */}
      <main className="flex-1 flex items-center justify-center container mx-auto px-4 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">作业管理系统</h2>
          <p className="text-xl text-muted-foreground mb-10">
            作业提交与助教批改系统
          </p>
          <Link href="/login">
            <Button size="lg" className="px-8">
              进入系统
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>作业提交与助教批改系统。基于 Next.js、TypeScript 和 shadcn/ui 构建。</p>
        </div>
      </footer>
    </div>
  );
}
