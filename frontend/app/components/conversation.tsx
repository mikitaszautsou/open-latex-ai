import { useParams } from "react-router"
import { ChatInput } from "./chat-input"
import { Message } from "./message"
import { useMessages } from "~/hooks/use-messages";
import { useEffect, useRef } from "react";
import { ROLE } from "~/services/chat-api";

export type ConversationProps = {

}

export function Conversation({ }: ConversationProps) {
    const { chatId } = useParams();
    const { data: messages } = useMessages(chatId);
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollContainerRef.current) {
            const { scrollHeight } = scrollContainerRef.current;
            scrollContainerRef.current.scrollTop = scrollHeight;
        }
    }, [messages, chatId]);

    return (<div className="relative flex flex-col flex-1 bg-green-50 min-w-0 grow">

        <div className="flex flex-col gap-4 px-4 pt-4 pb-25 overflow-y-auto" ref={scrollContainerRef}>
            {messages?.map(m => (
                <Message author={m.role === ROLE.USER ? "User" : 'AI'} role={m.role} message={m.content} />
            ))}
        </div>

        <ChatInput className="right-0 bottom-0 left-0 absolute p-2 grow" chatId={chatId} />
    </div>)
}