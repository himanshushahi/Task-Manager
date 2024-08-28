"use client";
import React, { forwardRef, useImperativeHandle } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import BulletList from "@tiptap/extension-bullet-list";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";
import Heading from "@tiptap/extension-heading";
import "highlight.js/styles/github-dark.css"; // Example theme, you can choose any other

import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaLink,
  FaListUl,
  FaListOl,
  FaImage,
  FaEraser,
  FaQuoteRight,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
} from "react-icons/fa";
import { IoCodeSharp } from "react-icons/io5";
import { MdHorizontalRule } from "react-icons/md";
import { BiRedo, BiUndo } from "react-icons/bi";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";

const lowlight = createLowlight(all);

const RichTextEditor = forwardRef(
  ({ onChange }: { onChange: (value: string) => void }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        CodeBlockLowlight.configure({
          lowlight,
          HTMLAttributes: {
            class: "codeblock",
          },
        }),
        Heading.configure({
          levels: [1, 2, 3],
        }),
        BulletList.configure({
          HTMLAttributes: {
            class: "ul",
          },
        }),
        Link.configure({
          HTMLAttributes: {
            class: "link",
          },
        }),
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        TextStyle,
        Color,
        Underline,
        Image,
      ],
      content: "",
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
      autofocus: true,
    });

    // Expose the resetContent function to the parent via the ref
    useImperativeHandle(ref, () => ({
      resetContent: () => {
        editor?.commands.setContent("");
      },
    }));

    if (!editor) {
      return null;
    }

    return (
      <div className="border rounded-lg p-6 w-full max-w-2xl mx-auto bg-white">
        <div className="flex flex-wrap justify-center gap-3 mb-4 border p-3 bg-gray-50 rounded-lg">
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`p-2 border rounded-lg transition-colors ${
              editor.isActive("heading", { level: 1 })
                ? "bg-blue-600 text-white shadow"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            H1
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`p-2 border rounded-lg transition-colors ${
              editor.isActive("heading", { level: 2 })
                ? "bg-blue-600 text-white shadow"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            H2
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={`p-2 border rounded-lg transition-colors ${
              editor.isActive("heading", { level: 3 })
                ? "bg-blue-600 text-white shadow"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            H3
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 border rounded-lg transition-colors ${
              editor.isActive("codeBlock")
                ? "bg-blue-600 text-white shadow"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            <IoCodeSharp />
          </button>
          <input
            type="color"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              editor.chain().focus().setColor(event.target.value).run()
            }
            value={editor.getAttributes("textStyle").color}
            data-testid="setColor"
            className="h-10 w-10 border rounded-full bg-white shadow cursor-pointer"
          />
          <button
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-2 border rounded-lg transition-colors ${
              editor.isActive({ textAlign: "left" })
                ? "bg-blue-600 text-white shadow"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            <FaAlignLeft />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-2 border rounded-lg transition-colors ${
              editor.isActive({ textAlign: "center" })
                ? "bg-blue-600 text-white shadow"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            <FaAlignCenter />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-2 border rounded-lg transition-colors ${
              editor.isActive({ textAlign: "right" })
                ? "bg-blue-600 text-white shadow"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            <FaAlignRight />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`p-2 border rounded-lg transition-colors ${
              editor.isActive({ textAlign: "justify" })
                ? "bg-blue-600 text-white shadow"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            <FaAlignJustify />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 border rounded-lg transition-colors ${
              editor.isActive("bulletList")
                ? "bg-blue-600 text-white shadow"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            <FaListUl />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 border rounded-lg transition-colors ${
              editor.isActive("orderedList")
                ? "bg-blue-600 text-white shadow"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            <FaListOl />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 border rounded-lg transition-colors ${
              editor.isActive("bold")
                ? "bg-blue-600 text-white shadow"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            <FaBold />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 border rounded-lg transition-colors ${
              editor.isActive("italic")
                ? "bg-blue-600 text-white shadow"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            <FaItalic />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 border rounded-lg transition-colors ${
              editor.isActive("underline")
                ? "bg-blue-600 text-white shadow"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            <FaUnderline />
          </button>
          <button
            onClick={() => {
              const url = window.prompt("Enter the URL");
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            className="p-2 border rounded-lg bg-white hover:bg-gray-100 shadow"
          >
            <FaLink />
          </button>

          <button
            onClick={() => {
              const url = window.prompt("Enter image URL");
              if (url) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            }}
            className="p-2 border rounded-lg bg-white hover:bg-gray-100 shadow"
          >
            <FaImage />
          </button>
          <button
            onClick={() =>
              editor.chain().focus().unsetAllMarks().clearNodes().run()
            }
            className="p-2 border rounded-lg bg-white hover:bg-gray-100 shadow"
          >
            <FaEraser />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 border rounded-lg transition-colors ${
              editor.isActive("blockquote")
                ? "bg-blue-600 text-white shadow"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            <FaQuoteRight />
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-2 border rounded-lg bg-white hover:bg-gray-100 shadow"
          >
            <MdHorizontalRule />
          </button>
          <button
            onClick={() => editor.commands.undo()}
            className="p-2 border rounded-lg bg-white hover:bg-gray-100 shadow"
          >
            <BiUndo />
          </button>
          <button
            onClick={() => editor.commands.redo()}
            className="p-2 border rounded-lg bg-white hover:bg-gray-100 shadow"
          >
            <BiRedo />
          </button>
        </div>
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none border rounded-lg h-60 overflow-y-auto p-4 bg-gray-50 shadow-inner"
        />
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
