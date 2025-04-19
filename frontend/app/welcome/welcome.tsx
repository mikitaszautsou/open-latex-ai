import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChatItem } from "~/components/chat-item";
import { Conversation } from "~/components/conversation";
import { useChats } from "~/hooks/use-chats";
import { queryClient } from "~/query-client";
import { chatApi } from "~/services/chat-api";
import clsx from "clsx";

export function Welcome() {
  const { data: chats, isLoading } = useChats();
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { mutate: createChatMutation, isPending } = useMutation({
    mutationFn: () => chatApi.createChat(),
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      navigate(`/chat/${newChat.id}`);
    },
  });
  const handleNewChat = () => {
    createChatMutation();
  };
  const handleChatClick = (id: string) => {
    navigate(`/chat/${id}`);
    setChatsOpen(false);
  };
  const selectedChat = chats?.find((c) => c.id === chatId);
  const [isChatsOpen, setChatsOpen] = useState(true);
  useEffect(() => {
    if (selectedChat) {
      document.title = `${selectedChat.emoji ?? ""} ${
        selectedChat.title ?? ""
      }`;
    }
  }, [selectedChat]);
  return (
    <main className="flex flex-col h-dvh max-h-dvh text-black">
      <div className="flex min-h-0 basis-0 grow">
        <Conversation onGoBackClick={() => setChatsOpen(true)} />
        <div
          className={clsx(
            "absolute w-full left-0 top-0 transition-transform",
            !isChatsOpen && "translate-x-[-100%]"
          )}
        >
          <div className="flex items-center gap-3 bg-white px-3 shadow-[0px_4px_12px_rgba(0,0,0,0.1)] fixed top-0 w-full h-15">
            <span className="font-bold text-lg">Chats</span>
            <button
              onClick={handleNewChat}
              className="text-[24px] cursor-pointer ml-auto"
              disabled={isPending}
            >
              {isPending ? "⌛" : "📝"}
            </button>
          </div>
          <div
            className={clsx(
              "flex flex-col bg-red-50 min-w-[200px] overflow-auto"
            )}
          >
            {chats?.map((c) => (
              <ChatItem
                isActive={chatId == c.id}
                chat={c}
                onClick={() => handleChatClick(c.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
