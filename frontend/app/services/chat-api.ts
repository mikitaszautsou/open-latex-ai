import { api } from "./api";
import { socketService } from "./socket-service";

export type AIProvider = "claude" | "gemini" | "openai" | "deepseek" | "cerebras" | "fireworks";

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
  role: Role;
  type: MessageType
}

export interface CreateMessageDto {
  content: string;
  role: Role;
  provider?: AIProvider;
  model?: string;
}

export type MessageDelta = { type: MessageType, content: string }

export enum Role {
  USER = "USER",
  ASSISTANT = "ASSISTANT",
}

export enum MessageType {
  TEXT = 'TEXT',
  THINKING = 'THINKING',
  THINKING_SIGNATURE = 'THINKING_SIGNATURE'
};

export const chatApi = {
  getChats: () => new Promise((resolve: any) => {
    socketService.emitMessage({ message: 'getChats', callback: (data) => resolve(data.chats) })
  }),
  getMessages: (chatId: string): Promise<Message[]> => new Promise((resolve: any) => {
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
  onNewMessageChunk: (callback: (data: {messageId: string, chunk: MessageDelta }) => void) => {
    return socketService.onMessage('newMessageChunk', callback)
  },
  deleteMessage: (messageId: string) => new Promise((resolve: any) => {
    socketService.emitMessage({ message: 'deleteMessage', payload: { messageId }, callback: (data) => resolve(data) })
  }),
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
