"use client";

/**
 * Reusable confirmation dialog — paper theme (dashboard) or dark theme (journal nav).
 * Built on Radix Dialog; parent handles API + query invalidation after onConfirm.
 */
import type { ReactNode } from "react";
import { RippleButton } from "@/components/ui/ripple-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** paper = cream modal (shelf); dark = journal night theme */
  variant?: "paper" | "dark";
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
  variant = "paper",
}: ConfirmDialogProps) {
  const isDark = variant === "dark";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !loading) onCancel();
      }}
    >
      <DialogContent
        className={`journal-paper-dialog journal-paper-dialog--compact${
          isDark ? " journal-paper-dialog--dark" : ""
        }`}
        onPointerDownOutside={(e) => loading && e.preventDefault()}
        onEscapeKeyDown={(e) => loading && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <RippleButton
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="journal-dialog-btn-cancel"
          >
            {cancelLabel}
          </RippleButton>
          <RippleButton
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="journal-dialog-btn-primary"
          >
            {loading ? "Removing…" : confirmLabel}
          </RippleButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
