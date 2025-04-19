import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import { useState } from "react";
import { queryClient } from "~/query-client";
import { chatApi, ROLE } from "~/services/chat-api";

export type ChatInputProps = {
  className?: string;
  chatId?: string;
};

export function ChatInput({ className, chatId }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const { mutate: sendMessageMutation, isPending: isSendingMessage } =
    useMutation({
      mutationFn: () =>
        chatApi.createMessage(chatId!, {
          content: message,
          role: ROLE.USER,
        }),
      onSuccess: () => {
        setMessage("");
        queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
      },
    });

  const handleSend = () => {
    if (isSendingMessage) return;
    sendMessageMutation();
  };
  return (
    <div
      className={clsx(
        "flex items-center gap-2 bg-[#ffffff] p-3 shadow-[0px_4px_12px_rgba(0,0,0,0.1)]",
        isSendingMessage && "cursor-not-allowed",
        className
      )}
    >
      <textarea
        className={clsx(
          "flex-1 px-3 py-2 border border-transparent rounded-md outline-none bg-[#ebf2fc]",
          isSendingMessage && "cursor-not-allowed"
        )}
        value={message}
        disabled={isSendingMessage}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        className={clsx(
          "bg-green-600 px-4 py-2 rounded-md whitespace-nowrap",
          isSendingMessage && "cursor-not-allowed bg-yellow-600"
        )}
        onClick={handleSend}
      >
        {isSendingMessage ? "⏳" : "📤"}
      </button>
    </div>
  );
}
// https://sketchrepo.com/free-sketch/messaging-app-ui-concept-freebie/
