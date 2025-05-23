import { MessageType } from "@prisma/client";
import { Role } from "generated/prisma";

export interface Message {
    type: MessageType;
    content: string;
    role: Role;
}


export type MessageDelta = { type: MessageType, content: string }

export interface AssistantService {
    generateResponse(messages: Message[], model?: string): Promise<string>;
    generateTitleAndEmoji(messageContent: string, model?: string): Promise<{ title: string; emoji: string }>;
}

export interface StreamingAssistService {
    generateResponseStream(messages: Message[], model?: string): Promise<AsyncIterable<MessageDelta>>;
    generateResponse(messages: Message[]): Promise<string>;
}


export abstract class BaseAssistantService implements StreamingAssistService {

    abstract generateResponseStream(messages: Message[], model?: string): Promise<AsyncIterable<MessageDelta>>;

    async generateResponse(messages: Message[]): Promise<string> {
        const messageStream = (await this.generateResponseStream(messages));
        let fullResponse = ''
        for await (const chunk of messageStream) {
            if (chunk.type === 'TEXT') {
                fullResponse += chunk;
            }
        }
        return fullResponse;
    }
}