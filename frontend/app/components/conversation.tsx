import { useParams } from "react-router";
import { ChatInput } from "./chat-input";
import { Message } from "./message";
import { useMessages } from "~/hooks/use-messages";
import { useEffect, useRef, useState } from "react";
import { chatApi, ROLE, type AIProvider, type Chat } from "~/services/chat-api";
import { useChats } from "~/hooks/use-chats";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "~/query-client";

export type ConversationProps = {
  chatId?: string;
  onGoBackClick: () => void;
};

type Assistant = {
  id: string;
  title: string;
  provider: AIProvider;
  model: string;
};
const ASSISTANTS: Assistant[] = [
  {
    id: "claude",
    title: "Claude 3.7 Sonnet",
    provider: "claude",
    model: "claude-3-7-sonnet-latest",
  },
  {
    id: "gemini-2.5-pro",
    title: "Gemini 2.5-pro",
    provider: "gemini",
    model: "gemini-2.5-pro-preview-03-25",
  },
  {
    id: "gemini-2.5-flash",
    title: "Gemini 2.5-flash",
    provider: "gemini",
    model: "gemini-2.5-flash-preview-04-17",
  },
  {
    id: "o4-mini",
    title: "o4-mini",
    provider: "openai",
    model: "o4-mini",
  },
  {
    id: "gpt-4.5",
    title: "gpt-4.5",
    provider: "openai",
    model: "gpt-4.5-preview",
  },
];
export function Conversation({ onGoBackClick, chatId }: ConversationProps) {
  const { data: chats, isLoading } = useChats();
  const { data: messages } = useMessages(chatId);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollHeight } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTop = scrollHeight;
    }
  }, [messages, chatId]);
  const selectedChat = chats?.find((c) => c.id === chatId);
  const updateSettings = useMutation({
    mutationFn: (patch: { provider?: AIProvider; model?: string }) =>
      chatApi.updateChatSettings(chatId!, patch),
    onSuccess: (updated) => {
      queryClient.setQueryData<Chat[]>(
        ["chats"],
        (old) => old?.map((c) => (c.id === updated.id ? updated : c)) ?? []
      );
    },
  });
  const selectedAssistant = ASSISTANTS.find(
    (a) =>
      a.provider == selectedChat?.provider && a.model == selectedChat?.model
  );
  const handleAssistantChange = (assistantId: string) => {
    const assistantConfig = ASSISTANTS.find((a) => a.id === assistantId);
    if (!assistantConfig) return;
    updateSettings.mutate({
      provider: assistantConfig.provider,
      model: assistantConfig.model,
    });
  };
  return (
    <div className="relative flex flex-col flex-1 bg-[#eff1f5] min-w-0 grow text basis-0">
      <div className="flex items-center bg-white pr-4 shadow-[0px_4px_12px_rgba(0,0,0,0.1)] w-full h-15 basis-0 min-h-14">
        <button
          className="text-[30px] flex justify-cente h-full w-11 justify-center items-center cursor-pointer"
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
        <span className="text-2xl pr-2">{selectedChat?.emoji}</span>{" "}
        <span className="text-sm font-bold">{selectedChat?.title}</span>
        <span className="ml-auto">
          <Select
            value={selectedAssistant?.id}
            onValueChange={handleAssistantChange}
          >
            <SelectTrigger className="w-42">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSISTANTS.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </span>
      </div>
      <div
        className="flex flex-col gap-4 px-4 overflow-auto grow basis-0 py-3"
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
        className="right-0 bottom-0 left-0 p-2 basis-0"
        chatId={chatId}
      />
    </div>
  );
}
