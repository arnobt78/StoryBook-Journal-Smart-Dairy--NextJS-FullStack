/**
 * @file components/editor/JournalEditor.tsx
 *
 * WALKTHROUGH — TipTap rich-text editor (write mode only)
 * ───────────────────────────────────────────────────────
 * Client-only (`"use client"`). Extensions: StarterKit, Placeholder, Typography,
 * CharacterCount. Outputs HTML → `JournalEntry.content`; read mode uses `.journal-prose`.
 * Controlled by RightPage/BookSpread via `content` + `onChange` props.
 *
 * Wave 44 — forwardRef + JournalEditorHandle:
 *   Exposes `insertTextAtCursor(text)` via useImperativeHandle so voice dictation
 *   (VoiceDictationButton / useVoiceInput) can inject transcribed text at the current
 *   TipTap caret position. This is the only change introduced for voice dictation in
 *   this file — no existing behaviour is altered.
 */
"use client";

/**
 * TipTap rich-text editor for journal entries — client-only, no SSR.
 * Outputs HTML stored in JournalEntry.content; read mode uses journal-prose.
 */
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import CharacterCount from "@tiptap/extension-character-count";
import { forwardRef, useEffect, useImperativeHandle } from "react";

/** Public imperative handle exposed to parent via ref (e.g. RightPage for voice dictation) */
export interface JournalEditorHandle {
  /** Insert text at the current TipTap cursor position */
  insertTextAtCursor: (text: string) => void;
}

type JournalEditorProps = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  autoFocus?: boolean;
};

export const JournalEditor = forwardRef<JournalEditorHandle, JournalEditorProps>(
  function JournalEditor(
  {
  content,
  onChange,
  placeholder = "Write what's on your mind today…",
  editable = true,
  autoFocus = false,
}: JournalEditorProps,
  ref,
) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Typography,
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: content || "<p></p>",
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: "ProseMirror min-h-[120px] w-full outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (content !== current && content !== editor.getText()) {
      editor.commands.setContent(content || "<p></p>", false);
    }
  }, [content, editor]);

  useEffect(() => {
    if (autoFocus && editor) {
      editor.commands.focus("end");
    }
  }, [autoFocus, editor]);

  useEffect(() => {
    if (editor) editor.setEditable(editable);
  }, [editable, editor]);

  // Expose insertTextAtCursor so voice dictation can inject transcript text
  useImperativeHandle(
    ref,
    () => ({
      insertTextAtCursor: (text: string) => {
        if (!editor) return;
        // Voice dictation — keep cursor visible in the editor scroll port
        editor.chain().focus().insertContent(`${text} `).scrollIntoView().run();
      },
    }),
    [editor],
  );

  if (!editor) return null;

  return (
    <div className="journal-editor flex min-h-0 flex-1 flex-col overflow-hidden overflow-x-hidden">
      <EditorContent editor={editor} className="flex-1 overflow-x-hidden overflow-y-auto" />
    </div>
  );
});
