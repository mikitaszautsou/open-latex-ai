import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Chat } from './entities/chat.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { v4 as uuidv4 } from 'uuid'; // You'll need to install this: npm install uuid
import { PrismaService } from 'src/prisma/prisma.service';
import { AssistantFactoryService } from 'src/assistant/assistant-factory.service';
import { AIProvider } from 'src/assistant/ai-provider.type';

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);

    constructor(private readonly prisma: PrismaService, private readonly assistantFactoryService: AssistantFactoryService) { };

    async create(createChatDto: CreateChatDto): Promise<Chat> {
        const initialTitle = createChatDto.title || `New Chat...`; // Use a temporary title
        const newChat = await this.prisma.chat.create({
            data: {
                title: initialTitle,
                // emoji: '⏳' // Optional: Set a temporary "loading" emoji
            },
        });
        this.logger.log(`Created new chat with temp title: ID ${newChat.id}`);
        return newChat; // Return the chat with the temp title initially
    }


    async findAll(): Promise<Chat[]> {
        return this.prisma.chat.findMany({
            orderBy: {
                createdAt: 'desc',
            }
        });
    }

    async findOne(id: string): Promise<Chat | null> {
        const chat = await this.prisma.chat.findUnique({
            where: { id },
        });
        return chat;
    }

    async ensureChatExists(id: string): Promise<void> {
        const chat = await this.prisma.chat.findUnique({
            where: { id },
            select: { id: true }
        })
        if (!chat) {
            throw new NotFoundException(`Chat with ID ${id} not found`)
        }
    }
    async generateAndSetTitleAndEmoji(chatId: string, firstMessageContent: string, provider?: AIProvider): Promise<void> {
        try {
            this.logger.log(`Generating title/emoji for chat ${chatId} using provider: ${provider || 'default'}`);
            const assistantService = this.assistantFactoryService.getService(provider);
            const { title, emoji } = await assistantService.generateTitleAndEmoji(firstMessageContent);

            this.logger.log(`Generated Title: "${title}", Emoji: ${emoji} for chat ${chatId}`);

            await this.prisma.chat.update({
                where: { id: chatId },
                data: {
                    title: title || `Chat ${chatId.substring(0, 8)}`, // Fallback if title is empty
                    emoji: emoji || '💬', // Fallback if emoji is empty
                },
            });
            this.logger.log(`Successfully updated title and emoji for chat ${chatId}`);
        } catch (error) {
            this.logger.error(`Failed to generate or set title/emoji for chat ${chatId}:`, error);
            // Don't throw error here, just log it. The chat creation/message sending shouldn't fail because of this.
            // Optionally update with a default title/emoji on error if not already done in AI service
            await this.prisma.chat.update({
                where: { id: chatId },
                data: {
                    title: `Chat ${chatId.substring(0, 8)}`, // Ensure a title exists
                    // Keep existing emoji or set default if desired
                },
            }).catch(updateError => {
                this.logger.error(`Failed to update chat ${chatId} with fallback title after generation error:`, updateError);
            });
        }
    }
}
