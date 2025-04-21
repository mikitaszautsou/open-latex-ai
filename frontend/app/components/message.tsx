import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import { ROLE } from "~/services/chat-api";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

export type MessageProps = {
  author: string;
  message: string;
  role: ROLE;
};

export function Message({ author, message, role }: MessageProps) {
  return (
    <div
      className={clsx(
        "flex p-2.5 rounded-xl w-max max-w-full",
        role === ROLE.USER ? "bg-[#0061ff] text-white self-end" : "bg-[#ffffff]"
      )}
    >
      <div className="prose prose-sm dark:prose-invert w-full">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {message}
        </ReactMarkdown>
      </div>
    </div>
  );
}
