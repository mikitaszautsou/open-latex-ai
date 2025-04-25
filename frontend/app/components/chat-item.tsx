import clsx from "clsx";
import { useNavigate, useParams } from "react-router";
import { chatApi, type Chat } from "~/services/chat-api";
import { Button } from "./ui/button";
import { EllipsisVertical, Pin, PinOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "~/query-client";
import { cn } from "~/lib/utils";

export type ChatItemProps = {
  isActive?: boolean;
  chat: Chat;
  onClick?: () => void;
};

export function ChatItem({ chat, isActive, onClick }: ChatItemProps) {
  const { mutate: pinMutation } = useMutation({
    mutationFn: () => chatApi.pinChat(chat.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  const { mutate: unpinMutation } = useMutation({
    mutationFn: () => chatApi.unpinChat(chat.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  const handlePinToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (chat.pinned) {
      unpinMutation();
    } else {
      pinMutation();
    }
  };
  return (
    <div
      className={cn(
        "flex items-center gap-4 px-3 py-3 cursor-pointer bg-white transition-[background] hover:bg-[#edf7ff]",
        isActive && "bg-[#edf7ff]"
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "flex justify-center items-center bg-[#ecf2f9] rounded-full w-12 h-12 text-[24px] transition-[background]",
          isActive && "bg-[#cde0fa]"
        )}
      >
        {chat.emoji}
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <div className="font-bold text-[#101010] overflow-hidden whitespace-nowrap text-ellipsis">
          {chat.title}
          {chat.pinned && <Pin className="inline-block pl-2 min-w-6 max-w-6" />}
        </div>
        <div className="font-medium text-[#898999]">Test subtitle</div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="ml-auto">
          <EllipsisVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handlePinToggle}>
            {chat.pinned ? (
              <PinOff className="mr-2 h-4 w-4" />
            ) : (
              <Pin className="mr-2 h-4 w-4" />
            )}
            {chat.pinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuItem>Remove</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
