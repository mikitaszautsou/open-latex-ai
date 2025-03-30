import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { MessageService } from "./message.service";
import { Message } from "./entities/message.entity";
import { CreateMessageDto } from "./dto/create-message.dto";


@Controller('chat/:chatId/messages')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    @Get()
    findAll(@Param('chatId') chatId: string): Message[] {
        return this.messageService.findAllByChatId(chatId);
    }

    @Post()
    create(@Param('chatId') chatId: string, @Body() createMessageDto: CreateMessageDto): Message {
        return this.messageService.create(chatId, createMessageDto);
    }
}