import clsx from "clsx";
import { ROLE } from "~/services/chat-api";
import { MarkdownViewer } from "react-github-markdown";

export type MessageProps = {
  author: string;
  message: string;
  role: ROLE;
};

export function Message({ author, message, role }: MessageProps) {
  const isUser = role === ROLE.USER;
  return (
    <div
      className={clsx(
        "flex p-2.5 rounded-xl w-max max-w-full",
        isUser ? "bg-[#0061ff] text-white self-end" : "bg-[#ffffff]"
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
