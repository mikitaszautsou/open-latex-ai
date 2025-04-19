import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { ROLE } from "~/services/chat-api";

export type MessageProps = {
  author: string;
  message: string;
  role: ROLE;
};

export function Message({ author, message, role }: MessageProps) {
  return (
    <div
      className={clsx(
        "flex p-2.5 rounded-xl w-max max-w-full font-[500]",
        role === ROLE.USER ? "bg-[#0061ff] text-white self-end" : "bg-[#ffffff]"
      )}
    >
      <div className="pl-2 w-full overflow-hidden">
        <div className="dark:prose-invert max-w-none markdown-content prose">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Add syntax highlighting for code blocks
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const language = match ? match[1] : "";

                return !inline && match ? (
                  <SyntaxHighlighter
                    language={language}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded-sm"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              a: ({ node, ...props }) => (
                <a
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  {...props}
                />
              ),
            }}
          >
            {message}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
