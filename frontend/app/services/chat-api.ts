import { api } from "./api"

export interface Chat {
    title: string;
}

export const chatApi = {

    getChats: async (): Promise<Chat[]> => {
        const response = await api.get('/chats')
        return response.data;
    }
}