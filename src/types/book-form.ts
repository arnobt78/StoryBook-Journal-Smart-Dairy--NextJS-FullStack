/**
 * Journal book form types — UI ↔ API walkthrough
 * ------------------------------------------------
 * BookFormValues mirrors createBookSchema / updateBookSchema in validations.ts.
 * coverEmoji stores a cover icon slug (see constants/cover-icons.ts).
 */
import { resolveCoverIconId } from "@/constants/cover-icons";

export type BookFormValues = {
  title: string;
  description: string;
  coverColor: string;
  coverEmoji: string;
  theme: string;
};

export const DEFAULT_BOOK_FORM: BookFormValues = {
  title: "",
  description: "",
  coverColor: "#8b4513",
  coverEmoji: "book-open",
  theme: "warm-paper",
};

/** Map a JournalBook row into editor defaults for PATCH flows */
export function bookToFormValues(book: {
  title: string;
  description?: string | null;
  coverColor: string;
  coverEmoji: string;
  theme?: string;
}): BookFormValues {
  return {
    title: book.title,
    description: book.description ?? "",
    coverColor: book.coverColor,
    coverEmoji: resolveCoverIconId(book.coverEmoji),
    theme: book.theme ?? "warm-paper",
  };
}
