import { Injectable, Logger } from "@nestjs/common";
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
    private readonly logger = new Logger(MessageService.name); // Add logger

    constructor(private readonly prisma: PrismaService, private readonly chatService: ChatService, private readonly assistantFactoryService: AssistantFactoryService) { }

    async findAllByChatId(chatId: string): Promise<Message[]> {
        return this.prisma.message.findMany({
            where: {
                chatId,
            },
            orderBy: {
                createdAt: 'asc'
            }
        })
    }
    async create(chatId: string, createMessageDto: CreateMessageDto): Promise<Message> {
        await this.chatService.ensureChatExists(chatId);

        const isUserMessage = createMessageDto.role === Role.USER;

        // Check message count *before* creating the new message if it's a user message
        let messageCount = 0;
        if (isUserMessage) {
            messageCount = await this.prisma.message.count({ where: { chatId } });
        }

        const newMessage = await this.prisma.message.create({
            data: {
                content: createMessageDto.content,
                role: createMessageDto.role, // Directly use validated role
                chatId: chatId,
            }
        });
        this.logger.log(`Created message ${newMessage.id} for chat ${chatId} with role ${newMessage.role}`);

        // --- Trigger Title/Emoji Generation and AI Response ---
        if (isUserMessage) {
            // Check if it was the *first* message (count before creation was 0)
            const isFirstMessage = messageCount === 0;

            if (isFirstMessage) {
                 this.logger.log(`First user message in chat ${chatId}. Triggering title/emoji generation.`);
                // Don't await this - let it run in the background
                this.chatService.generateAndSetTitleAndEmoji(
                    chatId,
                    newMessage.content,
                    createMessageDto.provider
                ).catch(err => {
                    // Catch potential errors from the async background task
                    this.logger.error(`Error during background title/emoji generation for chat ${chatId}:`, err);
                });
            }

            // Now, trigger the AI response generation (as before)
             this.logger.log(`Triggering AI response generation for chat ${chatId}`);
            // Also run AI response generation in the background for faster user feedback
             await this.generateAIResponse(chatId, createMessageDto.provider).catch(err => {
                  this.logger.error(`Error during background AI response generation for chat ${chatId}:`, err);
             });
        }
        // --- End Trigger ---

        // Return the newly created message immediately (user or assistant)
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