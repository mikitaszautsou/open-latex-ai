import { Role } from "generated/prisma";

export interface Message {
    id: string;
    chatId: string;
    content: string;
    createdAt: Date;
    role: Role;
}

