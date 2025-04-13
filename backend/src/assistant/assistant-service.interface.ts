import { Role } from "generated/prisma";

export interface Message {
    content: string;
    role: Role;
}

export interface AssistantService {
    generateResponse(messages: Message[]): Promise<string>;
    generateTitleAndEmoji(messageContent: string): Promise<{ title: string; emoji: string }>;
}