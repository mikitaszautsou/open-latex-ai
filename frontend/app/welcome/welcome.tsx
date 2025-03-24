import { ChatItem } from "~/components/chat-item";
import { Conversation } from "~/components/conversation";

export function Welcome() {
  return (
    <main className="flex h-screen">
      <div className="flex flex-col bg-red-50 w-[200px] h-full">
        <ChatItem isActive />
        <ChatItem />
        <ChatItem />
      </div>
      <Conversation>
        
      </Conversation>
    </main>
  );
}

