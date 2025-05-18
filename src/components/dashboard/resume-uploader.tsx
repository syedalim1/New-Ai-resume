"use client";

import { ChangeEvent, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FileText,
  UploadCloud,
  X,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Download,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import ApiKeyConfig from "./api-key-config";

interface ResumeUploaderProps {
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  isLoading: boolean;
}

export default function ResumeUploader({
  selectedFiles,
  setSelectedFiles,
  isLoading,
}: ResumeUploaderProps) {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(true);
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<
    Array<{
      fileName: string;
      status: "success" | "error";
      message?: string;
      skills?: string[];
      experience?: string;
      education?: string;
    }>
  >([]);

  // Check if API key is configured - update when the component re-renders
  useEffect(() => {
    const checkApiKey = () => {
      const apiKey = localStorage.getItem("gemini-api-key");
      setHasCustomKey(!!apiKey);
      setApiKeyConfigured(true); // Always set to true since we have a default API key now
    };

    // Check initially
    checkApiKey();

    // Also add an event listener for storage changes to detect API key updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "gemini-api-key") {
        checkApiKey();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Custom event for direct updates in the same window
    const handleCustomEvent = () => checkApiKey();
    window.addEventListener("apiKeyUpdated", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("apiKeyUpdated", handleCustomEvent);
    };
  }, []);

  // Constants for validation
  const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
  const MAX_FILES = 3; // Maximum 3 files
  const ALLOWED_FILE_TYPES = ["application/pdf"];

  const validateFiles = (
    files: File[]
  ): { valid: File[]; invalid: { file: File; reason: string }[] } => {
    const valid: File[] = [];
    const invalid: { file: File; reason: string }[] = [];

    files.forEach((file) => {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        invalid.push({
          file,
          reason: "Invalid file type. Only PDF files are accepted.",
        });
      } else if (file.size > MAX_FILE_SIZE) {
        invalid.push({
          file,
          reason: `File too large. Maximum size is ${
            MAX_FILE_SIZE / (1024 * 1024)
          }MB.`,
        });
      } else {
        valid.push(file);
      }
    });

    return { valid, invalid };
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);

      // Check if adding these files would exceed the maximum
      if (selectedFiles.length + files.length > MAX_FILES) {
        toast({
          title: "Too Many Files",
          description: `You can upload a maximum of ${MAX_FILES} files at once.`,
          variant: "destructive",
        });
        return;
      }

      const { valid, invalid } = validateFiles(files);

      if (invalid.length > 0) {
        const errorMessages = invalid.map(
          (item) => `${item.file.name}: ${item.reason}`
        );

        toast({
          title: "Invalid Files",
          description: errorMessages.join("\n"),
          variant: "destructive",
        });
      }

      if (valid.length > 0) {
        setSelectedFiles(valid);
        setUploadComplete(false);
        setAnalysisResults([]);
        setUploadError(null);
      }
    } else {
      setSelectedFiles([]);
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setSelectedFiles(selectedFiles.filter((file) => file.name !== fileName));
    if (uploadComplete) {
      setAnalysisResults(
        analysisResults.filter((result) => result.fileName !== fileName)
      );
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one resume to upload.",
        variant: "destructive",
      });
      return;
    }

    const apiKey = localStorage.getItem("gemini-api-key");

    try {
      setUploadProgress(0);
      setUploadError(null);

      // Create FormData to send files
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("resumes", file);
      });

      // Add API key if available (optional now)
      if (apiKey) {
        formData.append("apiKey", apiKey);
        console.log("Using custom API key");
      } else {
        console.log("Using default API key");
      }

      // Set up upload progress tracking
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload-resume", true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress > 95 ? 95 : progress); // Cap at 95% until server processing completes
        }
      };

      // Create a promise to handle the XHR request
      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch (error) {
              console.error("Failed to parse response:", xhr.responseText);
              reject(new Error("Failed to parse server response"));
            }
          } else {
            // Try to parse error response if possible
            let errorMsg = `Server returned ${xhr.status}: ${xhr.statusText}`;
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              if (errorResponse.error) {
                errorMsg = errorResponse.error;
                if (errorResponse.message) {
                  errorMsg += ` - ${errorResponse.message}`;
                }
              }
            } catch (e) {
              // If we can't parse the error, use the default message
            }
            console.error("Server error:", errorMsg, xhr.responseText);
            reject(new Error(errorMsg));
          }
        };

        xhr.onerror = () => {
          console.error("Network error occurred");
          reject(new Error("Network error occurred"));
        };

        xhr.ontimeout = () => {
          console.error("Request timed out");
          reject(new Error("Request timed out"));
        };
      });

      // Send the request
      xhr.send(formData);

      // Wait for the upload to complete
      const data = await uploadPromise;

      setUploadProgress(100);
      setUploadComplete(true);

      // Use the results from the API
      setAnalysisResults(data.results);

      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${selectedFiles.length} resume${
          selectedFiles.length > 1 ? "s" : ""
        }.`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      let errorMessage =
        "There was an error uploading your resumes. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setUploadError(errorMessage);
      setUploadProgress(0);

      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Add function to export results as CSV
  const exportResultsToCSV = () => {
    if (analysisResults.length === 0) return;

    // Create CSV headers
    const headers = [
      "File Name",
      "Status",
      "Message",
      "Skills",
      "Experience",
      "Education",
    ];

    // Create CSV rows
    const rows = analysisResults.map((result) => [
      result.fileName,
      result.status,
      result.message || "",
      result.skills ? result.skills.join(", ") : "",
      result.experience || "",
      result.education || "",
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    // Set download attributes
    const date = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `resume-analysis-${date}.csv`);

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Results have been exported to CSV successfully.",
    });
  };

  const handleApiKeySaved = () => {
    // Trigger re-check of API key status
    setApiKeyConfigured(!!localStorage.getItem("gemini-api-key"));

    // Dispatch a custom event to notify any other components
    window.dispatchEvent(new Event("apiKeyUpdated"));
  };

  return (
    <div className="space-y-6">
      {/* <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          {hasCustomKey
            ? "Using your custom Gemini API key"
            : "Using default Gemini API key"}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (hasCustomKey) {
              localStorage.removeItem("gemini-api-key");
              setHasCustomKey(false);
              toast({
                title: "Using Default API Key",
                description: "Switched to using the default Gemini API key.",
              });
            } else {
              setApiKeyConfigured(false);
            }
          }}
          className="text-xs"
        >
          {hasCustomKey ? "Use Default API Key" : "Configure Custom API Key"}
        </Button>
      </div> */}

      {!apiKeyConfigured && (
        <div className="mb-6">
          <ApiKeyConfig onKeySaved={handleApiKeySaved} />
        </div>
      )}

      <Card className="shadow-xl border border-border max-w-2xl mx-auto">
        <CardHeader className="bg-muted p-6 rounded-t-md">
          <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-primary">
            <UploadCloud className="h-7 w-7" />
            Upload Resumes
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1">
            Select PDF files to analyze. Maximum {MAX_FILES} files,{" "}
            {MAX_FILE_SIZE / (1024 * 1024)}MB per file.
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
              disabled={isLoading || uploadProgress > 0}
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
                      ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveFile(file.name)}
                      disabled={isLoading || uploadProgress > 0}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {uploadProgress > 0 && !uploadComplete && (
            <div className="space-y-2">
              <div className="text-sm flex justify-between">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {analysisResults.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Analysis Results</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportResultsToCSV}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </Button>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {analysisResults.map((result, index) => (
                  <AccordionItem key={result.fileName} value={`item-${index}`}>
                    <AccordionTrigger className="flex items-center gap-2 px-4 py-2 rounded-md bg-card hover:bg-muted">
                      <div
                        className={`flex-1 flex items-center gap-2 ${
                          result.status === "error" ? "text-destructive" : ""
                        }`}
                      >
                        {result.status === "success" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-destructive" />
                        )}
                        <span className="font-medium">{result.fileName}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-2">
                      <div className="space-y-4">
                        <p>
                          {result.message ||
                            (result.status === "success"
                              ? "Successfully analyzed"
                              : "Failed to analyze")}
                        </p>

                        {result.status === "success" && (
                          <>
                            {result.skills && result.skills.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium mb-2">
                                  Skills
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {result.skills.map((skill) => (
                                    <Badge key={skill} variant="secondary">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {result.experience && (
                              <div>
                                <h5 className="text-sm font-medium mb-1">
                                  Experience
                                </h5>
                                <p className="text-sm">{result.experience}</p>
                              </div>
                            )}

                            {result.education && (
                              <div>
                                <h5 className="text-sm font-medium mb-1">
                                  Education
                                </h5>
                                <p className="text-sm">{result.education}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-muted/50 p-6 flex justify-between rounded-b-md">
          {analysisResults.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFiles([]);
                setAnalysisResults([]);
                setUploadComplete(false);
                setUploadError(null);
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Clear Results
            </Button>
          )}
         
        </CardFooter>
      </Card>
    </div>
  );
}
