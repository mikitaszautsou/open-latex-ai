import { Injectable } from "@nestjs/common";
import { Message } from "./entities/message.entity";
import { ChatService } from "src/chat/chat.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { v4 as uuidv4 } from 'uuid';
import { MessageRole } from "./types/message-role.enum";
import { AssistantFactoryService } from "src/assistant/assistant-factory.service";
import { AIProvider } from "src/assistant/ai-provider.type";
import { PrismaService } from "src/prisma/prisma.service";
import { Role } from "generated/prisma";

@Injectable()
export class MessageService {
    constructor(private readonly prisma: PrismaService, private readonly chatService: ChatService, private readonly assistantFactoryService: AssistantFactoryService) { }

    async findAllByChatId(chatId: string): Promise<Message[]> {
        return this.prisma.message.findMany({
            where: {
                chatId,
            }
        })
    }
    async create(chatId: string, createMessageDto: CreateMessageDto): Promise<Message> {
        await this.chatService.ensureChatExists(chatId);

        const newMessage = await this.prisma.message.create({
            data: {
                content: createMessageDto.content,
                role: createMessageDto.role === Role.USER ? Role.USER : Role.ASSISTANT,
                chatId: chatId,
            }
        });

        if (newMessage.role === Role.USER) {
            await this.generateAIResponse(chatId, createMessageDto.provider)
        }
        return newMessage;
    }
    private async generateAIResponse(chatId: string, provider?: AIProvider): Promise<Message> {
        const history = await this.prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: 'asc' },
            select: { content: true, role: true }
        });

        const assistantService = this.assistantFactoryService.getService(provider);
        const responseContent = await assistantService.generateResponse(history);
        const assistantResponse = await this.prisma.message.create({
            data: {
                chatId,
                content: responseContent,
                role: Role.ASSISTANT
            }
        });
        return assistantResponse;
    }
}