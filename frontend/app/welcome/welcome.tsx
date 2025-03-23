import { ChatItem } from "~/components/ChatItem";

export function Welcome() {
  return (
    <main className="flex h-screen">
      <div className="flex w-[200px] h-full bg-red-50 flex-col">
        <ChatItem />
        <ChatItem />
        <ChatItem />
      </div>
      <div className="flex grow bg-green-50">
        chat
      </div>
    </main>
  );
}

