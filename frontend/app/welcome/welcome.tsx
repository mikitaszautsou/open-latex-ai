import { useQuery } from "@tanstack/react-query";
import { ChatItem } from "~/components/chat-item";
import { Conversation } from "~/components/conversation";
import { useChats } from "~/hooks/use-chats";
import { chatApi } from "~/services/chat-api";

export function Welcome() {
  const { data: chats, isLoading } = useChats();
  console.log({ chats })
  return (
    <main className="flex h-screen">
      <div className="flex flex-col bg-red-50 min-w-[200px] h-full"> 
        {chats?.map(c => (
          <ChatItem isActive title={c.title} />
        ))}
      </div>
      <Conversation>
        
      </Conversation>
    </main>
  );
}

