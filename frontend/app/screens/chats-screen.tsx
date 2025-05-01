import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChatItem } from "~/components/chat-item";
import { Conversation } from "~/components/conversation";
import { useChats } from "~/hooks/use-chats";
import { queryClient } from "~/query-client";
import { chatApi } from "~/services/chat-api";
import clsx from "clsx";
import { FilePenLine } from "lucide-react";

export type ChatsScreenProps = {
  isOpen?: boolean;
  selectedChatId?: string;
  onChatClick?: (id: string) => void;
};

export function ChatsScreen({
  isOpen,
  selectedChatId,
  onChatClick,
}: ChatsScreenProps) {
  const { data: chats } = useChats();
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

  const [showChatsPreview, setShowChatsPreview] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setShowChatsPreview(false);
      }, 300);
    } else {
      setShowChatsPreview(true);
    }
  }, [isOpen]);
  const visibleChats = chats;
  return (
    <div
      className={clsx(
        "absolute w-full left-0 top-0 transition-transform duration-300 flex flex-col h-dvh overscroll-none lg:w-[400px]",
        !isOpen && "translate-x-[-100%]"
      )}
    >
      <div className="flex items-center gap-3 bg-white px-3 shadow-[0px_4px_12px_rgba(0,0,0,0.1)] w-full h-15 z-10">
        <span className="font-bold text-lg lg:hidden">Chats</span>
        <span className="font-bold text-xl flex grow justify-center lg:justify-start">
          V1.4.2
        </span>
        <button
          onClick={handleNewChat}
          className="text-[24px] cursor-pointer ml-auto h-full w-14 flex justify-center items-center"
          disabled={isPending}
        >
          <FilePenLine />
        </button>
      </div>
      <div
        className={clsx(
          "flex flex-col bg-white min-w-[300px] overflow-auto grow basis-0"
        )}
      >
        {visibleChats?.map((c) => (
          <ChatItem
            chat={c}
            onClick={() => onChatClick?.(c.id)}
            isActive={c.id === selectedChatId}
          />
        ))}
      </div>
    </div>
  );
}
