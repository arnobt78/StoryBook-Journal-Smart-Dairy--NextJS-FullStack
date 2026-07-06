/**
 * @file lib/journal-editor-scroll.ts
 *
 * Keeps the TipTap caret and outer write-panel scroll host in view during
 * voice dictation, AI assist streaming, and other programmatic inserts.
 */
import type { Editor } from "@tiptap/core";

/** Focus document end and smooth-scroll the editor scrollport (`.overflow-y-auto`). */
export function scrollJournalEditorToEnd(editor: Editor, smooth = true): void {
  editor.chain().focus("end").scrollIntoView().run();
  const scrollPort = editor.view.dom.closest(".journal-editor")?.querySelector(
    ".overflow-y-auto",
  ) as HTMLElement | null;
  if (!scrollPort) return;
  scrollPort.scrollTo({
    top: scrollPort.scrollHeight,
    behavior: smooth ? "smooth" : "auto",
  });
}
