import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { Chat } from './entities/chat.entity';

@Controller('chats')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post()
    create(@Body() CreateChatDto: CreateChatDto): Chat {
        return this.chatService.create(CreateChatDto);
    }

    @Get()
    findAll(): Chat[] {
        return this.chatService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Chat {
        const chat = this.chatService.findOne(id);
        if (!chat) {
            throw new NotFoundException(`Chat with ID ${id} not found`);
        }
        return chat;
    }
    

}
