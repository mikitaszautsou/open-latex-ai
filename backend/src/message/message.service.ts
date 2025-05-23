import { Injectable, Logger, ForbiddenException } from '@nestjs/common'; // Add ForbiddenException
import { Message } from './entities/message.entity';
import { ChatService } from 'src/chat/chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { AssistantFactoryService } from 'src/assistant/assistant-factory.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from 'generated/prisma';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly chatService: ChatService,
    private readonly assistantFactoryService: AssistantFactoryService,
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

  async create(
    chatId: string,
    createMessageDto: CreateMessageDto,
    userId: string,
  ): Promise<Message> {
    console.log('creating', { chatId, createMessageDto, userId })
    await this.chatService.ensureChatExists(chatId, userId);
    const chat = (await this.prisma.chat.findUnique({
      where: { id: chatId },
      select: { provider: true, model: true },
    }))!;
    const model = chat.model;
    const isUserMessage = createMessageDto.role === Role.USER;
    const messageCount = isUserMessage
      ? await this.prisma.message.count({ where: { chatId } })
      : 0;

    return await this.prisma.message.create({
      data: {
        content: createMessageDto.content,
        role: createMessageDto.role,
        chatId: chatId,
        type: createMessageDto.type,
      },
    });
  }
  async update(
    messageId: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    console.log('update', { messageId, updateMessageDto })
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: { chat: true },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: updateMessageDto.content,
        role: updateMessageDto.role,
      },
    });
  }

  async delete(messageId: string, userId: string): Promise<void> {
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        chat: {
          userId: userId
        }
      }
    });

    if (!message) {
      throw new Error('Message not found or access denied');
    }

    await this.prisma.message.delete({
      where: { id: messageId }
    });
  }

}
