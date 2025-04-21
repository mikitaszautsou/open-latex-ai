import clsx from "clsx";
import { ROLE } from "~/services/chat-api";
import { MarkdownViewer } from "react-github-markdown";
import { memo } from "react";

export type MessageProps = {
  author: string;
  message: string;
  role: ROLE;
  isNew?: boolean;
};

function MessageComponent({ author, message, role, isNew }: MessageProps) {
  const isUser = role === ROLE.USER;
  return (
    <div
      className={clsx(
        "flex p-2.5 rounded-xl w-max max-w-full",
        isUser
          ? "animate-user-message-appear bg-[#0061ff] text-white self-end"
          : "bg-[#ffffff] animate-ai-message-appear"
      )}
    >
      <div className="prose prose-sm dark:prose-invert w-full">
        {isUser ? (
          message
        ) : (
          <MarkdownViewer value={message} isDarkTheme={false} />
        )}
      </div>
    </div>
  );
}

export const Message = memo(MessageComponent);
