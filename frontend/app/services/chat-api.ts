import { api } from "./api";
import { socketService } from "./socket-service";

export type AIProvider = "claude" | "gemini" | "openai" | "deepseek" | "cerebras";

export interface CreateChatDto {
  title?: string;
  provider?: AIProvider;
  model?: string;
}

export interface Chat {
  id: string;
  title: string;
  emoji?: string;
  provider: AIProvider;
  model: string;
  pinned: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  content: string;
  role: ROLE;
}

export interface CreateMessageDto {
  content: string;
  role: ROLE;
  provider?: AIProvider;
  model?: string;
}

export enum ROLE {
  USER = "USER",
  ASSISTANT = "ASSISTANT",
}

export const chatApi = {
  getChats: () => new Promise((resolve: any) => {
    socketService.emitMessage({ message: 'getChats', callback: (data) => resolve(data.chats) })
  }),
  getMessages: (chatId: string) => new Promise((resolve: any) => {
    socketService.emitMessage({ message: 'getMessages', payload: { chatId }, callback: (data) => resolve(data) })
  }),
  createMessage: (
    chatId: string,
    message: CreateMessageDto
  ) => {
    socketService.emitMessage({ message: 'createMessage', payload: { chatId, message }})
  },
  onNewMessage: (callback: (data: Message) => void) => {
    return socketService.onMessage('newMessage', callback)
  },
  onNewMessageChunk: (callback: (data: {messageId: string, chunk: string}) => void) => {
    return socketService.onMessage('newMessageChunk', callback)
  },
  onChatUpdate: (callback: (data: { title: string, emoji: string, chatId: string }) => void) => {
    return socketService.onMessage('updateChat', callback)
  },
  createChat: async (chat?: CreateChatDto): Promise<Chat> => {
    const response = await api.post("/chats", chat || {});
    return response.data;
  },

  updateChatSettings: async (
    chatId: string,
    data: { provider?: string; model?: string }
  ): Promise<Chat> => {
    const resp = await api.patch<Chat>(`/chats/${chatId}`, data);
    return resp.data;
  },
  pinChat: async (chatId: string): Promise<Chat> => {
    const response = await api.patch(`/chats/${chatId}/pin`);
    return response.data;
  },

  unpinChat: async (chatId: string): Promise<Chat> => {
    const response = await api.patch(`/chats/${chatId}/unpin`);
    return response.data;
  },
};
