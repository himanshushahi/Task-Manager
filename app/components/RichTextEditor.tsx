"use client";
import React from "react";
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
  FaUndo,
  FaRedo,
} from "react-icons/fa";
import { IoCodeSharp } from "react-icons/io5";
import { MdHorizontalRule } from "react-icons/md";
import { BiRedo, BiUndo } from "react-icons/bi";

const lowlight = createLowlight(all);

const RichTextEditor = ({
  onChange,
}: {
  onChange: (content: string) => void;
}) => {
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
        HTMLAttributes:{
            class:'link'
        }
      }),
      Underline,
      Image,
    ],
    content: "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });
  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4 w-full">
      <div className="flex flex-wrap justify-center gap-2 mb-2 border p-2">
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`p-2 border rounded ${
            editor.isActive("heading", { level: 1 })
              ? "bg-blue-500 text-white"
              : "bg-white"
          }`}
        >
          H1
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`p-2 border rounded ${
            editor.isActive("heading", { level: 2 })
              ? "bg-blue-500 text-white"
              : "bg-white"
          }`}
        >
          H2
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`p-2 border rounded ${
            editor.isActive("heading", { level: 3 })
              ? "bg-blue-500 text-white"
              : "bg-white"
          }`}
        >
          H3
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 border rounded ${
            editor.isActive("codeBlock") ? "bg-blue-500 text-white" : "bg-white"
          }`}
        >
          <IoCodeSharp />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 border rounded ${
            editor.isActive("bulletList")
              ? "bg-blue-500 text-white"
              : "bg-white"
          }`}
        >
          <FaListUl />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 border rounded ${
            editor.isActive("orderedList")
              ? "bg-blue-500 text-white"
              : "bg-white"
          }`}
        >
          <FaListOl />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 border rounded ${
            editor.isActive("bold") ? "bg-blue-500 text-white" : "bg-white"
          }`}
        >
          <FaBold />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 border rounded ${
            editor.isActive("italic") ? "bg-blue-500 text-white" : "bg-white"
          }`}
        >
          <FaItalic />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 border rounded ${
            editor.isActive("underline") ? "bg-blue-500 text-white" : "bg-white"
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
          className="p-2 border rounded bg-white"
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
          className="p-2 border rounded bg-white"
        >
          <FaImage />
        </button>
        <button
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
          className="p-2 border rounded bg-white"
        >
          <FaEraser />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 border rounded ${
            editor.isActive("blockquote")
              ? "bg-blue-500 text-white"
              : "bg-white"
          }`}
        >
          <FaQuoteRight />
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={`p-2 border rounded bg-white`}
        >
          <MdHorizontalRule />
        </button>
        <button
          onClick={() => editor.commands.undo()}
          className={`p-2 border rounded bg-white`}
        >
          <BiUndo />
        </button>
        <button
          onClick={() => editor.commands.redo()}
          className={`p-2 border rounded bg-white`}
        >
          <BiRedo />
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none border h-60 overflow-y-auto"
      />
    </div>
  );
};

export default RichTextEditor;
