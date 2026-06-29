"use client";

/**
 * Shared create/edit journal modal — shelf + reader nav.
 * Parent handles POST/PATCH + notifyJournalCacheUpdated after onSubmit.
 */
import { useState } from "react";
import { Check } from "lucide-react";
import { COVER_COLORS } from "@/constants";
import { COVER_ICONS } from "@/constants/cover-icons";
import { BOOK_THEMES } from "@/constants/themes";
import { RippleButton } from "@/components/ui/ripple-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookSpineMark } from "@/components/journal/BookSpineMark";
import { BookThemePreview } from "@/components/journal/BookThemePreview";
import {
  DEFAULT_BOOK_FORM,
  type BookFormValues,
} from "@/types/book-form";

export type BookEditorModalProps = {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: BookFormValues;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: BookFormValues) => void;
};

export function BookEditorModal({
  open,
  mode,
  initialValues,
  loading = false,
  onClose,
  onSubmit,
}: BookEditorModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !loading) onClose();
      }}
    >
      <BookEditorForm
        mode={mode}
        initialValues={initialValues}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Dialog>
  );
}

function BookEditorForm({
  mode,
  initialValues,
  loading = false,
  onClose,
  onSubmit,
}: Omit<BookEditorModalProps, "open">) {
  const [form, setForm] = useState<BookFormValues>(
    () => initialValues ?? DEFAULT_BOOK_FORM,
  );

  const dialogTitle =
    mode === "create" ? "Start a new journal" : `Edit ${form.title || "journal"}`;
  const dialogSubtitle =
    mode === "create"
      ? "Name it, pick a cover, and choose how your pages will feel."
      : "Changes apply across your shelf and reader instantly.";
  const submitLabel =
    mode === "create"
      ? loading
        ? "Creating…"
        : "Create Journal"
      : loading
        ? "Saving…"
        : "Save Changes";

  const handleSubmit = () => {
    if (!form.title.trim() || loading) return;
    onSubmit(form);
  };

  const spineTitle = form.title.trim() || "My Journal";

  return (
    <DialogContent
      className="journal-paper-dialog"
      onPointerDownOutside={(e) => loading && e.preventDefault()}
      onEscapeKeyDown={(e) => loading && e.preventDefault()}
    >
      <DialogHeader>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogDescription>{dialogSubtitle}</DialogDescription>
      </DialogHeader>

      <div className="journal-dialog-body">
        <div className="journal-editor-grid">
          <div className="journal-editor-form-col">
            <label className="journal-editor-label" htmlFor="book-title">
              Title
            </label>
            <input
              id="book-title"
              className="journal-editor-input"
              placeholder="My Journal"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />

            <label className="journal-editor-label" htmlFor="book-description">
              Description (optional)
            </label>
            <input
              id="book-description"
              className="journal-editor-input"
              placeholder="A place for my thoughts…"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />

            <span className="journal-editor-label">Cover Color</span>
            <div className="journal-picker-pad">
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
              {COVER_COLORS.map((c) => {
                const selected = form.coverColor === c.value;
                return (
                  <RippleButton
                    key={c.value}
                    type="button"
                    aria-label={c.label}
                    aria-pressed={selected}
                    onClick={() =>
                      setForm((f) => ({ ...f, coverColor: c.value }))
                    }
                    className={`journal-color-swatch${
                      selected ? " journal-color-swatch--selected" : ""
                    }`}
                    style={{ background: c.value }}
                  >
                    {selected ? (
                      <span className="journal-color-swatch-check">
                        <Check size={16} strokeWidth={3} />
                      </span>
                    ) : null}
                  </RippleButton>
                );
              })}
              </div>
            </div>

            <span className="journal-editor-label">Page Theme</span>
            <div className="journal-picker-pad">
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginBottom: "8px",
                }}
              >
              {BOOK_THEMES.map((theme) => {
                const selected = form.theme === theme.id;
                return (
                  <RippleButton
                    key={theme.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setForm((f) => ({ ...f, theme: theme.id }))}
                    className={`journal-theme-chip${
                      selected
                        ? " journal-theme-chip--selected"
                        : " journal-theme-chip--idle"
                    }`}
                  >
                    {theme.label}
                  </RippleButton>
                );
              })}
              </div>
              <BookThemePreview themeId={form.theme} />
            </div>

            <span className="journal-editor-label" style={{ marginTop: "8px", display: "block" }}>
              Cover Icon
            </span>
            <div className="journal-picker-pad">
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
              {COVER_ICONS.map(({ id, label, Icon }) => {
                const selected = form.coverEmoji === id;
                return (
                  <RippleButton
                    key={id}
                    type="button"
                    aria-label={label}
                    aria-pressed={selected}
                    onClick={() => setForm((f) => ({ ...f, coverEmoji: id }))}
                    className={`journal-cover-icon-btn${
                      selected ? " journal-cover-icon-btn--selected" : ""
                    }`}
                  >
                    <Icon size={20} strokeWidth={1.75} />
                  </RippleButton>
                );
              })}
              </div>
            </div>
          </div>

          <aside className="journal-editor-preview-col" aria-hidden>
            <p
              className="journal-editor-label"
              style={{ marginBottom: 0, textAlign: "center" }}
            >
              Shelf preview
            </p>
            <div
              className="journal-mini-spine"
              style={{
                background: `linear-gradient(155deg, color-mix(in srgb,${form.coverColor} 60%,#000) 0%, ${form.coverColor} 40%, color-mix(in srgb,${form.coverColor} 70%,#3d1a06) 100%)`,
              }}
            >
              <BookSpineMark iconId={form.coverEmoji} title={spineTitle} />
            </div>
          </aside>
        </div>
      </div>

      <DialogFooter>
        <RippleButton
          type="button"
          disabled={loading}
          onClick={onClose}
          className="journal-dialog-btn-cancel"
        >
          Cancel
        </RippleButton>
        <RippleButton
          type="button"
          onClick={handleSubmit}
          disabled={!form.title.trim() || loading}
          shine
          className="journal-dialog-btn-primary"
        >
          {submitLabel}
        </RippleButton>
      </DialogFooter>
    </DialogContent>
  );
}
