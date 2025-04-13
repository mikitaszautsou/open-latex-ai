import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ChatItem } from "~/components/chat-item";
import { Conversation } from "~/components/conversation";
import { useChats } from "~/hooks/use-chats";
import { queryClient } from "~/query-client";
import { chatApi } from "~/services/chat-api";

export function Welcome() {
  const { data: chats, isLoading } = useChats();
  const navigate = useNavigate();
  const {mutate: createChatMutation, isPending } = useMutation({
    mutationFn: () => chatApi.createChat(),
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      navigate(`/chat/${newChat.id}`);
    },
  });
  const handleNewChat = () => {
    createChatMutation();
  }
  const [isChatsOpen, setChatsOpen] = useState(true);
  return (
    <main className="flex flex-col h-dvh max-h-dvh text-black">
      <div className="flex items-center gap-1 bg-white px-3 h-12">
        <button className="text-[30px] cursor-pointer" onClick={() => setChatsOpen(!isChatsOpen)}>{!isChatsOpen ? "📘" : "📖"}</button>
        <button onClick={handleNewChat} className="mb-[-4px] text-[24px] cursor-pointer" disabled={isPending}>{isPending ? "⌛" : "📝"}</button>
        </div>
      <div className="flex min-h-0 grow">
        {isChatsOpen && <div className="flex flex-col bg-red-50 min-w-[200px] overflow-auto"> 
          {chats?.map(c => (
            <ChatItem isActive chat={c} />
          ))}
        </div>}
        <Conversation />
      </div>
    </main>
  );
}

