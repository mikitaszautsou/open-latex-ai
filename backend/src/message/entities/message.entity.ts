export interface Message {
    id: string;
    chatId: string;
    content: string;
    createdAt: Date;
    role: 'user' | 'assistant';
}

