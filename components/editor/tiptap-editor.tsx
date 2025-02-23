import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { EditorBubbleMenu } from "./bubble-menu";
import { SlashCommand, renderItems } from "./slash-command";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import CodeBlock from "@tiptap/extension-code-block";
import { javascript } from "highlight.js/lib/languages/javascript";
import { html } from "highlight.js/lib/languages/xml";
import { css } from "highlight.js/lib/languages/css";
import "highlight.js/styles/github-dark.css";

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
}

export function TipTapEditor({
  content,
  onChange,
  editable = true,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg border border-border",
        },
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: "bg-primary/20 rounded-sm px-1",
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "not-prose pl-2",
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: "flex items-start my-4",
        },
        nested: true,
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: "rounded-lg bg-muted/50 p-4 font-mono",
        },
        languageClassPrefix: "language-",
      }),
      SlashCommand.configure({
        suggestion: {
          items: () => renderItems(),
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return "What's the title?";
          }
          return "Press '/' for commands, or start typing...";
        },
        includeChildren: true,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none max-w-full min-h-[200px] p-4",
      },
    },
  });

  return (
    <div className="relative w-full border rounded-lg bg-background">
      {editor && editable && <EditorBubbleMenu editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
