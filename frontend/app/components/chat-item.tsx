import clsx from 'clsx';
import { useNavigate } from 'react-router';
import type { Chat } from '~/services/chat-api';

export type ChatItemProps = {
    isActive?: boolean
    chat: Chat
};

export function ChatItem({ chat, isActive }: ChatItemProps) {
    const navgiate = useNavigate();
    const handleClick = () => {
        navgiate(`/chat/${chat.id}`)
    }
    return (<div className={clsx("flex items-center gap-2 px-3 py-3 cursor-pointer", isActive && 'bg-blue-50')} onClick={handleClick}>
        <div className="flex justify-center items-center bg-[#8F87F1] rounded-sm w-10 h-10 text-[24px]">
            {chat.emoji}
        </div>
        <div className="flex flex-col">
            <div className="font-bold">
                {chat.title}
            </div>
            <div>
                ...
            </div>
        </div>

    </div>)
}