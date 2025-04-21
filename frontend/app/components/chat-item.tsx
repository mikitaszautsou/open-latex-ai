import clsx from "clsx";
import { useNavigate } from "react-router";
import type { Chat } from "~/services/chat-api";
import { Button } from "./ui/button";
import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export type ChatItemProps = {
  isActive?: boolean;
  chat: Chat;
  onClick?: () => void;
};

export function ChatItem({ chat, isActive, onClick }: ChatItemProps) {
  return (
    <div
      className={clsx(
        "flex items-center gap-4 px-3 py-3 cursor-pointer bg-white",
        isActive && "bg-white"
      )}
      onClick={onClick}
    >
      <div className="flex justify-center items-center bg-[#ecf2f9] rounded-full w-16 h-16 text-[28px]">
        {chat.emoji}
      </div>
      <div className="flex flex-col gap-1">
        <div className="font-bold text-[#101010]">{chat.title}</div>
        <div className="font-medium text-[#898999]">Test subtitle</div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="ml-auto">
          <EllipsisVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Pin</DropdownMenuItem>
          <DropdownMenuItem>Remove</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
