import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { ChatItem } from "~/components/chat-item";
import { Conversation } from "~/components/conversation";
import { useChats } from "~/hooks/use-chats";
import { queryClient } from "~/query-client";
import { chatApi } from "~/services/chat-api";

export function Welcome() {
  const { data: chats, isLoading } = useChats();
  const navigate = useNavigate();
  const createChatMutation = useMutation({
    mutationFn: () => chatApi.createChat(),
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      navigate(`/chat/${newChat.id}`);
    },
  });
  const handleNewChat = () => {
    createChatMutation.mutate();
  }
  return (
    <main className="flex h-screen">
      <div className="flex flex-col bg-red-50 min-w-[200px] h-full"> 
        <div className="flex justify-center">
          <button onClick={handleNewChat}>New Chat</button>
        </div>
        {chats?.map(c => (
          <ChatItem isActive chat={c} />
        ))}
      </div>
      <Conversation>

      </Conversation>
    </main>
  );
}

