"use client";

import { useEffect, useState, useCallback, memo, useMemo } from "react";
import { useEditor, EditorContent, BubbleMenu, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import "highlight.js/styles/github-dark.css";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckSquare,
  Highlighter,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

// Extension to add language data attribute to code blocks
const CodeBlockLanguage = Extension.create({
  name: "codeBlockLanguage",
  addAttributes() {
    return {
      dataLanguage: {
        default: "plaintext",
        parseHTML: (element: HTMLElement) => {
          const language =
            element.getAttribute("class")?.match(/language-(\w+)/)?.[1] ||
            "plaintext";
          return language;
        },
        renderHTML: (attributes: { dataLanguage: string }) => {
          return {
            "data-language": attributes.dataLanguage || "plaintext",
          };
        },
      },
    };
  },
});

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
}

// Memoized toolbar button components
const ToolbarButton = memo(
  ({ icon, onClick, pressed, disabled, label }: any) => (
    <Toggle
      size="sm"
      pressed={pressed}
      onPressedChange={onClick}
      aria-label={label}
      disabled={disabled}
    >
      {icon}
    </Toggle>
  )
);
ToolbarButton.displayName = "ToolbarButton";

const ToolbarActionButton = memo(({ icon, onClick, disabled, label }: any) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
  >
    {icon}
  </Button>
));
ToolbarActionButton.displayName = "ToolbarActionButton";

export function TipTapEditor({
  content,
  onChange,
  editable = true,
}: TipTapEditorProps) {
  // Track if content is being updated externally to prevent unnecessary re-renders
  const [isExternalUpdate, setIsExternalUpdate] = useState(false);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-primary underline underline-offset-4 hover:text-primary/80",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg border border-border my-4 max-w-full h-auto",
          draggable: false,
        },
        allowBase64: true,
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: "bg-primary/20 rounded-sm px-1 font-semibold",
        },
        multicolor: true,
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
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "plaintext",
        HTMLAttributes: {
          class: `
          relative
          my-6
          rounded-lg
          bg-[#0d1117]
          font-mono
          text-[14px]
          leading-normal
          overflow-hidden
          shadow-md
          border
          border-[#30363d]
          group
          
          /* Code block header with language tag */
          before:content-[attr(data-language)]
          before:absolute
          before:top-0
          before:right-0
          before:px-3
          before:py-1
          before:text-xs
          before:font-sans
          before:font-medium
          before:text-gray-400
          before:bg-[#161b22]
          before:border-b
          before:border-l
          before:border-[#30363d]
          before:rounded-bl-md
          before:rounded-tr-md
          before:uppercase
          before:tracking-wide
          
          /* Code content styling */
          [&_pre]:!bg-transparent
          [&_pre]:!p-0
          [&_pre]:!m-0
          [&_pre]:p-5
          [&_pre]:pt-6
          [&_pre]:overflow-x-auto
          
          /* Syntax highlighting */
          [&_code]:!text-[#e6edf3]
          [&_.hljs-comment]:!text-[#8b949e]
          [&_.hljs-keyword]:!text-[#ff7b72]
          [&_.hljs-string]:!text-[#a5d6ff]
          [&_.hljs-number]:!text-[#79c0ff]
          [&_.hljs-function]:!text-[#d2a8ff]
          [&_.hljs-title]:!text-[#d2a8ff]
          [&_.hljs-attr]:!text-[#79c0ff]
          [&_.hljs-built_in]:!text-[#ffa657]
          [&_.hljs-literal]:!text-[#ff7b72]
          [&_.hljs-variable]:!text-[#ffa657]
          [&_.hljs-operator]:!text-[#e6edf3]
          [&_.hljs-property]:!text-[#79c0ff]
          [&_.hljs-punctuation]:!text-[#e6edf3]
          [&_.hljs-class]:!text-[#d2a8ff]
          [&_.hljs-type]:!text-[#ff7b72]
          
          /* Scrollbar styling */
          [&_pre::-webkit-scrollbar]:h-2
          [&_pre::-webkit-scrollbar-track]:bg-[#161b22]
          [&_pre::-webkit-scrollbar-thumb]:bg-[#30363d]
          [&_pre::-webkit-scrollbar-thumb:hover]:bg-[#6e7681]
          
          /* Interactive effects */
          hover:border-[#6e7681]
          hover:shadow-lg
          transition-all
          duration-200
        `,
        },
        languageClassPrefix: "language-",
      }),
      CodeBlockLanguage.configure({
        types: ["codeBlock"],
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return "What's the title?";
          }
          if (node.type.name === "codeBlock") {
            return "Enter code...";
          }
          return "Start writing or type '/' for commands...";
        },
        includeChildren: true,
      }),
    ],
    []
  );

  const editorProps = useMemo(
    () => ({
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none max-w-full min-h-[200px] p-4 prose-pre:my-0 prose-pre:p-0 prose-pre:bg-transparent",
      },
    }),
    []
  );

  const handleUpdate = useCallback(
    ({ editor } : any) => {
      if (!isExternalUpdate) {
        onChange(editor.getHTML());
      }
    },
    [onChange, isExternalUpdate]
  );

  const editor = useEditor({
    extensions,
    editable,
    onUpdate: handleUpdate,
    editorProps,
  });

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      setIsExternalUpdate(true);
      editor.commands.setContent(content);
      setTimeout(() => setIsExternalUpdate(false), 0);
    }
  }, [editor, content]);

  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  const addImage = useCallback(
    (url: string) => {
      if (url && editor) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    },
    [editor]
  );

  const setLink = useCallback(
    (url: string) => {
      if (!editor) return;
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }

      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    },
    [editor]
  );

  // Memoized handler functions for toolbar actions
  const handleHeadingChange = useCallback(
    (value: string) => {
      if (!editor) return;

      if (value === "p") {
        editor.chain().focus().setParagraph().run();
      } else if (value === "h1") {
        editor.chain().focus().toggleHeading({ level: 1 }).run();
      } else if (value === "h2") {
        editor.chain().focus().toggleHeading({ level: 2 }).run();
      } else if (value === "h3") {
        editor.chain().focus().toggleHeading({ level: 3 }).run();
      }
    },
    [editor]
  );

  const handleBoldToggle = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const handleItalicToggle = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const handleHighlightToggle = useCallback(() => {
    editor?.chain().focus().toggleHighlight().run();
  }, [editor]);

  const handleBulletListToggle = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
  }, [editor]);

  const handleOrderedListToggle = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run();
  }, [editor]);

  const handleTaskListToggle = useCallback(() => {
    editor?.chain().focus().toggleTaskList().run();
  }, [editor]);

  const handleBlockquoteToggle = useCallback(() => {
    editor?.chain().focus().toggleBlockquote().run();
  }, [editor]);

  const handleCodeBlockToggle = useCallback(() => {
    editor?.chain().focus().toggleCodeBlock().run();
  }, [editor]);

  const handleHorizontalRule = useCallback(() => {
    editor?.chain().focus().setHorizontalRule().run();
  }, [editor]);

  const handleCodeToggle = useCallback(() => {
    editor?.chain().focus().toggleCode().run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  // Get current heading value for select
  const currentHeadingValue = editor.isActive("heading", { level: 1 })
    ? "h1"
    : editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
    ? "h3"
    : "p";

  return (
    <div className="tiptap relative w-full border rounded-lg bg-background group">
      {editor && editable && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="bg-background rounded-md shadow-md border border-border p-1 flex gap-1"
        >
          <ToolbarButton
            icon={<Bold className="h-4 w-4" />}
            onClick={handleBoldToggle}
            pressed={editor.isActive("bold")}
            label="Bold"
          />
          <ToolbarButton
            icon={<Italic className="h-4 w-4" />}
            onClick={handleItalicToggle}
            pressed={editor.isActive("italic")}
            label="Italic"
          />
          <ToolbarButton
            icon={<Highlighter className="h-4 w-4" />}
            onClick={handleHighlightToggle}
            pressed={editor.isActive("highlight")}
            label="Highlight"
          />
          <ToolbarButton
            icon={<Code className="h-4 w-4" />}
            onClick={handleCodeToggle}
            pressed={editor.isActive("code")}
            label="Inline Code"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("link")}
                aria-label="Link"
              >
                <LinkIcon className="h-4 w-4" />
              </Toggle>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium">URL</label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  defaultValue={editor.getAttributes("link").href || ""}
                  className="h-8 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      if (input.value) {
                        setLink(input.value);
                      } else {
                        editor
                          .chain()
                          .focus()
                          .extendMarkRange("link")
                          .unsetLink()
                          .run();
                      }
                      (
                        e.currentTarget.closest(
                          '[data-state="open"]'
                        ) as HTMLElement
                      )?.click();
                    }
                  }}
                />
                <div className="flex justify-between mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                      editor
                        .chain()
                        .focus()
                        .extendMarkRange("link")
                        .unsetLink()
                        .run();
                      const popover = document.querySelector(
                        '[data-state="open"]'
                      ) as HTMLElement;
                      if (popover) popover.click();
                    }}
                  >
                    Remove
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs h-7"
                    onClick={(e) => {
                      const input =
                        e.currentTarget.parentElement?.previousElementSibling?.querySelector(
                          "input"
                        );
                      if (input && input.value) {
                        setLink(input.value);
                      }
                      (
                        e.currentTarget.closest(
                          '[data-state="open"]'
                        ) as HTMLElement
                      )?.click();
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </BubbleMenu>
      )}

      <div className="flex items-center gap-1 p-1 border-b">
        <Select
          value={currentHeadingValue}
          onValueChange={handleHeadingChange}
          disabled={!editable}
        >
          <SelectTrigger className="w-[130px] h-8">
            <SelectValue placeholder="Paragraph" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="p">Paragraph</SelectItem>
            <SelectItem value="h1">Heading 1</SelectItem>
            <SelectItem value="h2">Heading 2</SelectItem>
            <SelectItem value="h3">Heading 3</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center border-l pl-1 ml-1">
          <ToolbarButton
            icon={<Bold className="h-4 w-4" />}
            onClick={handleBoldToggle}
            pressed={editor.isActive("bold")}
            disabled={!editable}
            label="Bold"
          />
          <ToolbarButton
            icon={<Italic className="h-4 w-4" />}
            onClick={handleItalicToggle}
            pressed={editor.isActive("italic")}
            disabled={!editable}
            label="Italic"
          />
          <ToolbarButton
            icon={<Highlighter className="h-4 w-4" />}
            onClick={handleHighlightToggle}
            pressed={editor.isActive("highlight")}
            disabled={!editable}
            label="Highlight"
          />
        </div>

        <div className="flex items-center border-l pl-1 ml-1">
          <ToolbarButton
            icon={<List className="h-4 w-4" />}
            onClick={handleBulletListToggle}
            pressed={editor.isActive("bulletList")}
            disabled={!editable}
            label="Bullet List"
          />
          <ToolbarButton
            icon={<ListOrdered className="h-4 w-4" />}
            onClick={handleOrderedListToggle}
            pressed={editor.isActive("orderedList")}
            disabled={!editable}
            label="Ordered List"
          />
          <ToolbarButton
            icon={<CheckSquare className="h-4 w-4" />}
            onClick={handleTaskListToggle}
            pressed={editor.isActive("taskList")}
            disabled={!editable}
            label="Task List"
          />
        </div>

        <div className="flex items-center border-l pl-1 ml-1">
          <ToolbarButton
            icon={<Quote className="h-4 w-4" />}
            onClick={handleBlockquoteToggle}
            pressed={editor.isActive("blockquote")}
            disabled={!editable}
            label="Quote"
          />
          <ToolbarButton
            icon={<Code className="h-4 w-4" />}
            onClick={handleCodeBlockToggle}
            pressed={editor.isActive("codeBlock")}
            disabled={!editable}
            label="Code Block"
          />
          <ToolbarActionButton
            icon={<Minus className="h-4 w-4" />}
            onClick={handleHorizontalRule}
            disabled={!editable}
            label="Horizontal Rule"
          />
        </div>

        <div className="flex items-center border-l pl-1 ml-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" disabled={!editable}>
                <ImageIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      if (input.value) {
                        addImage(input.value);
                      }
                      (
                        e.currentTarget.closest(
                          '[data-state="open"]'
                        ) as HTMLElement
                      )?.click();
                    }
                  }}
                />
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      (
                        e.currentTarget.closest(
                          '[data-state="open"]'
                        ) as HTMLElement
                      )?.click();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      const input =
                        e.currentTarget.parentElement?.previousElementSibling?.querySelector(
                          "input"
                        );
                      if (input && input.value) {
                        addImage(input.value);
                      }
                      (
                        e.currentTarget.closest(
                          '[data-state="open"]'
                        ) as HTMLElement
                      )?.click();
                    }}
                  >
                    Insert
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <EditorContent
        editor={editor}
        className="min-h-[300px] focus-within:ring-2 focus-within:ring-primary/20 rounded-b-lg transition-all"
      />

      {editable && (
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          Press &apos;/&apos; for commands
        </div>
      )}
    </div>
  );
}
