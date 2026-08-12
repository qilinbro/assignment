"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/submission/file-upload";
import { StatusBadge } from "@/components/assignment/status-badge";
import { format } from "date-fns";

// Mock data
const mockAssignment = {
  id: "assignment-week-1",
  title: "Week 1 Homework",
  allowResubmission: true,
  resubmissionDescription: "Please explain what you revised based on the TA feedback",
  deadline: "2026-08-20T23:59:59",
};

const mockOriginalSubmission = {
  id: "submission-2",
  submittedAt: "2024-08-12T14:35:00",
  status: "RESUBMISSION_REQUIRED",
  files: [
    { id: "file-1", url: "/uploads/submission-2-1.jpg", fileName: "homework.jpg" },
  ],
};

const mockFeedback = [
  {
    taId: "ta-2",
    taName: "TA 02",
    score: 78,
    comment: "Some concepts need clarification. Please review the feedback and resubmit.",
    requireResubmission: true,
  },
];

export default function ResubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [resubmissionReason, setResubmissionReason] = React.useState("");

  if (!mockAssignment.allowResubmission) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Resubmissions Not Allowed</h2>
              <p className="text-sm text-muted-foreground mb-4">
                This assignment does not allow resubmissions.
              </p>
              <Button onClick={() => router.push("/")}>Back to Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      alert("Please upload at least one file");
      return;
    }

    if (!resubmissionReason.trim()) {
      alert("Please provide a reason for resubmission");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Resubmission data:", {
      files: uploadedFiles,
      reason: resubmissionReason,
    });

    // In a real app, we would:
    // 1. Upload files to storage
    // 2. Create resubmission via API
    // 3. Redirect to confirmation page

    setIsSubmitting(false);
    router.push(`/assignment/${params.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/assignment/${params.id}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <Badge variant="outline" className="mb-2">Resubmission</Badge>
              <h1 className="text-2xl font-bold">{mockAssignment.title}</h1>
              <p className="text-sm text-muted-foreground">{mockAssignment.id}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Original Submission Info */}
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
            <CardHeader>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-amber-600 mt-1" />
                <div>
                  <CardTitle className="text-amber-900 dark:text-amber-100">
                    Resubmission Required
                  </CardTitle>
                  <CardDescription className="text-amber-700 dark:text-amber-300">
                    Your original submission requires revisions based on TA feedback
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Original submission:</p>
                <p className="font-medium">
                  {format(new Date(mockOriginalSubmission.submittedAt), "MMM dd, yyyy 'at' HH:mm")}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">TA Feedback:</p>
                {mockFeedback.map((feedback) => (
                  <div key={feedback.taId} className="border rounded-lg p-3 bg-background">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{feedback.taName}</span>
                      <Badge variant="outline" className="text-sm">
                        Score: {feedback.score}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                  </div>
                ))}
              </div>

              {mockAssignment.resubmissionDescription && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Resubmission Guidelines:</p>
                  <p className="text-sm text-muted-foreground">
                    {mockAssignment.resubmissionDescription}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resubmission Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Submit Resubmission
              </CardTitle>
              <CardDescription>
                Upload your revised work and explain the changes made
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Reason for Resubmission */}
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Resubmission *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Explain what you revised based on the TA feedback..."
                    value={resubmissionReason}
                    onChange={(e) => setResubmissionReason(e.target.value)}
                    rows={4}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Describe how you addressed the TA's comments and what changes you made
                  </p>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label>Upload Revised Assignment *</Label>
                  <FileUpload
                    onFilesChange={setUploadedFiles}
                    maxFiles={10}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    maxSizeMB={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload your revised assignment files (JPG, PNG, WEBP - max 10MB each)
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || uploadedFiles.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? "Submitting..." : "Submit Resubmission"}
                </Button>

                {/* Notice */}
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Note:</strong> Your resubmission will be reviewed by the same TAs who
                    graded your original submission. The original submission and feedback will be
                    preserved in the system history.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
