import clsx from 'clsx';

export type ChatItemProps = {
    isActive?: boolean
};

export function ChatItem({ isActive }: ChatItemProps) {
    return (<div className={clsx("flex py-3 px-3 items-center gap-2 cursor-pointer", isActive && 'bg-blue-50')}>
        <div className="bg-[#8F87F1] rounded-sm w-10 h-10">
        </div>
        <div className="flex flex-col">
        <div className="font-bold">
            Title
        </div>
        <div>
            Chat
        </div>
        </div>

    </div>)
}