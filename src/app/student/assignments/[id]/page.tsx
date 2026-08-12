"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImagePreview } from "@/components/submission/image-preview";
import { StatusBadge } from "@/components/assignment/status-badge";
import { format } from "date-fns";

// Mock data
const mockSubmission = {
  id: "submission-1",
  assignmentId: "assignment-week-1",
  assignmentTitle: "Week 1 Homework",
  studentId: "student-1",
  submittedAt: "2024-08-12T14:20:00",
  status: "COMPLETED",
  files: [
    {
      id: "file-1",
      url: "/uploads/submission-1-1.jpg",
      fileName: "homework.jpg",
      fileType: "image/jpeg",
      size: 1024000,
    },
  ],
};

const mockFeedback = [
  {
    id: "feedback-1",
    taName: "TA 01",
    score: 85,
    comment:
      "The solution to Question 1 is correct. Please revise Questions 2 and 3 for better clarity.",
    requireResubmission: false,
    files: [],
  },
  {
    id: "feedback-2",
    taName: "TA 03",
    score: 90,
    comment: "Good work overall. Clear explanations and well-structured answers.",
    requireResubmission: false,
    files: [],
  },
];

export default function StudentAssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/student")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Assignment Details</h1>
              <p className="text-sm text-muted-foreground">{mockSubmission.assignmentTitle}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Submission Status */}
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                    Submission Completed
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your assignment has been graded and feedback is available
                  </p>
                </div>
                <StatusBadge status={mockSubmission.status} />
              </div>
            </CardContent>
          </Card>

          {/* Submission Info */}
          <Card>
            <CardHeader>
              <CardTitle>Submission Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Submitted by:</span>
                  <span className="font-medium">Student A</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Submitted at:</span>
                  <span className="font-medium">
                    {format(new Date(mockSubmission.submittedAt), "MMM dd, yyyy 'at' HH:mm")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submitted Files */}
          <Card>
            <CardHeader>
              <CardTitle>Your Submission</CardTitle>
              <CardDescription>Files you uploaded for this assignment</CardDescription>
            </CardHeader>
            <CardContent>
              <ImagePreview files={mockSubmission.files} />
            </CardContent>
          </Card>

          {/* TA Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Grading Results</CardTitle>
              <CardDescription>
                Feedback from {mockFeedback.length} Teaching Assistant(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockFeedback.map((feedback) => (
                  <div key={feedback.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{feedback.taName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Teaching Assistant</p>
                      </div>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {feedback.score}/100
                      </Badge>
                    </div>
                    <p className="text-sm mb-3">{feedback.comment}</p>
                    {feedback.requireResubmission && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          <strong>Resubmission Required:</strong> Please revise based on the
                          feedback provided.
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Average Score */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Average Score</span>
                    <Badge variant="default" className="text-lg px-3 py-1">
                      {(mockFeedback.reduce((acc, f) => acc + f.score, 0) / mockFeedback.length).toFixed(1)}/100
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push("/student")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
