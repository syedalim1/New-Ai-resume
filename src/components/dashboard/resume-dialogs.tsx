"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnalysisResult } from "./hire-view-dashboard";

interface RejectionDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedResult: AnalysisResult | null;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  onConfirm: () => void;
}

export function RejectionDialog({
  open,
  setOpen,
  selectedResult,
  rejectionReason,
  setRejectionReason,
  onConfirm,
}: RejectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Resume</DialogTitle>
          <DialogDescription>
            Provide a reason for rejecting {selectedResult?.candidateName}
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Enter rejection reason..."
          className="min-h-24"
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="destructive">
            Confirm Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface NotesDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedResult: AnalysisResult | null;
  detailedNotes: string;
  setDetailedNotes: (notes: string) => void;
  onSave: () => void;
}

export function NotesDialog({
  open,
  setOpen,
  selectedResult,
  detailedNotes,
  setDetailedNotes,
  onSave,
}: NotesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Review Notes</DialogTitle>
          <DialogDescription>
            Add detailed notes for {selectedResult?.candidateName}
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={detailedNotes}
          onChange={(e) => setDetailedNotes(e.target.value)}
          placeholder="Add detailed notes about this candidate..."
          className="min-h-32"
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Notes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
