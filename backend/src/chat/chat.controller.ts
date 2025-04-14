import { Body, Controller, Get, NotFoundException, Param, Post, UseGuards, Request } from '@nestjs/common'; // Import UseGuards, Request
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { Chat } from './entities/chat.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Import JwtAuthGuard
import { User } from '@prisma/client';

@UseGuards(JwtAuthGuard) // Apply guard to the whole controller
@Controller('chats')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post()
    async create(
      @Body() createChatDto: CreateChatDto,
      @Request() req: { user: Omit<User, 'password'> } // Get user from request
    ): Promise<Chat> {
        // Pass userId to the service method
        return this.chatService.create(createChatDto, req.user.id);
    }

    @Get()
    async findAll(
       @Request() req: { user: Omit<User, 'password'> }
    ): Promise<Chat[]> {
        // Pass userId to the service method
        return this.chatService.findAll(req.user.id);
    }

    @Get(':id')
    async findOne(
        @Param('id') id: string,
        @Request() req: { user: Omit<User, 'password'> }
    ): Promise<Chat | null> {
        // Pass userId for authorization check
        const chat = await this.chatService.findOne(id, req.user.id);
        if (!chat) {
            throw new NotFoundException(`Chat with ID ${id} not found or access denied`);
        }
        return chat;
    }
}