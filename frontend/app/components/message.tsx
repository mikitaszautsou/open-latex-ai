import clsx from "clsx";
import { chatApi, MessageType, Role, type Message } from "~/services/chat-api";
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
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator } from "./ui/context-menu";
import { ContextMenuTrigger } from "@radix-ui/react-context-menu";
import { Brain, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "~/query-client";

export type MessageProps = {
  author: string;
  type: MessageType;
  message: string;
  role: Role;
  isNew?: boolean;
  onDelete?: () => void;
};

function MessageComponent({ author, message, type, role, isNew, onDelete }: MessageProps) {
  const isUser = role === Role.USER;
  console.log({ type });
  return (
    <ContextMenu>
      <ContextMenuTrigger className={clsx(
        "flex p-2.5 rounded-xl w-max max-w-full transition-all duration-300",
        isUser
          ? "bg-[#0061ff] text-white self-end"
          : "bg-[#ffffff]",
        !message && 'w-15 min-h-8 px-1.5 py-1.5 ml-1.5 !bg-[#e4e4ec] rounded-full flex justify-center items-center animate-[typing]',
        type === MessageType.THINKING_SIGNATURE && '!hidden',
      )}>

        {
          !message && <>
            <div className="float-left w-2 h-2 min-w-2 min-h-2 mx-1 bg-gray-500 rounded-full animate-[loadingFade_0.8s_infinite]"></div>
            <div className="float-left w-2 h-2 min-w-2 min-h-2 mx-1 bg-gray-500 rounded-full animate-[loadingFade_0.8s_infinite] delay-75"></div>
            <div className="float-left w-2 h-2 min-w-2 min-h-2  mx-1 bg-gray-500 rounded-full animate-[loadingFade_0.8s_infinite] delay-150"></div>
          </>
        }
        <div className={cn("w-full", !isUser && "markdown-body")}>
          {isUser && message}
          {type == MessageType.THINKING && <>
            <Brain className="min-w-10 inline" />{message}
          </>}
          {!isUser && type == MessageType.TEXT && (
            <ReactMarkdown
              remarkPlugins={[remarkMath, remarkGfm]}
              rehypePlugins={[rehypeKatex, rehypeHighlight]}
            >
              {message}
            </ReactMarkdown>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onDelete}>
          <Trash2 />
          <ContextMenuSeparator />
          Remove Message</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export const Message = memo(MessageComponent);
