import { useParams } from "react-router";
import { ChatInput } from "./chat-input";
import { Message } from "./message";
import { useMessages } from "~/hooks/use-messages";
import { useEffect, useRef, useState } from "react";
import {
  chatApi,
  Role,
  type AIProvider,
  type Chat,
  type Message as MessageType,
} from "~/services/chat-api";
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
import { Typing } from "./Typing";
import clsx from "clsx";
import { cn, debounce } from "~/lib/utils";
import { getScrollPosition, saveScrollPosition } from "~/lib/scroll-position";
import { useSwipe } from "~/hooks/use-swiple";

export type ConversationProps = {
  chatId?: string;
  isChatsOpen?: boolean;
  onGoBackClick: () => void;
};

type Assistant = {
  id: string;
  title: string;
  provider: string;
  model: string;
};
const ASSISTANTS: Assistant[] = [
  {
    id: "claude",
    title: "Claude 4 Opus",
    provider: "claude",
    model: "claude-4-opus-latest",
  },
  // {
  //   id: "gemini-2.5-pro",
  //   title: "Gemini 2.5-pro",
  //   provider: "gemini",
  //   model: "gemini-2.5-pro-preview-05-06",
  // },
  // {
  //   id: "gemini-2.5-concise",
  //   title: "Gemini 2.5(concise)",
  //   provider: "gemini",
  //   model: "gemini-2.5-concise",
  // },
  // {
  //   id: "gemini-2.5-google-search",
  //   title: "Gemini 2.5(Google Search)",
  //   provider: "gemini",
  //   model: "gemini-2.5-google-search",
  // },
  // {
  //   id: "gemini-2.5-flash",
  //   title: "Gemini 2.5-flash",
  //   provider: "gemini",
  //   model: "gemini-2.5-flash-preview-04-17",
  // },
  // {
  //   id: "o4-mini",
  //   title: "o4-mini",
  //   provider: "openai",
  //   model: "o4-mini",
  // },
  // {
  //   id: "gpt-4.5",
  //   title: "gpt-4.5",
  //   provider: "openai",
  //   model: "gpt-4.5-preview",
  // },
  // {
  //   id: "o3",
  //   title: "o3",
  //   provider: "openai",
  //   model: "o3",
  // },
  // {
  //   id: "deepseek",
  //   title: "DeepSeek Chat",
  //   provider: "deepseek",
  //   model: "deepseek",
  // },
  // {
  //   id: "cerebras",
  //   title: "LLama-3.3(Cerebras)",
  //   provider: "cerebras",
  //   model: "llama-3.3",
  // },
  {
    id: 'fireworks-deepseek',
    title: 'Deepseek(Fireworks)',
    provider: 'fireworks',
    model: 'deepseek',
  }
];

export function Conversation({
  onGoBackClick,
  chatId,
  isChatsOpen,
}: ConversationProps) {
  const { data: chats, isLoading } = useChats();
  const [isMessageSending, setMessageSending] = useState(false);
  const { data: messages } = useMessages(chatId);
  console.log({ messages })
  const [optimisticMessages, setOptimisticMessages] = useState<MessageType[]>(
    []
  );
  const [newMessageIds, setNewMessageIds] = useState(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesRef = useRef(messages);
  const containerRef = useRef<HTMLDivElement>(null);

  console.log('debug', { chatId, messages })
  // useEffect(() => {
  //   if (messages) {
  //     const currentIds = new Set(messages.map((m) => m.id));
  //     const prevIds = new Set(prevMessagesRef.current?.map((m) => m.id) || []);

  //     const newIds = [...currentIds].filter((id) => !prevIds.has(id));
  //     if (newIds.length > 0) {
  //       setNewMessageIds(new Set(newIds));
  //       // Clear the "new" status after animation completes
  //       setTimeout(() => {
  //         setNewMessageIds(new Set());
  //       }, 1000);
  //     }

  //     prevMessagesRef.current = messages;
  //   }
  // }, [messages]);
  const selectedChat = chats?.find((c) => c.id === chatId);
  const updateSettings = useMutation({
    mutationFn: (patch: { provider?: string; model?: string }) =>
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
  const scrollToBottom = (smooth = true) => {
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({
        behavior: smooth ? "smooth" : "instant",
        top: scrollContainerRef.current?.scrollHeight,
      });
    }, 100);
  };
  const handleMessageSend = (newUserMessage: string) => {
    // setMessageSending(true);
    // const newMessage = {
    //   id: `temp-${Date.now()}`,
    //   content: newUserMessage,
    //   role: ROLE.USER,
    //   pending: true,
    //   chatId: "",
    // } as MessageType;
    // queryClient.setQueryData<MessageType[]>(
    //   ["messages", chatId],
    //   (old) => old?.concat(newMessage) ?? []
    // );
  };
  const handleMessageReceived = (newMessage: MessageType) => {
    setMessageSending(false);
    queryClient.setQueryData<MessageType[]>(
      ["messages", chatId],
      (old) => old?.concat(newMessage) ?? []
    );
  };
  const displayMessages = [...(messages || []), ...optimisticMessages];
  useEffect(() => {
    return chatApi.onNewMessage((newMessage) => {
      console.log('message received', newMessage)
      queryClient.setQueryData<MessageType[]>(
        ["messages", chatId],
        // (old) => old?.map(e => e.id === newMessage.id ? {...e, content: e.content + } : e)
        (old) => {
          const newM = (old || []).concat(newMessage)
          return newM
        }
      );
    })
  }, [queryClient, chatId])

  useEffect(() => {
    return chatApi.onNewMessageChunk((newChunk) => {
      queryClient.setQueryData<MessageType[]>(
        ["messages", chatId],
        (old) => old?.map(e => e.id === newChunk.messageId ? { ...e, content: e.content + newChunk.chunk.content } : e)
      );
    })
  }, [queryClient, chatId])


  useEffect(() => {
    return chatApi.onChatUpdate((chat) => {
      queryClient.setQueryData<MessageType[]>(
        ["chats"],
        (old) => old?.map(c => c.id === chatId ? { ...c, title: chat.title, emoji: chat.emoji } : c)
      );
    })
  }, [queryClient, chatId])


  useEffect(() => {
    if (chatId && scrollContainerRef.current) {
      const savedPosition = getScrollPosition(chatId);
      scrollContainerRef.current.scrollTo(0, savedPosition);
    }
  }, [chatId]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !chatId) return;

    const handleScroll = debounce(() => {
      saveScrollPosition(chatId, container.scrollTop);
    }, 200);

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [chatId]);

  useSwipe(containerRef, {
    onSwipeRight: () => {
      onGoBackClick()
    }
  })

  const deleteMessageMutation = useMutation({
    mutationFn: ({ messageId }: { messageId: string }) =>
      chatApi.deleteMessage(messageId),
    onSuccess: (_, { messageId, ...rest }) => {
      console.log('filtering' ,messageId, rest)
      queryClient.setQueryData<MessageType[]>(
        ['messages', chatId],
        (old) => old?.filter(m => m.id != messageId)
      );
    },
  });

  return (

    <div
      className={cn(
        "relative flex flex-col flex-1 bg-[#eff1f5] min-w-0 grow text basis-0 transition-[padding]",
        isChatsOpen && "lg:pl-[400px]"
      )}
      ref={containerRef}
    >
      <div className="flex items-center bg-white pr-4 shadow-[0px_4px_12px_rgba(0,0,0,0.1)] w-full h-15 basis-0 min-h-14 z-10">
        <button
          className="text-[30px] flex justify-cente h-full w-11 justify-center items-center cursor-pointer lg:hidden"
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
        <span className="text-2xl pr-2  lg:pl-3" onClick={onGoBackClick}>
          {selectedChat?.emoji}
        </span>{" "}
        <span className="text-sm font-bold" onClick={onGoBackClick}>
          {selectedChat?.title}
        </span>
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
        className="flex flex-col gap-4 px-4 overflow-auto grow basis-0 py-3 pb-30"
        ref={scrollContainerRef}
      >
        {displayMessages?.map((m) => (
          <Message
            type={m.type}
            author={m.role === Role.USER ? "User" : "AI"}
            role={m.role}
            message={m.content}
            onDelete={() => deleteMessageMutation.mutate({ messageId: m.id })}
          />
        ))}
      </div>

      <ChatInput
        className="right-0 bottom-0 left-0 p-2 basis-0 z-10"
        chatId={chatId}
        onSendMessage={handleMessageSend}
      />
    </div>
  );
}
