"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import type { CandidateJobMatchOutput } from "@/ai/flows/candidate-job-match";
import { candidateJobMatch } from "@/ai/flows/candidate-job-match";
import { extractSkillsExperience } from "@/ai/flows/extract-skills-experience";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import custom components
import JobDetailsForm from "./job-details-form";
import ResumeUploader from "./resume-uploader";
import FilterControls from "./filter-controls";
import ResultsHeader from "./results-header";
import ResultsCardView from "./results-card-view";
import BatchActions from "./batch-actions";
import { RejectionDialog, NotesDialog } from "./resume-dialogs";

export interface AnalysisResult extends CandidateJobMatchOutput {
  candidateName: string;
  id: string;
  rejected?: boolean;
  rejectionReason?: string;
  favorite?: boolean;
  detailedNotes?: string;
  reviewDate?: string;
  status: "pending" | "reviewed" | "rejected" | "shortlisted";
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
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filterMinScore, setFilterMinScore] = useState<number>(0);
  const [showRejected, setShowRejected] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("score");
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(
    null
  );
  const [rejectionDialogOpen, setRejectionDialogOpen] =
    useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [detailedNotesDialogOpen, setDetailedNotesDialogOpen] =
    useState<boolean>(false);
  const [detailedNotes, setDetailedNotes] = useState<string>("");
  const [viewMode, setViewMode] = useState<"card" | "compare">("card");
  const [compareItems, setCompareItems] = useState<string[]>([]);

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
      const storedResults = localStorage.getItem("hireview-results");

      setJobTitle(storedJobTitle || defaultJobTitle);
      setJobDescription(storedJobDescription || defaultJobDescription);

      if (storedResults) {
        try {
          const parsedResults = JSON.parse(storedResults);
          setAnalysisResults(parsedResults);
        } catch (e) {
          console.error("Failed to parse stored results:", e);
        }
      }
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

  useEffect(() => {
    if (
      mounted &&
      typeof window !== "undefined" &&
      analysisResults.length > 0
    ) {
      localStorage.setItem("hireview-results", JSON.stringify(analysisResults));
    }
  }, [analysisResults, mounted]);

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
    // We don't clear existing results, we append new ones

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
            status: "pending",
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

        // Set status based on match score
        let initialStatus = "pending";
        if (matchOutput.matchScore >= 75) {
          initialStatus = "shortlisted";
        }

        results.push({
          ...matchOutput,
          candidateName,
          id: resumeId,
          status: initialStatus as
            | "pending"
            | "reviewed"
            | "rejected"
            | "shortlisted",
          reviewDate: new Date().toISOString(),
        });
      }

      // Sort results and append to existing results
      results.sort((a, b) => b.matchScore - a.matchScore);

      // Deduplicate by file name before adding
      const newResults = [...analysisResults];
      for (const result of results) {
        if (!newResults.some((r) => r.candidateName === result.candidateName)) {
          newResults.push(result);
        }
      }

      setAnalysisResults(newResults);
      setSelectedFiles([]); // Clear selected files after analysis
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

  const handleRejectResume = (result: AnalysisResult) => {
    setSelectedResult(result);
    setRejectionReason("");
    setRejectionDialogOpen(true);
  };

  const confirmRejection = () => {
    if (!selectedResult) return;

    setAnalysisResults((prev) =>
      prev.map((item) =>
        item.id === selectedResult.id
          ? {
              ...item,
              rejected: true,
              rejectionReason: rejectionReason || "Not a good fit for the role",
              status: "rejected",
            }
          : item
      )
    );

    setRejectionDialogOpen(false);
    toast({
      title: "Resume Rejected",
      description: `${selectedResult.candidateName} has been moved to rejected resumes.`,
      variant: "default",
    });
  };

  const handleAddNotes = (result: AnalysisResult) => {
    setSelectedResult(result);
    setDetailedNotes(result.detailedNotes || "");
    setDetailedNotesDialogOpen(true);
  };

  const saveDetailedNotes = () => {
    if (!selectedResult) return;

    setAnalysisResults((prev) =>
      prev.map((item) =>
        item.id === selectedResult.id
          ? {
              ...item,
              detailedNotes: detailedNotes,
              status: "reviewed",
            }
          : item
      )
    );

    setDetailedNotesDialogOpen(false);
    toast({
      title: "Notes Saved",
      description: `Detailed notes added for ${selectedResult.candidateName}.`,
      variant: "default",
    });
  };

  const handleToggleFavorite = (result: AnalysisResult) => {
    setAnalysisResults((prev) =>
      prev.map((item) =>
        item.id === result.id
          ? {
              ...item,
              favorite: !item.favorite,
              status: !item.favorite
                ? "shortlisted"
                : item.rejected
                ? "rejected"
                : "pending",
            }
          : item
      )
    );
  };

  const handleToggleCompare = (id: string) => {
    setCompareItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id].slice(-2)
    );
  };

  const clearAllResults = () => {
    if (
      confirm(
        "Are you sure you want to clear all results? This action cannot be undone."
      )
    ) {
      setAnalysisResults([]);
      localStorage.removeItem("hireview-results");
      setCompareItems([]);
      toast({
        title: "Results Cleared",
        description: "All resume analysis results have been cleared.",
        variant: "default",
      });
    }
  };

  const exportResults = () => {
    const data = JSON.stringify(analysisResults, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `resume-analysis-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.href = url;
    link.click();
  };

  const filteredResults = analysisResults.filter((result) => {
    // Filter by score
    if (result.matchScore < filterMinScore) return false;

    // Filter rejected status if showRejected is false
    if (!showRejected && result.status === "rejected") return false;

    return true;
  });

  // Sort results
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === "name")
      return a.candidateName.localeCompare(b.candidateName);
    if (sortBy === "date") {
      const dateA = a.reviewDate || "";
      const dateB = b.reviewDate || "";
      return dateB.localeCompare(dateA); // newest first
    }
    // Default: sort by score
    return b.matchScore - a.matchScore;
  });

  // Results for comparison view
  const compareResults = sortedResults.filter((r) =>
    compareItems.includes(r.id)
  );

  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // BatchActions Button for FilterControls
  const batchActionsButton =
    sortedResults.length > 0 && compareItems.length > 0 ? (
      <BatchActions
        selectedItems={compareItems}
        setRejectionReason={setRejectionReason}
        setResults={setAnalysisResults}
        clearSelection={() => setCompareItems([])}
      />
    ) : null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <JobDetailsForm
          jobTitle={jobTitle}
          jobDescription={jobDescription}
          isLoading={isLoading}
          setJobTitle={setJobTitle}
          setJobDescription={setJobDescription}
        />

        <ResumeUploader
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          isLoading={isLoading}
        />
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
        <>
          <ResultsHeader
            resultsCount={analysisResults.length}
            onExport={exportResults}
            onClear={clearAllResults}
          />

          <FilterControls
            filterMinScore={filterMinScore}
            setFilterMinScore={setFilterMinScore}
            showRejected={showRejected}
            setShowRejected={setShowRejected}
            batchActionsButton={batchActionsButton}
          />

          <ResultsCardView
            results={sortedResults}
            compareItems={compareItems}
            handleToggleCompare={handleToggleCompare}
            handleToggleFavorite={handleToggleFavorite}
            handleAddNotes={handleAddNotes}
            handleRejectResume={handleRejectResume}
          />
        </>
      )}

      {/* Dialogs */}
      <RejectionDialog
        open={rejectionDialogOpen}
        setOpen={setRejectionDialogOpen}
        selectedResult={selectedResult}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onConfirm={confirmRejection}
      />

      <NotesDialog
        open={detailedNotesDialogOpen}
        setOpen={setDetailedNotesDialogOpen}
        selectedResult={selectedResult}
        detailedNotes={detailedNotes}
        setDetailedNotes={setDetailedNotes}
        onSave={saveDetailedNotes}
      />
    </div>
  );
}

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
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}
