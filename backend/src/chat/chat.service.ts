import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { Chat } from './entities/chat.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssistantFactoryService } from 'src/assistant/assistant-factory.service'; 
import { AIProvider } from 'src/assistant/ai-provider.type'; 

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly assistantFactoryService: AssistantFactoryService
    ) {}

    async create(createChatDto: CreateChatDto, userId: string): Promise<Chat> {
        const newChat = await this.prisma.chat.create({
            data: {
                title: createChatDto.title || `New Chat`,
                userId: userId,
            },
        });
        if (!createChatDto.title) {
            return this.prisma.chat.update({
                where: { id: newChat.id },
                data: { title: `Chat ${newChat.id.substring(0, 8)}` },
            });
        }
        return newChat;
    }

    async findAll(userId: string): Promise<Chat[]> {
        return this.prisma.chat.findMany({
            where: { userId }, // Filter by user
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string, userId: string): Promise<Chat | null> {
        const chat = await this.prisma.chat.findUnique({
            where: { id },
        });
        if (chat && chat.userId !== userId) {
             throw new ForbiddenException('You do not have permission to access this chat.');
        }
        return chat;
    }

    async ensureChatExists(id: string, userId: string): Promise<void> {
        const chat = await this.prisma.chat.findUnique({
            where: { id },
            select: { id: true, userId: true },
        });
        if (!chat) {
            throw new NotFoundException(`Chat with ID ${id} not found`);
        }
        if (chat.userId !== userId) {
            throw new ForbiddenException(`You do not have permission to access chat ${id}.`);
        }
    }

     async generateAndSetTitleAndEmoji(chatId: string, messageContent: string, userId: string, provider?: AIProvider): Promise<void> {
        try {
            await this.ensureChatExists(chatId, userId);

            this.logger.log(`Generating title and emoji for chat ${chatId} using provider ${provider || 'default'}`);
            const assistantService = this.assistantFactoryService.getService(provider);
            const { title, emoji } = await assistantService.generateTitleAndEmoji(messageContent);

            this.logger.log(`Generated title: "${title}", emoji: ${emoji} for chat ${chatId}`);

             await this.prisma.chat.update({
                where: { id: chatId },
                data: { title, emoji },
            });
             this.logger.log(`Successfully updated chat ${chatId} with title and emoji.`);
        } catch (error) {
             this.logger.error(`Failed to generate or set title/emoji for chat ${chatId}: ${error.message}`, error.stack);
        }
    }
}