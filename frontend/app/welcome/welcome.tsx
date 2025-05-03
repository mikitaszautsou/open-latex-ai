import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChatItem } from "~/components/chat-item";
import { Conversation } from "~/components/conversation";
import { useChats } from "~/hooks/use-chats";
import { queryClient } from "~/query-client";
import { chatApi } from "~/services/chat-api";
import clsx from "clsx";
import { ChatsScreen } from "~/screens/chats-screen";
import { useBreakpoints } from "~/hooks/use-media-query";

export function Welcome() {
  const { data: chats, isLoading } = useChats();
  const { chatId } = useParams();
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(
    chatId
  );

  const selectedChat = chats?.find((c) => c.id === chatId);
  const [isChatsOpen, setChatsOpen] = useState(!chatId);
  useEffect(() => {
    if (selectedChat) {
      document.title = `${selectedChat.emoji ?? ""} ${
        selectedChat.title ?? ""
      }`;
    }
  }, [selectedChat]);

  const { isDesktop, isMobile } = useBreakpoints();
  useEffect(() => {
    if (isDesktop) {
      setChatsOpen(true);
    } else {
      setChatsOpen(!chatId);
    }
  }, [isDesktop, isMobile]);
  const handleChatClick = (id: string) => {
    setSelectedChatId(id);
    if (!isDesktop) {
      setChatsOpen(false);
    }
    window.history.pushState({ chatId: id }, "", `/chat/${id}`);
  };
  return (
    <main className="flex flex-col h-dvh max-h-dvh text-black overflow-hidden overscroll-none pb-safe box-border">
      <Conversation
        chatId={selectedChatId}
        onGoBackClick={() => setChatsOpen(true)}
        isChatsOpen={isChatsOpen}
      />
      <ChatsScreen
        selectedChatId={selectedChatId}
        isOpen={isChatsOpen}
        onChatClick={handleChatClick}
      />
    </main>
  );
}
