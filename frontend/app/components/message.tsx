import clsx from 'clsx';

export type MessageProps = {
    author: string;
    message: string;
}


export function Message({ author, message }: MessageProps ) {
    return (<div className='flex bg-[#8F87F1] p-2.5 rounded-sm'>
        <div className='bg-[#F1E7E7] rounded-md min-w-[60px] max-w-[60px] min-h-[60px] max-h-[60px]' />
        <div className='pl-2'>
            <div>{author}</div>
            <div>{message}</div>
        </div>
    </div>)
}
