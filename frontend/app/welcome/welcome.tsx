import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChatItem } from "~/components/chat-item";
import { Conversation } from "~/components/conversation";
import { useChats } from "~/hooks/use-chats";
import { queryClient } from "~/query-client";
import { chatApi } from "~/services/chat-api";
import clsx from "clsx";
import { ChatsScreen } from "~/screens/ChatsScreen";

export function Welcome() {
  const { data: chats, isLoading } = useChats();
  const { chatId } = useParams();
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>();

  const selectedChat = chats?.find((c) => c.id === chatId);
  const [isChatsOpen, setChatsOpen] = useState(true);
  useEffect(() => {
    if (selectedChat) {
      document.title = `${selectedChat.emoji ?? ""} ${
        selectedChat.title ?? ""
      }`;
    }
  }, [selectedChat]);

  const handleChatClick = (id: string) => {
    setSelectedChatId(id);
    setChatsOpen(false);
  };
  return (
    <main className="flex flex-col h-dvh max-h-dvh text-black overflow-hidden overscroll-none pb-[env(safe-area-inset-bottom,0px)] box-border">
      <Conversation
        chatId={selectedChatId}
        onGoBackClick={() => setChatsOpen(true)}
      />
      <ChatsScreen isOpen={isChatsOpen} onChatClick={handleChatClick} />
    </main>
  );
}
