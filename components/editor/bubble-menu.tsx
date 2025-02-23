import { BubbleMenu, Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link,
  HighlighterIcon,
  ImageIcon,
  CheckSquare,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

interface EditorBubbleMenuProps {
  editor: Editor;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  if (!editor) {
    return null;
  }

  const items = [
    {
      icon: Bold,
      title: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive("bold"),
    },
    {
      icon: Italic,
      title: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive("italic"),
    },
    {
      icon: Strikethrough,
      title: "Strike",
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive("strike"),
    },
    {
      icon: Code,
      title: "Code",
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: () => editor.isActive("code"),
    },
    {
      icon: HighlighterIcon,
      title: "Highlight",
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: () => editor.isActive("highlight"),
    },
    {
      icon: Link,
      title: "Link",
      action: () => {
        const url = window.prompt("Enter URL");
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      },
      isActive: () => editor.isActive("link"),
    },
    {
      icon: Heading1,
      title: "Heading 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive("heading", { level: 1 }),
    },
    {
      icon: Heading2,
      title: "Heading 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive("heading", { level: 2 }),
    },
    {
      icon: List,
      title: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      title: "Ordered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive("orderedList"),
    },
    {
      icon: CheckSquare,
      title: "Task List",
      action: () => editor.chain().focus().toggleTaskList().run(),
      isActive: () => editor.isActive("taskList"),
    },
    {
      icon: Quote,
      title: "Blockquote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive("blockquote"),
    },
    {
      icon: ImageIcon,
      title: "Image",
      action: () => {
        const url = window.prompt("Enter image URL");
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      },
      isActive: () => editor.isActive("image"),
    },
  ];

  return (
    <BubbleMenu
      className="flex items-center gap-1 p-2 rounded-lg border bg-background shadow-lg"
      tippyOptions={{ duration: 100 }}
      editor={editor}
    >
      {items.map((item, index) => (
        <Toggle
          key={index}
          size="sm"
          pressed={item.isActive()}
          onPressedChange={item.action}
          title={item.title}
          className="gap-1 px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          <item.icon className="h-4 w-4" />
        </Toggle>
      ))}
    </BubbleMenu>
  );
}
