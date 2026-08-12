import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, GraduationCap, UserCircle, LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Assignment System</h1>
            </div>
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Assignment Submission & TA Grading System
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive platform for managing student assignments, TA allocations, and grading workflows.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Admin Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <LayoutDashboard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Admin</CardTitle>
              <CardDescription>
                Manage assignments, view statistics, and oversee the entire grading process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          {/* TA Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Teaching Assistant</CardTitle>
              <CardDescription>
                View assigned submissions, grade assignments, and provide feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/ta">
                <Button className="w-full" variant="secondary">
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Student Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                <UserCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Student</CardTitle>
              <CardDescription>
                Submit assignments, view feedback, and manage resubmissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/student">
                <Button className="w-full" variant="secondary">
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-12">Key Features</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold">Random TA Allocation</h4>
                  <p className="text-sm text-muted-foreground">
                    Server-side random assignment of multiple TAs per submission
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold">Flexible Configuration</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure TA count and availability per assignment
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold">Resubmission Workflow</h4>
                  <p className="text-sm text-muted-foreground">
                    Dedicated channel for student resubmissions with history tracking
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold">Role-Based Access</h4>
                  <p className="text-sm text-muted-foreground">
                    Secure authentication and authorization for all user roles
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold">Real-time Progress</h4>
                  <p className="text-sm text-muted-foreground">
                    Track grading progress and submission statistics
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold">File Upload Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Support for images, PDFs, and documents with preview
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mt-24">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>Assignment Submission and TA Grading System. Built with Next.js, TypeScript, and shadcn/ui.</p>
        </div>
      </footer>
    </div>
  );
}
