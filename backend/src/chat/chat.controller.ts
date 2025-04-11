import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { Chat } from './entities/chat.entity';

@Controller('chats')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post()
    async create(@Body() CreateChatDto: CreateChatDto): Promise<Chat> {
        return this.chatService.create(CreateChatDto);
    }

    @Get()
    async findAll(): Promise<Chat[]> {
        return this.chatService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Chat | null> {
        const chat = this.chatService.findOne(id);
        if (!chat) {
            throw new NotFoundException(`Chat with ID ${id} not found`);
        }
        return chat;
    }
    
}
