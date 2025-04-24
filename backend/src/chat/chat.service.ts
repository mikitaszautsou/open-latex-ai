import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Chat } from './entities/chat.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssistantFactoryService } from 'src/assistant/assistant-factory.service';
import { AIProvider } from 'src/assistant/ai-provider.type';
import { Role } from 'generated/prisma';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly assistantFactoryService: AssistantFactoryService,
  ) {}

  async create(dto: CreateChatDto, userId: string): Promise<Chat> {
    const chat = await this.prisma.chat.create({
      data: {
        title: dto.title ?? 'New Chat',
        userId,
        provider: dto.provider ?? undefined,
        model: dto.model ?? undefined,
      },
    });

    // if no title was provided, you still update it by id...
    if (!dto.title) {
      return this.prisma.chat.update({
        where: { id: chat.id },
        data: { title: `Chat ${chat.id.slice(0, 8)}` },
      });
    }

    return chat;
  }

  async findAll(userId: string): Promise<Chat[]> {
    return this.prisma.chat.findMany({
      where: { userId },
      orderBy: [
        { pinned: 'desc' },
        {
          createdAt: 'desc',
        },
      ],
    });
  }

  async findOne(id: string, userId: string): Promise<Chat | null> {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
    });
    if (chat && chat.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this chat.',
      );
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
      throw new ForbiddenException(
        `You do not have permission to access chat ${id}.`,
      );
    }
  }

  async generateAndSetTitleAndEmoji(
    chatId: string,
    messageContent: string,
    userId: string,
    provider?: AIProvider,
    model?: string,
  ) {
    await this.ensureChatExists(chatId, userId);
    const svc = this.assistantFactoryService.getService(provider);
    const { title, emoji } = await svc.generateTitleAndEmoji(
      messageContent,
      model,
    );
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { title, emoji },
    });
  }
  async generateAIResponse(
    chatId: string,
    userId: string,
    provider?: AIProvider,
    model?: string,
  ) {
    await this.ensureChatExists(chatId, userId);
    const history = await this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      select: { content: true, role: true },
    });
    const svc = this.assistantFactoryService.getService(provider);
    const content = await svc.generateResponse(history, model);
    return this.prisma.message.create({
      data: { chatId, content, role: Role.ASSISTANT },
    });
  }

  async updateSettings(
    chatId: string,
    dto: UpdateChatDto,
    userId: string,
  ): Promise<Chat> {
    await this.ensureChatExists(chatId, userId);
    return this.prisma.chat.update({
      where: { id: chatId },
      data: {
        provider: dto.provider,
        model: dto.model,
      },
    });
  }

  async pinChat(chatId: string, userId: string): Promise<Chat> {
    await this.ensureChatExists(chatId, userId);
    return this.prisma.chat.update({
      where: { id: chatId },
      data: { pinned: true },
    });
  }

  async unpinChat(chatId: string, userId: string): Promise<Chat> {
    await this.ensureChatExists(chatId, userId);
    return this.prisma.chat.update({
      where: { id: chatId },
      data: { pinned: false },
    });
  }
}
