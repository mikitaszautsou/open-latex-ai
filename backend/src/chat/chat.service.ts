import { Injectable, NotFoundException } from '@nestjs/common';
import { Chat } from './entities/chat.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { v4 as uuidv4 } from 'uuid'; // You'll need to install this: npm install uuid
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {


    constructor(private readonly prisma: PrismaService) { };

    async create(createChatDto: CreateChatDto): Promise<Chat> {
        const newChat = await this.prisma.chat.create({
            data: {
                title: createChatDto.title || `New Chat`, // Prisma handles ID, createdAt etc.
            },
        });
        // If no title provided, update it with the ID after creation
        if (!createChatDto.title) {
            return this.prisma.chat.update({
                where: { id: newChat.id },
                data: { title: `Chat ${newChat.id.substring(0, 8)}` }, // Or use a counter if needed
            });
        }
        return newChat;
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
            select: {id: true}
        })
        if (!chat) {
            throw new NotFoundException(`Chat with ID ${id} not found`)
        }
    }
}
