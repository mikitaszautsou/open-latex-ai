import { Injectable } from "@nestjs/common";
import { Message } from "./entities/message.entity";
import { ChatService } from "src/chat/chat.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { v4 as uuidv4 } from 'uuid';
import { MessageRole } from "./types/message-role.enum";
import { AssistantFactoryService } from "src/assistant/assistant-factory.service";

@Injectable()
export class MessageService {
    private messages: Message[] = [];
    constructor(private readonly chatService: ChatService, private readonly assistantFactoryService: AssistantFactoryService) {}

    findAllByChatId(chatId: string): Message[] {
        return this.messages.filter(message => message.chatId === chatId);
    }
    async create(chatId: string, createMessageDto: CreateMessageDto): Promise<Message> {
        const newMessage: Message = {
            id: uuidv4(),
            chatId,
            content: createMessageDto.content,
            role: createMessageDto.role,
            createdAt: new Date(),
        }
        this.messages.push(newMessage);
        if (createMessageDto.role === MessageRole.USER) {
            await this.generateAIResponse(chatId)
        }
        return newMessage;
    }
    private async generateAIResponse(chatId: string): Promise<Message> {
        const assistantService = this.assistantFactoryService.getService();
        const messages = await this.findAllByChatId(chatId);
        const responseContent = await assistantService.generateResponse(messages);
        const assistantResponse: Message = {
            id: uuidv4(),
            chatId,
            content: responseContent,
            role: MessageRole.ASSISTANT,
            createdAt: new Date(),
        }
        this.messages.push(assistantResponse);
        return assistantResponse;
    }
}