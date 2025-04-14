import { Body, Controller, Get, Param, Post, UseGuards, Request } from "@nestjs/common"; // Import UseGuards, Request
import { MessageService } from "./message.service";
import { Message } from "./entities/message.entity";
import { CreateMessageDto } from "./dto/create-message.dto";
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from "@prisma/client";

@UseGuards(JwtAuthGuard) 
@Controller('chat/:chatId/messages')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    @Get()
    async findAll(
        @Param('chatId') chatId: string,
        @Request() req: { user: Omit<User, 'password'> }
    ): Promise<Message[]> {
        return this.messageService.findAllByChatId(chatId, req.user.id);
    }

    @Post()
    async create(
        @Param('chatId') chatId: string,
        @Body() createMessageDto: CreateMessageDto,
        @Request() req: { user: Omit<User, 'password'> }
    ): Promise<Message> {
        return this.messageService.create(chatId, createMessageDto, req.user.id);
    }
}
