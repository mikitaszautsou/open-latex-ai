import { Injectable } from '@nestjs/common';
import { Chat } from './entities/chat.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { v4 as uuidv4 } from 'uuid'; // You'll need to install this: npm install uuid

@Injectable()
export class ChatService {

    private chats: Chat[] = [];

    create(createChatDto: CreateChatDto): Chat {
        const newChat: Chat = {
            id: uuidv4(),
            title: createChatDto.title || `New Chat ${this.chats.length + 1}`,
            messages: [],
        };
        this.chats.push(newChat);
        return newChat;
    }

    findAll(): Chat[] {
        return this.chats;
    }

    findOne(id: string): Chat | undefined {
        return this.chats.find(chat => chat.id === id);
    }
}
