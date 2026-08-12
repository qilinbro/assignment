"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, BarChart3, Calendar, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data - in a real app, this would come from API
const mockAssignments = [
  {
    id: "assignment-week-1",
    title: "Week 1 Homework",
    deadline: "2026-08-20T23:59:59",
    totalSubmissions: 86,
    completedGrading: 62,
    pendingGrading: 24,
    resubmissions: 3,
    gradingProgress: 72,
  },
  {
    id: "assignment-week-2",
    title: "Week 2 Homework",
    deadline: "2026-09-01T23:59:59",
    totalSubmissions: 93,
    completedGrading: 38,
    pendingGrading: 55,
    resubmissions: 1,
    gradingProgress: 41,
  },
  {
    id: "assignment-week-3",
    title: "Week 3 Homework",
    deadline: "2026-08-15T23:59:59",
    totalSubmissions: 45,
    completedGrading: 12,
    pendingGrading: 33,
    resubmissions: 0,
    gradingProgress: 27,
  },
];

const mockStats = {
  totalAssignments: 3,
  totalSubmissions: 224,
  pendingGrading: 112,
  completedGrading: 112,
  pendingResubmissions: 4,
};

export default function AdminDashboard() {
  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const passed = isDeadlinePassed(deadline);
    return (
      <span className={passed ? "text-destructive" : ""}>
        {date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
        {passed && " (Past)"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage assignments and view statistics</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/assignments/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assignment
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Assignments</CardDescription>
              <CardTitle className="text-3xl">{mockStats.totalAssignments}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                Active assignments
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Submissions</CardDescription>
              <CardTitle className="text-3xl">{mockStats.totalSubmissions}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                Student submissions
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
                Awaiting TA review
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed Grading</CardDescription>
              <CardTitle className="text-3xl">{mockStats.completedGrading}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 mr-1" />
                Finished grading
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Resubmissions</CardDescription>
              <CardTitle className="text-3xl">{mockStats.pendingResubmissions}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mr-1" />
                Need attention
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Assignments</CardTitle>
                <CardDescription>Manage and monitor all assignments</CardDescription>
              </div>
              <Badge variant="secondary">{mockAssignments.length} assignments</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Assignment</th>
                    <th className="text-left p-4 font-medium">Deadline</th>
                    <th className="text-center p-4 font-medium">Submissions</th>
                    <th className="text-center p-4 font-medium">Grading Progress</th>
                    <th className="text-center p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockAssignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{assignment.title}</div>
                          <div className="text-sm text-muted-foreground">{assignment.id}</div>
                        </div>
                      </td>
                      <td className="p-4">{formatDeadline(assignment.deadline)}</td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-medium">{assignment.totalSubmissions}</span>
                          <span className="text-xs text-muted-foreground">
                            {assignment.resubmissions} resubmissions
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${assignment.gradingProgress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{assignment.gradingProgress}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground text-center mt-1">
                          {assignment.completedGrading} / {assignment.totalSubmissions * 2}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {isDeadlinePassed(assignment.deadline) ? (
                          <Badge variant="destructive">Closed</Badge>
                        ) : (
                          <Badge variant="default">Open</Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/assignments/${assignment.id}`}>
                            <Button variant="outline" size="sm">
                              <BarChart3 className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest submissions and grading updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Student A submitted Week 1 Homework</span>
                  <span className="text-muted-foreground ml-auto">2m ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>TA 01 completed grading for Student B</span>
                  <span className="text-muted-foreground ml-auto">15m ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Student C requested resubmission</span>
                  <span className="text-muted-foreground ml-auto">1h ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>TA Performance</CardTitle>
              <CardDescription>Grading completion by TA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>TA 01</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: "85%" }} />
                    </div>
                    <span className="font-medium">85%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>TA 02</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: "72%" }} />
                    </div>
                    <span className="font-medium">72%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>TA 03</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: "45%" }} />
                    </div>
                    <span className="font-medium">45%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Overall system health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Active TAs</span>
                  <Badge variant="secondary">5 online</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Active Students</span>
                  <Badge variant="secondary">12 active</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>System Load</span>
                  <Badge variant="default">Normal</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
