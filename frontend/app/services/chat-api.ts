import { api } from "./api"

export interface CreateChatDto {
    title?: string;
}

export interface Chat {
    id: string;
    title: string;
}


export interface Message {

}

export const chatApi = {
    getChats: async (): Promise<Chat[]> => {
        const response = await api.get('/chats')
        return response.data;
    },
    getMessages: async (chatId: string): Promise<Message[]> => {
        return [];
    },
    createChat: async (chat?: CreateChatDto): Promise<Chat> => {
        const response = await api.post('/chats', chat || {})
        return response.data;
    },
}