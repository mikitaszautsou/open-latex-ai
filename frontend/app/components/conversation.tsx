import { ChatInput } from "./chat-input"
import { Message } from "./message"

export type ConversationProps = {

}

export function Conversation({ }: ConversationProps) {
    return (<div className="relative flex flex-col bg-green-50 grow">
        <div className="flex flex-col gap-4 px-4 pt-4">
            <Message author="AI" message="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo qui, quisquam nesciunt deleniti dolorum quas est obcaecati. Animi asperiores sequi, doloremque illo hic deserunt blanditiis labore nesciunt vero corporis a!" />
            <Message author="Human" message="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo qui, quisquam nesciunt deleniti dolorum quas est obcaecati. Animi asperiores sequi, doloremque illo hic deserunt blanditiis labore nesciunt vero corporis a!" />
        </div>

        <ChatInput className="right-0 bottom-0 left-0 absolute p-2 grow" />
    </div>)
}