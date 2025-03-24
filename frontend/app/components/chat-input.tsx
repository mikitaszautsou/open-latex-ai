import clsx from 'clsx';

export type ChatInputProps = {
    className?: string;
}

export function ChatInput({ className }: ChatInputProps) {
    return (
        <div className={clsx("flex items-center gap-2 bg-[#8AB2A6] p-3", className)}>
          <textarea 
            className="flex-1 px-3 py-2 border border-transparent rounded-md outline-none"
          />
          <button className='bg-red-300 px-4 py-2 rounded-md whitespace-nowrap'>Send</button>
        </div>
      )
}