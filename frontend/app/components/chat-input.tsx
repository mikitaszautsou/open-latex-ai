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
          "bg-[#2886fe] text-white font-semibold px-4 py-2 rounded-full whitespace-nowrap transition-colors h-10 w-10 flex items-center justify-center",
          isSendingMessage && "cursor-not-allowed bg-[#dedede] text-[#aeaeae]"
        )}
        onClick={handleSend}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 122.56 122.88"
          className={clsx(
            "fill-white min-w-5 ml-[-3px] mb-[-2px] transition-colors",
            isSendingMessage && "fill-[#aeaeae]"
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
// https://sketchrepo.com/free-sketch/messaging-app-ui-concept-freebie/
