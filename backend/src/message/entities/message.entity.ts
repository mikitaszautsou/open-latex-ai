import { MessageType } from "@prisma/client";
import { Role } from "generated/prisma";

export interface Message {
    id: string;
    type: MessageType;
    chatId: string;
    content: string;
    createdAt: Date;
    role: Role;
}

