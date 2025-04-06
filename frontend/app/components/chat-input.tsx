import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import { useState } from 'react';
import { queryClient } from '~/query-client';
import { chatApi } from '~/services/chat-api';

export type ChatInputProps = {
  className?: string;
  chatId?: string;
}

export function ChatInput({ className, chatId }: ChatInputProps) {

  const [message, setMessage] = useState('');

  const { mutate: sendMessageMutation, isPending: isSendingMessage } = useMutation({
    mutationFn: () => chatApi.createMessage(chatId!, {
      content: message,
      role: 'user',
    }),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] })
    }
  })

  const handleSend = () => {
    sendMessageMutation();
  }
  return (
    <div className={clsx("flex items-center gap-2 bg-[#8AB2A6] p-3", className)}>
      <textarea
        className="flex-1 px-3 py-2 border border-transparent rounded-md outline-none"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button className={clsx('bg-red-300 px-4 py-2 rounded-md whitespace-nowrap', isSendingMessage && 'cursor-not-allowed')} onClick={handleSend} >Send</button>
    </div>
  )
}