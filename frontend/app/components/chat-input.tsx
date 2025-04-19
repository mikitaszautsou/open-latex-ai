import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import { useState, useRef, useEffect } from "react";
import { queryClient } from "~/query-client";
import { chatApi, ROLE } from "~/services/chat-api";

export type ChatInputProps = {
  className?: string;
  chatId?: string;
};

const MAX_TEXTAREA_HEIGHT = "20rem"; // Approx 10 rows, adjust based on your styling

export function ChatInput({ className, chatId }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { mutate: sendMessageMutation, isPending: isSendingMessage } =
    useMutation({
      mutationFn: () =>
        chatApi.createMessage(chatId!, {
          content: message.trim(),
          role: ROLE.USER,
        }),
      onSuccess: () => {
        setMessage("");
        queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      },
    });

  const handleSend = () => {
    if (isSendingMessage || !message.trim()) return;
    sendMessageMutation();
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [message]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isDisabled = isSendingMessage || !message.trim();

  return (
    <div
      className={clsx(
        "flex items-start gap-2 bg-[#ffffff] p-3 shadow-[0px_4px_12px_rgba(0,0,0,0.1)]",
        isSendingMessage && "cursor-not-allowed",
        className
      )}
    >
      <textarea
        ref={textareaRef}
        className={clsx(
          "flex-1 px-3 py-2 border border-transparent rounded-2xl outline-none bg-[#fafafa] resize-none shadow-[0_0_0_1px_rgba(0,0,0,0.1)] overflow-y-auto",
          isSendingMessage && "cursor-not-allowed"
        )}
        placeholder="Type your message..."
        rows={1}
        style={{ maxHeight: MAX_TEXTAREA_HEIGHT }}
        value={message}
        disabled={isSendingMessage}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        className={clsx(
          "bg-[#0061ff] text-white font-semibold px-4 py-2 rounded-full whitespace-nowrap transition-colors h-10 w-10 flex items-center justify-center shrink-0",
          isDisabled && "cursor-not-allowed bg-[#dedede] text-[#aeaeae]"
        )}
        onClick={handleSend}
        disabled={isDisabled}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 122.56 122.88"
          className={clsx(
            "fill-white min-w-5 ml-[-3px] mb-[-2px] transition-colors",
            isDisabled && "fill-[#aeaeae]"
          )}
        >
          <defs></defs>
          <title>send</title>
          <path d="M2.33,44.58,117.33.37a3.63,3.63,0,0,1,5,4.56l-44,115.61h0a3.63,3.63,0,0,1-6.67.28L53.93,84.14,89.12,33.77,38.85,68.86,2.06,51.24a3.63,3.63,0,0,1,.27-6.66Z" />
        </svg>
      </button>
    </div>
  );
}
