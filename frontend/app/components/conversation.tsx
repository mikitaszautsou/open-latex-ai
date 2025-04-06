import { useParams } from "react-router"
import { ChatInput } from "./chat-input"
import { Message } from "./message"
import { useMessages } from "~/hooks/use-messages";

export type ConversationProps = {

}

export function Conversation({ }: ConversationProps) {
    const { chatId }= useParams();
    const { data: messages } = useMessages(chatId);
    console.log({ messages });
    
    return (<div className="relative flex flex-col bg-green-50 h-full grow">

        <div className="flex flex-col gap-4 px-4 pt-4 pb-25 overflow-y-auto">
            {messages?.map(m => (
                <Message author="AI" message={m.content} />
            ))}
        </div>

        <ChatInput className="right-0 bottom-0 left-0 absolute p-2 grow" chatId={chatId} />
    </div>)
}