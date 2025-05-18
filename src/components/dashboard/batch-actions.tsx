"use client";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle2, Trophy, XCircle, X } from "lucide-react";
import { AnalysisResult } from "./hire-view-dashboard";

interface BatchActionsProps {
  selectedItems: string[];
  setRejectionReason: (reason: string) => void;
  setResults: (callback: (prev: AnalysisResult[]) => AnalysisResult[]) => void;
  clearSelection: () => void;
}

export default function BatchActions({
  selectedItems,
  setRejectionReason,
  setResults,
  clearSelection,
}: BatchActionsProps) {
  const { toast } = useToast();

  // Don't render if no items are selected
  if (selectedItems.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Batch Actions ({selectedItems.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Batch Actions</DialogTitle>
          <DialogDescription>
            Apply actions to {selectedItems.length} selected resume(s)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => {
                setResults((prev) =>
                  prev.map((item) =>
                    selectedItems.includes(item.id)
                      ? {
                          ...item,
                          favorite: true,
                          status: "shortlisted",
                        }
                      : item
                  )
                );
                toast({
                  title: "Batch Action Complete",
                  description: `${selectedItems.length} resume(s) have been shortlisted.`,
                });
              }}
              className="w-full justify-start"
            >
              <Trophy className="h-5 w-5 mr-2" />
              Shortlist Selected
            </Button>
            <Button
              onClick={() => {
                setRejectionReason(
                  "Batch rejection - not a good fit for the role"
                );
                setResults((prev) =>
                  prev.map((item) =>
                    selectedItems.includes(item.id)
                      ? {
                          ...item,
                          rejected: true,
                          rejectionReason:
                            "Batch rejection - not a good fit for the role",
                          status: "rejected",
                        }
                      : item
                  )
                );
                toast({
                  title: "Batch Action Complete",
                  description: `${selectedItems.length} resume(s) have been rejected.`,
                });
              }}
              variant="destructive"
              className="w-full justify-start"
            >
              <XCircle className="h-5 w-5 mr-2" />
              Reject Selected
            </Button>
            <Button
              onClick={() => {
                clearSelection();
                toast({
                  title: "Selection Cleared",
                  description: "All selected resumes have been cleared.",
                });
              }}
              variant="outline"
              className="w-full justify-start"
            >
              <X className="h-5 w-5 mr-2" />
              Clear Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
