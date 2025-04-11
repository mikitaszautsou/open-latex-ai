import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import { useState } from 'react';
import { queryClient } from '~/query-client';
import { chatApi, ROLE } from '~/services/chat-api';

export type ChatInputProps = {
  className?: string;
  chatId?: string;
}

export function ChatInput({ className, chatId }: ChatInputProps) {

  const [message, setMessage] = useState('');

  const { mutate: sendMessageMutation, isPending: isSendingMessage } = useMutation({
    mutationFn: () => chatApi.createMessage(chatId!, {
      content: message,
      role: ROLE.USER,
    }),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] })
    }
  })

  const handleSend = () => {
    if (isSendingMessage) return;
    sendMessageMutation();
  }
  return (
    <div className={clsx("flex items-center gap-2 bg-[#8AB2A6] p-3", isSendingMessage && 'cursor-not-allowed', className)}>
      <textarea
        className={clsx("flex-1 px-3 py-2 border border-transparent rounded-md outline-none", isSendingMessage && 'cursor-not-allowed')}
        value={message}
        disabled={isSendingMessage}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button className={clsx('bg-red-300 px-4 py-2 rounded-md whitespace-nowrap', isSendingMessage && 'cursor-not-allowed')} onClick={handleSend} >Send</button>
    </div>
  )
}