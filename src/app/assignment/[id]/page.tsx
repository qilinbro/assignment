"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, Calendar, User, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/submission/file-upload";
import { StatusBadge } from "@/components/assignment/status-badge";
import { format } from "date-fns";

// Mock assignment data - in a real app, this would come from an API
const mockAssignment = {
  id: "assignment-week-1",
  title: "Week 1 Homework",
  description: `Complete the following exercises:

1. Read Chapter 1 and answer the comprehension questions
2. Write a 200-word reflection on the key concepts
3. Complete the practice problems at the end of the chapter

Submit your work as clear images or PDFs. Ensure all text is readable.`,
  deadline: "2026-08-20T23:59:59",
  allowResubmission: true,
  resubmissionDescription: "Please explain what you revised based on the TA feedback",
};

export default function AssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [hasSubmitted, setHasSubmitted] = React.useState(false);
  const [submission, setSubmission] = React.useState({
    id: "submission-1",
    status: "COMPLETED" as const,
    submittedAt: "2024-08-12T14:20:00",
  });

  const isDeadlinePassed = new Date(mockAssignment.deadline) < new Date();

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      alert("Please upload at least one file");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Submitting files:", uploadedFiles);

    // In a real app, we would:
    // 1. Upload files to storage
    // 2. Create submission via API
    // 3. Redirect to success page

    setHasSubmitted(true);
    setSubmission({
      id: `submission-${Date.now()}`,
      status: "SUBMITTED",
      submittedAt: new Date().toISOString(),
    });

    setIsSubmitting(false);
  };

  const canShowResubmissionButton =
    isDeadlinePassed &&
    mockAssignment.allowResubmission &&
    submission.status === "RESUBMISSION_REQUIRED";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline" className="mb-2">Assignment</Badge>
              <h1 className="text-2xl font-bold">{mockAssignment.title}</h1>
              <p className="text-sm text-muted-foreground">{mockAssignment.id}</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Assignment Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Assignment Details</CardTitle>
                  <CardDescription>Review the requirements before submitting</CardDescription>
                </div>
                {hasSubmitted ? (
                  <StatusBadge status={submission.status} />
                ) : isDeadlinePassed ? (
                  <Badge variant="destructive">Closed</Badge>
                ) : (
                  <Badge variant="default">Open</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-line">{mockAssignment.description}</p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Deadline:</span>
                  <span className={isDeadlinePassed ? "text-destructive font-medium" : ""}>
                    {format(new Date(mockAssignment.deadline), "MMM dd, yyyy 'at' HH:mm")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {mockAssignment.allowResubmission ? "Resubmissions allowed" : "No resubmissions"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Status */}
          {hasSubmitted && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <CardTitle className="text-green-900 dark:text-green-100">
                      Submission Successful
                    </CardTitle>
                    <CardDescription className="text-green-700 dark:text-green-300">
                      Your assignment has been submitted and is awaiting TA review
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Submission ID:</span>
                    <span className="font-mono">{submission.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Submitted at:</span>
                    <span>{format(new Date(submission.submittedAt), "MMM dd, yyyy 'at' HH:mm")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Files uploaded:</span>
                    <span>{uploadedFiles.length} file(s)</span>
                  </div>
                </div>

                {submission.status === "COMPLETED" && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Feedback
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submission Form */}
          {!hasSubmitted && !isDeadlinePassed && (
            <Card>
              <CardHeader>
                <CardTitle>Submit Assignment</CardTitle>
                <CardDescription>
                  Upload your assignment files (JPG, PNG, WEBP - max 10MB each)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <FileUpload
                    onFilesChange={setUploadedFiles}
                    maxFiles={10}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    maxSizeMB={10}
                  />

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Submission Guidelines:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Ensure all images are clear and readable</li>
                      <li>• Use proper lighting when taking photos</li>
                      <li>• Include all pages of your work</li>
                      <li>• Double-check before submitting</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || uploadedFiles.length === 0}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Assignment"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Deadline Passed Message */}
          {!hasSubmitted && isDeadlinePassed && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-amber-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                      Submission Deadline Passed
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                      The submission period for this assignment has ended. Normal submissions are
                      no longer accepted.
                      {mockAssignment.allowResubmission &&
                        " If you have been asked to resubmit, use the resubmission channel."}
                    </p>
                    {canShowResubmissionButton && (
                      <Button
                        onClick={() => router.push(`/assignment/${params.id}/resubmit`)}
                        variant="outline"
                      >
                        Submit Resubmission
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Submission with Feedback */}
          {hasSubmitted && submission.status === "COMPLETED" && (
            <Card>
              <CardHeader>
                <CardTitle>Grading Results</CardTitle>
                <CardDescription>Feedback from your assigned TAs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* TA 1 Feedback */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">TA 01</span>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Score: 85
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      The solution to Question 1 is correct. Please revise Questions 2 and 3 for
                      better clarity.
                    </p>
                    <Button variant="outline" size="sm">
                      View Feedback Files
                    </Button>
                  </div>

                  {/* TA 2 Feedback */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">TA 03</span>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Score: 90
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Good work overall. Clear explanations and well-structured answers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
