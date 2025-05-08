"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import type { CandidateJobMatchOutput } from "@/ai/flows/candidate-job-match";
import { candidateJobMatch } from "@/ai/flows/candidate-job-match";
import { extractSkillsExperience } from "@/ai/flows/extract-skills-experience";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Briefcase,
  AlertCircle,
  UploadCloud,
  FileText,
} from "lucide-react";
import ResultCard from "./result-card";
import { useToast } from "@/hooks/use-toast";

export interface AnalysisResult extends CandidateJobMatchOutput {
  candidateName: string;
  id: string;
}

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function HireViewDashboard() {
  const [jobTitle, setJobTitle] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const defaultJobTitle = "Senior Software Engineer";
    const defaultJobDescription =
      "Seeking a Senior Software Engineer with expertise in React, Node.js, and cloud platforms. Strong problem-solving skills and team collaboration are essential.";

    if (typeof window !== "undefined") {
      const storedJobTitle = localStorage.getItem("hireview-jobTitle");
      const storedJobDescription = localStorage.getItem(
        "hireview-jobDescription"
      );

      setJobTitle(storedJobTitle || defaultJobTitle);
      setJobDescription(storedJobDescription || defaultJobDescription);
    } else {
      setJobTitle(defaultJobTitle);
      setJobDescription(defaultJobDescription);
    }
  }, []);

  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      localStorage.setItem("hireview-jobTitle", jobTitle);
    }
  }, [jobTitle, mounted]);

  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      localStorage.setItem("hireview-jobDescription", jobDescription);
    }
  }, [jobDescription, mounted]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const pdfFiles = files.filter((file) => file.type === "application/pdf");
      if (pdfFiles.length !== files.length) {
        toast({
          title: "Invalid File Type",
          description:
            "Only PDF files are accepted. Non-PDF files have been filtered out.",
          variant: "destructive",
        });
      }
      setSelectedFiles(pdfFiles);
    } else {
      setSelectedFiles([]);
    }
  };

  const handleAnalyze = async () => {
    if (!jobTitle.trim()) {
      setError("Job title cannot be empty.");
      toast({
        title: "Validation Error",
        description: "Job title cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    if (!jobDescription.trim()) {
      setError("Job description cannot be empty.");
      toast({
        title: "Validation Error",
        description: "Job description cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    if (selectedFiles.length === 0) {
      setError("No resume files selected.");
      toast({
        title: "Validation Error",
        description: "Please select at least one PDF resume file.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResults([]);

    const fullJobDescription = `Job Title: ${jobTitle}\n\nJob Description:\n${jobDescription}`;
    const results: AnalysisResult[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const candidateName = file.name;
        const resumeId =
          Date.now().toString() +
          Math.random().toString(36).substring(2, 7) +
          i.toString();

        toast({
          title: `Processing ${candidateName}`,
          description: "Extracting text and analyzing match...",
        });

        let resumeText: string;
        try {
          const resumeDataUri = await fileToDataUri(file);
          const extractionOutput = await extractSkillsExperience({
            resumeDataUri,
          });
          if (
            !extractionOutput.fullText ||
            extractionOutput.fullText.trim().length < 10
          ) {
            // Stricter check
            throw new Error(
              "Extracted text from PDF is too short or empty. The document might be an image-only PDF or corrupted."
            );
          }
          resumeText = extractionOutput.fullText;
        } catch (extractionError) {
          console.error(
            `Error extracting text from ${candidateName}:`,
            extractionError
          );
          const specificMessage =
            extractionError instanceof Error
              ? extractionError.message
              : "Failed to process PDF file.";
          results.push({
            candidateName,
            id: resumeId,
            matchScore: 0,
            insights: `Error processing resume: ${specificMessage}`,
            missingSkills: [],
            topSkills: [],
          });
          toast({
            title: `Error processing ${candidateName}`,
            description: specificMessage,
            variant: "destructive",
          });
          continue; // Skip to next file
        }

        const matchOutput = await candidateJobMatch({
          resumeText: resumeText,
          jobDescription: fullJobDescription,
        });
        results.push({ ...matchOutput, candidateName, id: resumeId });
      }

      results.sort((a, b) => b.matchScore - a.matchScore);
      setAnalysisResults(results);
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${results.length} resume(s).`,
        variant: "default",
      });
    } catch (err) {
      console.error("AI Analysis Error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown error occurred during AI analysis.";
      setError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Briefcase className="h-6 w-6 text-primary" />
              Job Details
            </CardTitle>
            <CardDescription>
              Enter the job title and description.
            </CardDescription>
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
                placeholder="Enter job title..."
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="text-sm"
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
                placeholder="Paste job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8}
                className="text-sm resize-none"
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border border-border max-w-2xl mx-auto">
          <CardHeader className="bg-muted p-6 rounded-t-md">
            <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-primary">
              <UploadCloud className="h-7 w-7" />
              Upload Resumes
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Select one or more PDF files to analyze.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            <label
              htmlFor="resumeFiles"
              className="block w-full cursor-pointer border border-dashed border-primary/50 rounded-md p-6 text-center hover:bg-primary/5 transition-colors"
            >
              <Input
                id="resumeFiles"
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading}
              />
              <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                <UploadCloud className="h-10 w-10 text-primary" />
                <span>Click or drag files to upload</span>
              </div>
            </label>

            {selectedFiles.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Selected Files:</h4>
                <ul className="bg-muted/40 p-3 rounded-md max-h-40 overflow-y-auto border border-muted shadow-inner text-sm text-muted-foreground space-y-2">
                  {selectedFiles.map((file) => (
                    <li key={file.name} className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="truncate">{file.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button
          onClick={handleAnalyze}
          size="lg"
          disabled={isLoading || selectedFiles.length === 0}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <SparkleIcon className="mr-2 h-5 w-5" />
          )}
          Analyze Resumes
        </Button>
      </div>

      {error && (
        <Card className="bg-destructive/10 border-destructive shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {analysisResults.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-center text-foreground">
            Analysis Results
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysisResults.map((result) => (
              <ResultCard key={result.id} result={result} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Keep SparkleIcon as it's used in the button
function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.93 13.5A2.5 2.5 0 0 0 12 16a2.5 2.5 0 0 0 2.07-2.5A2.5 2.5 0 0 0 12 11a2.5 2.5 0 0 0-2.07 2.5Z" />
      <path d="M12 3v2" />
      <path d="M21 12h-2" />
      <path d="M12 21v-2" />
      <path d="M3 12H1" />
      <path d="m18.36 5.64-.9.9M5.64 18.36-.9.9M18.36 18.36l-1.41-1.41M6.54 5.64l.9.9" />
    </svg>
  );
}
