import { Role } from "generated/prisma";

export interface Message {
    content: string;
    role: Role;
}

export interface AssistantService {
    generateResponse(messages: Message[], model?: string): Promise<string>;
    generateTitleAndEmoji(messageContent: string, model?: string): Promise<{ title: string; emoji: string }>;
}