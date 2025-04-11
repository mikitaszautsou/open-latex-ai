import { api } from "./api"

export interface CreateChatDto {
    title?: string;
}

export interface Chat {
    id: string;
    title: string;
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
}

export enum ROLE {
    USER =  'USER',
    ASSISTANT = 'ASSISTANT'
};

export const chatApi = {
    getChats: async (): Promise<Chat[]> => {
        const response = await api.get('/chats')
        return response.data;
    },
    getMessages: async (chatId: string): Promise<Message[]> => {
        const response = await api.get(`/chat/${chatId}/messages`)
        return response.data;
    },
    createMessage: async(chatId: string, message: CreateMessageDto): Promise<Message> => {
        const response = await api.post(`/chat/${chatId}/messages`, message);
        return response.data;
    },
    createChat: async (chat?: CreateChatDto): Promise<Chat> => {
        const response = await api.post('/chats', chat || {})
        return response.data;
    },
}