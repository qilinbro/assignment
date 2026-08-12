"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Star, Upload, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImagePreview } from "@/components/submission/image-preview";
import { FileUpload } from "@/components/submission/file-upload";
import { Badge } from "@/components/ui/badge";
import { AIAssistant } from "@/components/ta/ai-assistant";
import type { AIAnalysisResult } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

// Mock data
const mockSubmission = {
  id: "submission-3",
  assignmentId: "assignment-week-1",
  assignmentTitle: "Week 1 Homework",
  studentId: "student-3",
  studentName: "Student C",
  submittedAt: "2024-08-12T15:00:00",
  files: [
    {
      id: "file-3",
      url: "/uploads/submission-3-1.png",
      fileName: "exercise.png",
      fileType: "image/png",
      size: 1536000,
    },
  ],
  status: "GRADING",
};

const mockAssignmentId = "sa-5";

export default function TAGradingPage() {
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [score, setScore] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [requireResubmission, setRequireResubmission] = React.useState(false);
  const [feedbackFiles, setFeedbackFiles] = React.useState<File[]>([]);

  const handleApplyAIAnalysis = (analysis: AIAnalysisResult) => {
    setScore(analysis.suggestedScore.toString());
    setComment(analysis.suggestedComments);
    setRequireResubmission(analysis.requiresResubmission);
  };

  const handleSubmit = async () => {
    if (!score && !comment.trim()) {
      alert("Please provide either a score or a comment");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Submitting grading:", {
      submissionAssignmentId: params.id,
      score: parseInt(score) || undefined,
      comment,
      requireResubmission,
      feedbackFiles: feedbackFiles.length,
    });

    // In a real app, we would:
    // 1. Upload feedback files
    // 2. Submit grading via API
    // 3. Redirect back to dashboard

    setIsSubmitting(false);
    router.push("/ta");
  };

  const handleDownload = async () => {
    // Simulate download
    console.log("Downloading submission files");
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
              onClick={() => router.push("/ta")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold">Grade Submission</h1>
                <Badge variant="outline">{mockSubmission.assignmentTitle}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {mockSubmission.studentName} • Submitted{" "}
                {format(new Date(mockSubmission.submittedAt), "MMM dd, yyyy 'at' HH:mm")}
              </p>
            </div>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download Files
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Student Submission */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Submission</CardTitle>
                <CardDescription>
                  Review the student's uploaded work
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImagePreview files={mockSubmission.files} />
              </CardContent>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100 text-base">
                  Grading Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-900 dark:text-blue-100">
                <ul className="space-y-2">
                  <li>• Review all uploaded files carefully</li>
                  <li>• Provide specific, constructive feedback</li>
                  <li>• Score fairly based on assignment criteria</li>
                  <li>• Only require resubmission if necessary</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Grading Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit Grading</CardTitle>
                <CardDescription>
                  Enter your score, comments, and upload feedback files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Score */}
                <div className="space-y-2">
                  <Label htmlFor="score">Score (0-100)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="score"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Enter score"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      className="max-w-32"
                    />
                    <div className="flex gap-1">
                      {[0, 25, 50, 75, 100].map((preset) => (
                        <Button
                          key={preset}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setScore(preset.toString())}
                        >
                          {preset}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div className="space-y-2">
                  <Label htmlFor="comment">Grading Comments</Label>
                  <Textarea
                    id="comment"
                    placeholder="Enter your feedback for the student..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide specific feedback on what was done well and what needs improvement
                  </p>
                </div>

                {/* Require Resubmission */}
                <div className="space-y-2">
                  <Label>Require Resubmission?</Label>
                  <Select
                    value={requireResubmission ? "yes" : "no"}
                    onValueChange={(value) => setRequireResubmission(value === "yes")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No, the work is satisfactory</SelectItem>
                      <SelectItem value="yes">Yes, requires revision</SelectItem>
                    </SelectContent>
                  </Select>
                  {requireResubmission && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      The student will need to submit a revised version
                    </p>
                  )}
                </div>

                {/* Feedback Files Upload */}
                <div className="space-y-2">
                  <Label>Upload Feedback Files (Optional)</Label>
                  <FileUpload
                    onFilesChange={setFeedbackFiles}
                    maxFiles={5}
                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                    maxSizeMB={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload annotated images, PDFs, or other feedback documents
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/ta")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Submitting..." : "Submit Grading"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Score Buttons */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 21 }, (_, i) => i * 5).map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={score === value.toString() ? "default" : "outline"}
                      size="sm"
                      onClick={() => setScore(value.toString())}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Assistant */}
          <div className="lg:col-span-1">
            <AIAssistant
              submissionId={mockSubmission.id}
              assignmentTitle={mockSubmission.assignmentTitle}
              studentFiles={mockSubmission.files}
              onApplyAnalysis={handleApplyAIAnalysis}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
