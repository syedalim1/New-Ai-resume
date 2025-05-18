"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileBadge, FileText, Trophy, XCircle } from "lucide-react";
import ResultCard from "./result-card";
import { AnalysisResult } from "./hire-view-dashboard";

interface ResultsCardViewProps {
  results: AnalysisResult[];
  compareItems: string[];
  handleToggleCompare: (id: string) => void;
  handleToggleFavorite: (result: AnalysisResult) => void;
  handleAddNotes: (result: AnalysisResult) => void;
  handleRejectResume: (result: AnalysisResult) => void;
}

export default function ResultsCardView({
  results,
  compareItems,
  handleToggleCompare,
  handleToggleFavorite,
  handleAddNotes,
  handleRejectResume,
}: ResultsCardViewProps) {
  if (results.length === 0) {
    return (
      <div className="col-span-full text-center p-10">
        <p className="text-muted-foreground">
          No results match your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map((result) => (
        <div key={result.id} className="relative">
          <ResultCard result={result} />
          <div className="absolute top-3 right-3 flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleToggleCompare(result.id)}
            >
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                {compareItems.includes(result.id) ? "✓" : "+"}
              </Badge>
              <FileBadge className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute bottom-3 right-3 flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${result.favorite ? "text-yellow-500" : ""}`}
              onClick={() => handleToggleFavorite(result)}
            >
              <Trophy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleAddNotes(result)}
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleRejectResume(result)}
              disabled={result.rejected}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
