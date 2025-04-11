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
  const [isChatsOpen, setChatsOpen] = useState(true);
  return (
    <main className="flex flex-col max-h-screen text-black">
      <div className="flex items-center bg-white px-3 h-9">
        <button className="text-[30px] cursor-pointer" onClick={() => setChatsOpen(!isChatsOpen)}>{!isChatsOpen ? "↕️" : "⏫"}</button>
        </div>
      <div className="flex min-h-0">
        {isChatsOpen && <div className="flex flex-col bg-red-50 min-w-[200px] overflow-auto"> 
          <div className="flex justify-center">
            <button onClick={handleNewChat} className="text-[40px]">🆕</button>
          </div>
          {chats?.map(c => (
            <ChatItem isActive chat={c} />
          ))}
        </div>}
        <Conversation>

        </Conversation>
      </div>
    </main>
  );
}

