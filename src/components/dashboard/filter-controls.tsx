"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface FilterControlsProps {
  filterMinScore: number;
  setFilterMinScore: (score: number) => void;
  showRejected: boolean;
  setShowRejected: (show: boolean) => void;
  batchActionsButton?: React.ReactNode;
}

export default function FilterControls({
  filterMinScore,
  setFilterMinScore,
  showRejected,
  setShowRejected,
  batchActionsButton,
}: FilterControlsProps) {
  return (
    <>
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Label htmlFor="min-score" className="text-sm">
            Min Score:
          </Label>
          <input
            id="min-score"
            type="range"
            min="0"
            max="100"
            step="5"
            value={filterMinScore}
            onChange={(e) => setFilterMinScore(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-sm font-medium">{filterMinScore}</span>
        </div>

        {batchActionsButton && (
          <div className="ml-auto">{batchActionsButton}</div>
        )}
      </div>
    </>
  );
}
