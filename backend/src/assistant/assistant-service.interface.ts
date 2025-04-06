
export interface Message {
    content: string;
    role: 'assistant' | 'user';
}

export interface AssistantService {
    generateResponse(messages: Message[]): Promise<string>;
}