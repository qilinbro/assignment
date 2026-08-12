"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, CheckCircle, AlertCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/assignment/status-badge";
import { format } from "date-fns";

// Mock TA data
const mockTAId = "ta-1";
const mockTAName = "TA 01";

const mockAssignments = [
  {
    id: "sa-5",
    assignmentTitle: "Week 1 Homework",
    assignmentId: "assignment-week-1",
    studentId: "student-3",
    studentName: "Student C",
    submittedAt: "2024-08-12T15:00:00",
    status: "GRADING",
    submissionId: "submission-3",
  },
  {
    id: "sa-1",
    assignmentTitle: "Week 1 Homework",
    assignmentId: "assignment-week-1",
    studentId: "student-1",
    studentName: "Student A",
    submittedAt: "2024-08-12T14:20:00",
    status: "COMPLETED",
    submissionId: "submission-1",
  },
  {
    id: "sa-2",
    assignmentTitle: "Week 1 Homework",
    assignmentId: "assignment-week-1",
    studentId: "student-1",
    studentName: "Student A",
    submittedAt: "2024-08-12T14:20:00",
    status: "COMPLETED",
    submissionId: "submission-1",
  },
  {
    id: "sa-6",
    assignmentTitle: "Week 1 Homework",
    assignmentId: "assignment-week-1",
    studentId: "student-3",
    studentName: "Student C",
    submittedAt: "2024-08-12T15:00:00",
    status: "PENDING",
    submissionId: "submission-3",
  },
];

const mockStats = {
  pending: 1,
  inProgress: 1,
  completed: 2,
  total: 4,
};

export default function TADashboard() {
  const pendingAssignments = mockAssignments.filter((a) => a.status === "PENDING");
  const gradingAssignments = mockAssignments.filter((a) => a.status === "GRADING");
  const completedAssignments = mockAssignments.filter((a) => a.status === "COMPLETED");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">TA Dashboard</h1>
                <Badge variant="outline">{mockTAName}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                View and grade your assigned submissions
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Assigned</CardDescription>
              <CardTitle className="text-3xl">{mockStats.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Star className="h-4 w-4 mr-1" />
                All assignments
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-3xl">{mockStats.pending}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                Not started
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-3xl">{mockStats.inProgress}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mr-1" />
                Being graded
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl">{mockStats.completed}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 mr-1" />
                Finished grading
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Grading */}
        {(pendingAssignments.length > 0 || gradingAssignments.length > 0) && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Grading</CardTitle>
                  <CardDescription>
                    {pendingAssignments.length + gradingAssignments.length} assignment(s) need
                    attention
                  </CardDescription>
                </div>
                <Badge variant="destructive">
                  {pendingAssignments.length + gradingAssignments.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...pendingAssignments, ...gradingAssignments].map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium">{assignment.studentName}</span>
                        <Badge variant="outline" className="text-xs">
                          {assignment.assignmentTitle}
                        </Badge>
                        <StatusBadge status={assignment.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Submitted {format(new Date(assignment.submittedAt), "MMM dd, HH:mm")}
                      </p>
                    </div>
                    <Link href={`/ta/assignments/${assignment.id}`}>
                      <Button>Grade Now</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed Grading */}
        {completedAssignments.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Completed Grading</CardTitle>
                  <CardDescription>
                    {completedAssignments.length} assignment(s) finished
                  </CardDescription>
                </div>
                <Badge variant="secondary">{completedAssignments.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium">{assignment.studentName}</span>
                        <Badge variant="outline" className="text-xs">
                          {assignment.assignmentTitle}
                        </Badge>
                        <StatusBadge status={assignment.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Graded {format(new Date(assignment.submittedAt), "MMM dd, HH:mm")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/ta/assignments/${assignment.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {mockAssignments.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Assignments Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You haven't been assigned any submissions to grade yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Check back later or contact the admin for more information.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Tips */}
        <Card className="mt-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">
              Grading Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span>
                  Provide constructive feedback that helps students improve their work
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span>
                  Be specific about what needs revision and what was done well
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span>
                  Only mark "Require Resubmission" if substantial changes are needed
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span>
                  Upload feedback files (images, PDFs) to provide detailed comments
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
