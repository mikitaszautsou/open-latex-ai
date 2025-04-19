import { useParams } from "react-router";
import { ChatInput } from "./chat-input";
import { Message } from "./message";
import { useMessages } from "~/hooks/use-messages";
import { useEffect, useRef } from "react";
import { ROLE } from "~/services/chat-api";
import { useChats } from "~/hooks/use-chats";

export type ConversationProps = {
  onGoBackClick: () => void;
};

export function Conversation({ onGoBackClick }: ConversationProps) {
  const { data: chats, isLoading } = useChats();
  const { chatId } = useParams();
  const { data: messages } = useMessages(chatId);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollHeight } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTop = scrollHeight;
    }
  }, [messages, chatId]);
  const selectedChat = chats?.find((c) => c.id === chatId);

  return (
    <div className="relative flex flex-col flex-1 bg-[#eff1f5] min-w-0 grow text">
      <div className="flex items-center gap-3 bg-white px-4 shadow-[0px_4px_12px_rgba(0,0,0,0.1)] fixed top-0 w-full h-15">
        <button
          className="text-[30px] cursor-pointer w-7 flex justify-center"
          onClick={onGoBackClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 320 512"
            className="w-3"
          >
            <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192" />
          </svg>
        </button>
        <span className="text-2xl">{selectedChat?.emoji}</span>{" "}
        <span className="font-bold">{selectedChat?.title}</span>
      </div>
      <div
        className="flex flex-col gap-4 px-4 pt-19 pb-27 overflow-y-auto"
        ref={scrollContainerRef}
      >
        {messages?.map((m) => (
          <Message
            author={m.role === ROLE.USER ? "User" : "AI"}
            role={m.role}
            message={m.content}
          />
        ))}
      </div>

      <ChatInput
        className="right-0 bottom-0 left-0 absolute p-2 grow"
        chatId={chatId}
      />
    </div>
  );
}
