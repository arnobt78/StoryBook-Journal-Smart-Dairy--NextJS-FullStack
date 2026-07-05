"use client";

/**
 * Reusable confirmation dialog — paper theme (dashboard) or dark theme (journal nav).
 * Built on Radix Dialog; parent handles API + query invalidation after onConfirm.
 */
import type { ReactNode } from "react";
import { Check, Trash2, X } from "lucide-react";
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
  /** Stack above open editor modal (Wave 22 delete confirm) */
  priority?: boolean;
  /** When true, confirm button uses destructive trash icon (delete flows) */
  destructive?: boolean;
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
  priority = false,
  destructive = false,
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
        stackPriority={priority ? "confirm" : undefined}
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
            <span className="journal-md-icon-label auth-responsive-label--full">
              <X size={13} strokeWidth={2} aria-hidden />
              {cancelLabel}
            </span>
            <span className="auth-responsive-label--short" aria-hidden>
              <X size={16} strokeWidth={2} />
            </span>
          </RippleButton>
          <RippleButton
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="journal-dialog-btn-primary"
          >
            <span className="journal-md-icon-label auth-responsive-label--full">
              {destructive ? (
                <Trash2 size={13} strokeWidth={2} aria-hidden />
              ) : (
                <Check size={13} strokeWidth={2} aria-hidden />
              )}
              {loading ? "Removing…" : confirmLabel}
            </span>
            <span className="auth-responsive-label--short" aria-hidden>
              {destructive ? (
                <Trash2 size={16} strokeWidth={2} />
              ) : (
                <Check size={16} strokeWidth={2} />
              )}
            </span>
          </RippleButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
