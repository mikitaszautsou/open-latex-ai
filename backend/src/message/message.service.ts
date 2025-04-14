import { Injectable, Logger, ForbiddenException } from "@nestjs/common"; // Add ForbiddenException
import { Message } from "./entities/message.entity";
import { ChatService } from "src/chat/chat.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { AssistantFactoryService } from "src/assistant/assistant-factory.service";
import { AIProvider } from "src/assistant/ai-provider.type";
import { PrismaService } from "src/prisma/prisma.service";
import { Role } from "generated/prisma";

@Injectable()
export class MessageService {
    private readonly logger = new Logger(MessageService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly chatService: ChatService,
        private readonly assistantFactoryService: AssistantFactoryService
    ) { }

    async findAllByChatId(chatId: string, userId: string): Promise<Message[]> {
        await this.chatService.ensureChatExists(chatId, userId);

        return this.prisma.message.findMany({
            where: {
                chatId,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }

    async create(chatId: string, createMessageDto: CreateMessageDto, userId: string): Promise<Message> {
        await this.chatService.ensureChatExists(chatId, userId);

        const isUserMessage = createMessageDto.role === Role.USER;

        let messageCount = 0;
        if (isUserMessage) {
            messageCount = await this.prisma.message.count({ where: { chatId } });
        }

        const newMessage = await this.prisma.message.create({
            data: {
                content: createMessageDto.content,
                role: createMessageDto.role,
                chatId: chatId,
            },
        });
        this.logger.log(`Created message ${newMessage.id} for chat ${chatId} (User: ${userId}) with role ${newMessage.role}`);

        if (isUserMessage) {
            const isFirstMessage = messageCount === 0;

            if (isFirstMessage) {
                this.logger.log(`First user message in chat ${chatId}. Triggering title/emoji generation.`);
                this.chatService.generateAndSetTitleAndEmoji(
                    chatId,
                    newMessage.content,
                    userId,
                    createMessageDto.provider
                ).catch(err => {
                    this.logger.error(`Error during background title/emoji generation for chat ${chatId}:`, err);
                });
            }

            this.logger.log(`Triggering AI response generation for chat ${chatId}`);
            await this.generateAIResponse(chatId, userId, createMessageDto.provider).catch(err => {
                this.logger.error(`Error during background AI response generation for chat ${chatId}:`, err);
            });
        }

        return newMessage;
    }

    private async generateAIResponse(chatId: string, userId: string, provider?: AIProvider): Promise<Message> {
        await this.chatService.ensureChatExists(chatId, userId);

        const history = await this.prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: 'asc' },
            select: { content: true, role: true },
        });

        if (history.length === 0) {
            this.logger.warn(`Attempted to generate AI response for chat ${chatId} with no history.`);
            throw new Error("Cannot generate AI response with no message history."); // Or handle differently
        }

        const assistantService = this.assistantFactoryService.getService(provider);
        const responseContent = await assistantService.generateResponse(history);
        const assistantResponse = await this.prisma.message.create({
            data: {
                chatId,
                content: responseContent,
                role: Role.ASSISTANT,
            },
        });
        this.logger.log(`Generated AI response message ${assistantResponse.id} for chat ${chatId}`);
        return assistantResponse;
    }
}