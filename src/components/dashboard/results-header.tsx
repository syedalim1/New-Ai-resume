"use client";

import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface ResultsHeaderProps {
  resultsCount: number;
  onExport: () => void;
  onClear: () => void;
}

export default function ResultsHeader({
  resultsCount,
  onExport,
  onClear,
}: ResultsHeaderProps) {
  return (
    <div className="flex justify-between items-center flex-wrap gap-4 mt-8">
      <div>
        <h2 className="text-2xl font-bold">
          Results ({resultsCount})
        </h2>
        <p className="text-sm text-muted-foreground">
          Candidate resumes ranked by match score
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={onClear}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Clear All
        </Button>
      </div>
    </div>
  );
} 