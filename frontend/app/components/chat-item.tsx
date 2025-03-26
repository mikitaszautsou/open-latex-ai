import clsx from 'clsx';

export type ChatItemProps = {
    isActive?: boolean
    title: string;
};

export function ChatItem({ isActive, title }: ChatItemProps) {
    return (<div className={clsx("flex items-center gap-2 px-3 py-3 cursor-pointer", isActive && 'bg-blue-50')}>
        <div className="bg-[#8F87F1] rounded-sm w-10 h-10">
        </div>
        <div className="flex flex-col">
        <div className="font-bold">
            {title}
        </div>
        <div>
            Chat
        </div>
        </div>

    </div>)
}