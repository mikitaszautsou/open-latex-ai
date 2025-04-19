import clsx from 'clsx';
import { useNavigate } from 'react-router';
import type { Chat } from '~/services/chat-api';

export type ChatItemProps = {
    isActive?: boolean
    chat: Chat
    onClick?: () => void;
};

export function ChatItem({ chat, isActive, onClick }: ChatItemProps) {
    return (<div className={clsx("flex items-center gap-2 px-3 py-3 cursor-pointer bg-white", isActive && 'bg-white')} onClick={onClick}>
        <div className="flex justify-center items-center bg-[#ecf2f9] rounded-full w-12 h-12 text-[20px]">
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