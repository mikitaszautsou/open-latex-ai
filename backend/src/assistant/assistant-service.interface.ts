import { Role } from "generated/prisma";

export interface Message {
    content: string;
    role: Role;
}

export interface AssistantService {
    generateResponse(messages: Message[]): Promise<string>;
}