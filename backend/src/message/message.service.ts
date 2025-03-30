import { Injectable } from "@nestjs/common";
import { Message } from "./entities/message.entity";
import { ChatService } from "src/chat/chat.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MessageService {
    private messages: Message[] = [];
    constructor(private readonly chatService: ChatService) {}

    findAllByChatId(chatId: string): Message[] {
        return this.messages.filter(message => message.chatId === chatId);
    }
    create(chatId: string, createMessageDto: CreateMessageDto): Message {
        const newMessage: Message = {
            id: uuidv4(),
            chatId,
            content: createMessageDto.content,
            role: createMessageDto.role,
            createdAt: new Date(),
        }
        this.messages.push(newMessage);
        return newMessage;
    }
}