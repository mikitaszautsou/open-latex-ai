import { DropdownMenu, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { EllipsisVertical, Pin } from "lucide-react";
import { cn } from "~/lib/utils";
import { ROLE, type Chat } from "~/services/chat-api";
import { ChatInput } from "./chat-input";
import { useMessages } from "~/hooks/use-messages";
import { Message } from "./message";
import { createPortal } from 'react-dom'

export type MorphingConversationType = {
    chat?: Chat;
    position: {
        x: number;
        y: number;
    };
    isChatOpen: boolean;
    onClick: () => void;
}

export function MorphingConversation({ chat, position, isChatOpen, onClick }: MorphingConversationType) {
    const { data: messages } = useMessages(chat?.id);
    if (!chat) return;
    console.log({ isChatOpen });
    return createPortal(<div
        className={cn(
            "fixed w-full top-0 bg-green-50 h-[75px] overflow-hidden transition-all duration-300 z-100",
            isChatOpen && '!h-full !top-0'
            // isActive && "bg-[#edf7ff]"
        )}
        style={{ top: position.y, left: position.x }}
        onClick={onClick}
    >
        <div className="flex items-center gap-4 px-3 py-3 cursor-pointer bg-white transition-[background] hover:bg-[#edf7ff]">
            <div
                className={cn(
                    "flex justify-center items-center bg-[#ecf2f9] rounded-full w-12 h-12 text-[24px] transition-[background]",
                    // isActive && "bg-[#cde0fa]"
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
                <DropdownMenuTrigger className={cn("ml-auto transition-all opacity-100", isChatOpen && 'opacity-0')}>
                    <EllipsisVertical />
                </DropdownMenuTrigger>
            </DropdownMenu>
        </div>
        <div className="absolute flex w-full h-[calc(100vh-73px)] bg-green-300">
            <div
                className="flex flex-col gap-4 px-4 overflow-auto grow basis-0 py-3 pb-30"
                // ref={scrollContainerRef}
            >
                {messages?.map((m) => (
                    <Message
                        author={m.role === ROLE.USER ? "User" : "AI"}
                        role={m.role}
                        message={m.content}
                    />
                ))}
            </div>
            <ChatInput
                className="right-0 bottom-0 left-0 p-2 basis-0 z-10 absolute bottom-0"
                chatId={chat.id}
                onSendMessage={() => { }}
            />
        </div>
    </div>, document.body)
}