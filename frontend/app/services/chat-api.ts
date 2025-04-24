import { api } from "./api";

export type AIProvider = "claude" | "gemini" | "openai";

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
  getChats: async (): Promise<Chat[]> => {
    const response = await api.get("/chats");
    return response.data;
  },
  getMessages: async (chatId: string): Promise<Message[]> => {
    const response = await api.get(`/chat/${chatId}/messages`);
    return response.data;
  },
  createMessage: async (
    chatId: string,
    message: CreateMessageDto
  ): Promise<Message> => {
    const response = await api.post(`/chat/${chatId}/messages`, message);
    return response.data;
  },
  createChat: async (chat?: CreateChatDto): Promise<Chat> => {
    const response = await api.post("/chats", chat || {});
    return response.data;
  },

  updateChatSettings: async (
    chatId: string,
    data: { provider?: "claude" | "gemini" | "openai"; model?: string }
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
