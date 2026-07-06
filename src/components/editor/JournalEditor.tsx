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
 *   `insertTextAtCursor` / `scrollToEnd` for voice dictation and AI assist streaming.
 *   `skipNextSyncRef` prevents stale parent `content` from undoing in-editor deletes.
 */
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import CharacterCount from "@tiptap/extension-character-count";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { scrollJournalEditorToEnd } from "@/lib/journal-editor-scroll";

/** Public imperative handle — voice dictation + AI assist scroll */
export interface JournalEditorHandle {
  insertTextAtCursor: (text: string) => void;
  scrollToEnd: () => void;
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
    /** Skip one sync cycle when change originated from this editor (deletes / inserts) */
    const skipNextSyncRef = useRef(false);
    const scrollRafRef = useRef<number | null>(null);
    const editorRef = useRef<ReturnType<typeof useEditor>>(null);

    const scheduleScrollToEnd = (smooth = true) => {
      const ed = editorRef.current;
      if (!ed) return;
      if (scrollRafRef.current !== null) cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = null;
        scrollJournalEditorToEnd(ed, smooth);
      });
    };

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
        skipNextSyncRef.current = true;
        onChange(ed.getHTML());
      },
      editorProps: {
        attributes: {
          class: "ProseMirror min-h-[120px] w-full outline-none",
        },
      },
    });

    editorRef.current = editor;

    useEffect(() => {
      if (!editor) return;
      if (skipNextSyncRef.current) {
        skipNextSyncRef.current = false;
        return;
      }
      const current = editor.getHTML();
      if (content === current) return;
      const grew = content.length > current.length;
      editor.commands.setContent(content || "<p></p>", false);
      if (grew) scheduleScrollToEnd(true);
    }, [content, editor]);

    useEffect(() => {
      if (autoFocus && editor) {
        editor.commands.focus("end");
        scheduleScrollToEnd(false);
      }
    }, [autoFocus, editor]);

    useEffect(() => {
      if (editor) editor.setEditable(editable);
    }, [editable, editor]);

    useEffect(
      () => () => {
        if (scrollRafRef.current !== null) cancelAnimationFrame(scrollRafRef.current);
      },
      [],
    );

    useImperativeHandle(
      ref,
      () => ({
        insertTextAtCursor: (text: string) => {
          if (!editor) return;
          skipNextSyncRef.current = true;
          editor.chain().focus().insertContent(`${text} `).run();
          scheduleScrollToEnd(true);
        },
        scrollToEnd: () => scheduleScrollToEnd(true),
      }),
      [editor],
    );

    if (!editor) return null;

    return (
      <div className="journal-editor flex min-h-0 flex-1 flex-col overflow-hidden overflow-x-hidden">
        <EditorContent editor={editor} className="flex-1 overflow-x-hidden overflow-y-auto" />
      </div>
    );
  },
);
