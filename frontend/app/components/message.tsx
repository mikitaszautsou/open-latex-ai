import clsx from "clsx";
import { ROLE } from "~/services/chat-api";
import { memo } from "react";
import Latex from "react-latex";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import { cn } from "~/lib/utils";

import "katex/dist/katex.min.css";
import "github-markdown-css/github-markdown-light.css";
import "highlight.js/styles/github-dark.css";
import { Typing } from "./Typing";

export type MessageProps = {
  author: string;
  message: string;
  role: ROLE;
  isNew?: boolean;
};

function MessageComponent({ author, message, role, isNew }: MessageProps) {
  const isUser = role === ROLE.USER;
  if (!message) {
    return <Typing />
  }
  return (
    <div
      className={clsx(
        "flex p-2.5 rounded-xl w-max max-w-full transition-opacity",
        isUser
          ? "animate-user-message-appear bg-[#0061ff] text-white self-end"
          : "bg-[#ffffff] animate-ai-message-appear"
      )}
    >
      <div className={cn("w-full", !isUser && "markdown-body")}>
        {isUser ? (
          message
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeKatex, rehypeHighlight]}
          >
            {message}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export const Message = memo(MessageComponent);
