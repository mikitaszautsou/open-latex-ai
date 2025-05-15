import { Role } from "generated/prisma";

export interface Message {
    content: string;
    role: Role;
}

export interface AssistantService {
    generateResponse(messages: Message[], model?: string): Promise<string>;
    generateTitleAndEmoji(messageContent: string, model?: string): Promise<{ title: string; emoji: string }>;
}

export interface StreamingAssistService {
    generateResponseStream(messages: Message[], model?: string): Promise<AsyncIterable<string>>;
    generateResponse(messages: Message[]): Promise<string>;
}

export abstract class BaseAssistantService implements StreamingAssistService {

    abstract generateResponseStream(messages: Message[], model?: string): Promise<AsyncIterable<string>>;

    async generateResponse(messages: Message[]): Promise<string> {
        const messageStream = (await this.generateResponseStream(messages));
        let fullResponse = ''
        for await (const chunk of messageStream) {
            fullResponse += chunk;
        }
        return fullResponse;
    }
}