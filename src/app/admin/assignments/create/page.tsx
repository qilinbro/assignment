"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock TAs - in a real app, this would come from an API
const mockTAs = [
  { id: "ta-1", name: "TA 01" },
  { id: "ta-2", name: "TA 02" },
  { id: "ta-3", name: "TA 03" },
  { id: "ta-4", name: "TA 04" },
  { id: "ta-5", name: "TA 05" },
];

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedTAs, setSelectedTAs] = React.useState<string[]>([]);

  const toggleTA = (taId: string) => {
    setSelectedTAs((prev) =>
      prev.includes(taId) ? prev.filter((id) => id !== taId) : [...prev, taId]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const assignmentData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      deadline: new Date(formData.get("deadline") as string),
      taIds: selectedTAs,
      taCount: parseInt(formData.get("taCount") as string),
      allowResubmission: formData.get("allowResubmission") === "true",
      resubmissionDescription: formData.get("resubmissionDescription") as string,
      createdBy: "admin-1", // In a real app, this would come from auth
    };

    // Validate
    if (!assignmentData.title || !assignmentData.deadline) {
      alert("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    if (selectedTAs.length === 0) {
      alert("Please select at least one TA");
      setIsSubmitting(false);
      return;
    }

    if (assignmentData.taCount > selectedTAs.length) {
      alert("TA count cannot exceed the number of selected TAs");
      setIsSubmitting(false);
      return;
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Creating assignment:", assignmentData);

    // In a real app, we would call the API
    // const result = await assignmentService.createAssignment(assignmentData);

    setIsSubmitting(false);
    router.push("/admin");
  };

  const getMinDeadline = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Create Assignment</h1>
              <p className="text-sm text-muted-foreground">
                Set up a new assignment with TA allocation
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the basic details for this assignment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Assignment Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Week 3 Homework"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter assignment instructions..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="datetime-local"
                    min={getMinDeadline()}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Students will not be able to submit after this time
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* TA Selection */}
            <Card>
              <CardHeader>
                <CardTitle>TA Allocation</CardTitle>
                <CardDescription>
                  Select participating TAs and set allocation count
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Participating TAs *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {mockTAs.map((ta) => (
                      <button
                        key={ta.id}
                        type="button"
                        onClick={() => toggleTA(ta.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedTAs.includes(ta.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="font-medium">{ta.name}</div>
                        <div className="text-sm text-muted-foreground">{ta.id}</div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedTAs.length} TA(s) selected
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taCount">Number of TAs per submission *</Label>
                  <Select name="taCount" defaultValue="2" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 TA per submission</SelectItem>
                      <SelectItem value="2">2 TAs per submission</SelectItem>
                      <SelectItem value="3">3 TAs per submission</SelectItem>
                      <SelectItem value="4">4 TAs per submission</SelectItem>
                      <SelectItem value="5">5 TAs per submission</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Each submission will be randomly assigned to this many TAs
                  </p>
                </div>

                {selectedTAs.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>Allocation summary:</strong> Each student submission will be
                      randomly assigned to <strong>2</strong> TAs from the{" "}
                      <strong>{selectedTAs.length}</strong> selected TAs.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resubmission Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Resubmission Settings</CardTitle>
                <CardDescription>
                  Configure resubmission permissions and instructions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="allowResubmission">Allow Resubmission</Label>
                  <Select name="allowResubmission" defaultValue="true">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes, allow resubmissions</SelectItem>
                      <SelectItem value="false">No, do not allow resubmissions</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Students can submit revised work if TAs require it
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resubmissionDescription">
                    Resubmission Instructions
                  </Label>
                  <Textarea
                    id="resubmissionDescription"
                    name="resubmissionDescription"
                    placeholder="Explain what students should include in their resubmission..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    These instructions will be shown to students when they resubmit
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Link href="/admin">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Creating..." : "Create Assignment"}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
