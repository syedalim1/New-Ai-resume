"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase } from "lucide-react";

interface JobDetailsFormProps {
  jobTitle: string;
  jobDescription: string;
  isLoading: boolean;
  setJobTitle: (title: string) => void;
  setJobDescription: (description: string) => void;
}

export default function JobDetailsForm({
  jobTitle,
  jobDescription,
  isLoading,
  setJobTitle,
  setJobDescription,
}: JobDetailsFormProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Briefcase className="h-6 w-6 text-primary" />
          Job Details
        </CardTitle>
        <CardDescription>Enter the job title and description.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label
            htmlFor="jobTitle"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Job Title
          </label>
          <Input
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g., Senior Software Engineer"
            disabled={isLoading}
          />
        </div>
        <div>
          <label
            htmlFor="jobDescription"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Job Description
          </label>
          <Textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Enter the full job description..."
            className="min-h-32 resize-y"
            disabled={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
