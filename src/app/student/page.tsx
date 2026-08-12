"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/assignment/status-badge";
import { format } from "date-fns";

// Mock student data
const mockStudentId = "student-1";
const mockStudentName = "Student A";

const mockSubmissions = [
  {
    id: "submission-1",
    assignmentId: "assignment-week-1",
    assignmentTitle: "Week 1 Homework",
    assignmentDeadline: "2026-08-20T23:59:59",
    status: "COMPLETED",
    submittedAt: "2024-08-12T14:20:00",
    hasFeedback: true,
    averageScore: 87.5,
    feedbackCount: 2,
  },
  {
    id: "submission-2",
    assignmentId: "assignment-week-2",
    assignmentTitle: "Week 2 Homework",
    assignmentDeadline: "2026-09-01T23:59:59",
    status: "RESUBMISSION_REQUIRED",
    submittedAt: "2024-08-12T14:35:00",
    hasFeedback: true,
    averageScore: 78,
    feedbackCount: 2,
  },
  {
    id: "submission-3",
    assignmentId: "assignment-week-3",
    assignmentTitle: "Week 3 Homework",
    assignmentDeadline: "2026-08-15T23:59:59",
    status: "GRADING",
    submittedAt: "2024-08-12T15:00:00",
    hasFeedback: false,
    averageScore: null,
    feedbackCount: 0,
  },
];

const mockStats = {
  totalAssignments: 3,
  submitted: 3,
  pendingGrading: 1,
  completed: 1,
  resubmissionRequired: 1,
  averageScore: 82.5,
};

export default function StudentDashboard() {
  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const getSubmissionStatus = (submission: typeof mockSubmissions[0]) => {
    if (submission.status === "COMPLETED") {
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        text: "Completed",
        color: "text-green-600",
      };
    }
    if (submission.status === "RESUBMISSION_REQUIRED") {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        text: "Resubmission Required",
        color: "text-amber-600",
      };
    }
    return {
      icon: <Clock className="h-4 w-4" />,
      text: "Pending Grading",
      color: "text-blue-600",
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">Student Dashboard</h1>
                <Badge variant="outline">{mockStudentName}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                View your submissions and feedback
              </p>
            </div>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Assignments</CardDescription>
              <CardTitle className="text-3xl">{mockStats.totalAssignments}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4 mr-1" />
                Available assignments
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Submitted</CardDescription>
              <CardTitle className="text-3xl">{mockStats.submitted}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 mr-1" />
                Assignments submitted
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Grading</CardDescription>
              <CardTitle className="text-3xl">{mockStats.pendingGrading}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                Awaiting feedback
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Average Score</CardDescription>
              <CardTitle className="text-3xl">{mockStats.averageScore}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 mr-1" />
                Across completed work
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Needed Alert */}
        {mockStats.resubmissionRequired > 0 && (
          <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-900/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-amber-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                    Action Required
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                    You have {mockStats.resubmissionRequired} assignment(s) that require
                    resubmission. Please review the TA feedback and submit your revised work.
                  </p>
                  <Link href={`/assignment/${mockSubmissions[1].assignmentId}/resubmit`}>
                    <Button variant="outline" size="sm">
                      Go to Resubmission
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submissions List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Submissions</CardTitle>
                <CardDescription>Track your assignment progress and feedback</CardDescription>
              </div>
              <Badge variant="secondary">{mockSubmissions.length} submissions</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSubmissions.map((submission) => {
                const statusInfo = getSubmissionStatus(submission);
                const isPastDeadline = isDeadlinePassed(submission.assignmentDeadline);

                return (
                  <div
                    key={submission.id}
                    className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{submission.assignmentTitle}</h3>
                          {isPastDeadline && (
                            <Badge variant="destructive" className="text-xs">
                              Closed
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Submitted {format(new Date(submission.submittedAt), "MMM dd, yyyy 'at' HH:mm")}
                        </p>
                      </div>
                      <StatusBadge status={submission.status} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        {submission.hasFeedback ? (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Score:</span>
                            <Badge variant="outline" className="font-semibold">
                              {submission.averageScore}/100
                            </Badge>
                            <span className="text-muted-foreground">
                              ({submission.feedbackCount} TA(s))
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No feedback yet
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {submission.hasFeedback && (
                          <Link href={`/assignment/${submission.assignmentId}`}>
                            <Button variant="outline" size="sm">
                              View Feedback
                            </Button>
                          </Link>
                        )}
                        {submission.status === "RESUBMISSION_REQUIRED" && !isPastDeadline && (
                          <Link href={`/assignment/${submission.assignmentId}/resubmit`}>
                            <Button size="sm">Resubmit</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>•</span>
                <span>Contact your TA for clarification</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>•</span>
                <span>Review assignment guidelines before submitting</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>•</span>
                <span>Check feedback comments for improvement tips</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {mockSubmissions
                .filter((s) => !isDeadlinePassed(s.assignmentDeadline))
                .map((submission) => (
                  <div key={submission.id} className="flex justify-between">
                    <span>{submission.assignmentTitle}</span>
                    <span className="text-muted-foreground">
                      {format(new Date(submission.assignmentDeadline), "MMM dd")}
                    </span>
                  </div>
                ))}
              </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
