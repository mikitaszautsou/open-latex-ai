import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessageService } from "./message.service";
import { UseGuards } from "@nestjs/common";
import { WsJwtGuard } from "src/auth/guards/ws-jwt.guard";
import { CreateMessageDto } from "./dto/create-message.dto";
import { User } from "@prisma/client";
import { ChatService } from "src/chat/chat.service";
import { Message } from "./entities/message.entity";
import { JWTPaylod } from "src/auth/auth.types";
import { FireworksAIService } from "src/assistant/fireworks.service";
import { Readable } from "stream";
import { response } from "express";
import { AssistantFactoryService } from "src/assistant/assistant-factory.service";

@WebSocketGateway({ transports: ['websocket'], cors: { origin: '*' } })
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server; 

    constructor(
        private readonly messageService: MessageService,
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService,
        private readonly assistantFactoryService: AssistantFactoryService
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = this.extractTokenFromHeader(client)
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token);

            client.data.user = payload;

            client.join(`user:${payload.id}`);
        } catch (error) {
            client.disconnect()
            console.error(error)
        }
    }

    handleDisconnect(client: Socket) {
    }


    @UseGuards(WsJwtGuard)
    @SubscribeMessage('sendMessage')
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { chatId: string, message: CreateMessageDto }
    ) {
        const user = client.data.user as JWTPaylod;
        const { chatId, message } = data;

        try {
            const newMessage = await this.messageService.create(chatId, message, user.sub);
            this.server.to(`chat:${chatId}`).emit('newMessage', newMessage);

            return { success: true, messageId: newMessage.id };
        } catch (error) {
            throw new WsException('Failed to send message: ' + error.message);
        }
    }

    @UseGuards(WsJwtGuard)
    @SubscribeMessage('getChats')
    async handleGetChats(
        @ConnectedSocket() client: Socket,
    ): Promise<any> {
        try {
            const user = client.data.user as JWTPaylod;
            const chats = await this.chatService.findAll(user.sub);
            return { chats: chats }
        } catch (error) {
            throw new WsException('Failed to fetch chats: ' + error.message);
        }
    }
    @UseGuards(WsJwtGuard)
    @SubscribeMessage('getMessages')
    async handleGetMessages(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { chatId: string }
    ): Promise<Message[]> {
        try {
            const user = client.data.user as JWTPaylod;
            const { chatId } = data;

            const messages = await this.messageService.findAllByChatId(chatId, user.sub);

            return messages;
        } catch (error) {
            throw new WsException('Failed to fetch messages: ' + error.message);
        }
    }

    @UseGuards(WsJwtGuard)
    @SubscribeMessage('createMessage')
    async handleCreateMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { chatId: string, message: CreateMessageDto }[]
    ) {
        try {
            const user = client.data.user as JWTPaylod;
            const [{ chatId, message }] = data;

            const createdMessage = await this.messageService.create(chatId, message, user.sub);
            this.server.emit('newMessage', createdMessage);

            const chat = await this.chatService.findOne(chatId, user.sub);
            const assistantService = this.assistantFactoryService.getService(chat?.provider);
            const history = await this.messageService.findAllByChatId(chatId, user.sub);
            const responseMessage = await this.messageService.create(chatId, { content: '', role: "ASSISTANT" }, user.sub);
            this.server.emit('newMessage', responseMessage);

            if (history.length <= 1) {
                this.generateChatTitle(chat?.provider, message.content).then(async ({ emoji, title }) => {
                    await this.chatService.updateChat(chatId, { title: title, emoji: emoji })
                    this.server.emit('updateChat', { title, emoji, chatId });
                })
            }
            const messageStream = (await assistantService.generateResponseStream(history));
            let fullResponse = ''
            for await (const chunk of messageStream) {
                this.server.emit('newMessageChunk', { chatId, messageId: responseMessage.id, chunk });
                fullResponse += chunk;
            }
            await this.messageService.update(responseMessage.id, { content: fullResponse, role: responseMessage.role })
        } catch (error) {
            console.error(error)
            throw new WsException('Failed to fetch messages: ' + error.message);
        }
    }

    @UseGuards(WsJwtGuard)
    @SubscribeMessage('generateAIResponse')
    async handleGenerateAIResponse(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { chatId: string }[]
    ) {
        try {
            const user = client.data.user as JWTPaylod;
            const { chatId } = data[0];
            const chat = await this.chatService.findOne(chatId, user.sub);
            const assistantService = this.assistantFactoryService.getService(chat?.provider);
            const history = await this.messageService.findAllByChatId(chatId, user.sub);
            const message = await this.messageService.create(chatId, { content: '', role: "ASSISTANT" }, user.sub);
            this.server.emit('newMessage', message);
            console.log('emitted')
            const messageStream = (await assistantService.generateResponse(history));
            for await (const chunk of messageStream) {
                this.server.emit('newMessageChunk', { chatId, messageId: message.id, chunk });
            }
        } catch (error) {
            console.error(error)
            throw new WsException('Failed to fetch messages: ' + error.message);
        }
    }

    private extractTokenFromHeader(client: Socket): string | undefined {
        const authorization =
            client.handshake.headers.authorization ||
            client.handshake.auth?.token;

        if (!authorization) {
            return undefined;
        }

        const [type, token] = authorization.split(' ');
        return type === 'Bearer' ? token : undefined;
    }

    private async generateChatTitle(provider?: string, message?: string) {

        const prompt = `Based on the following user message, generate a concise chat title (max 5 words) and a single relevant emoji.
Output *only* in the format:
Title: [Generated Title]
Emoji: [Emoji]

User Message: "${message}"`;
        const assistantService = this.assistantFactoryService.getService(provider);
        const result = await assistantService.generateResponse([{ role: 'USER', content: prompt }]); // Use the potentially faster 'flash' model
        const textResponse = result

        // Simple parsing - adjust regex if needed for robustness
        const titleMatch = textResponse.match(/Title:\s*(.*)/);
        const emojiMatch = textResponse.match(/Emoji:\s*(.*)/);

        const title = titleMatch ? titleMatch[1].trim() : `Chat about ${message?.substring(0, 15)}...`; // Fallback title
        const emoji = emojiMatch ? emojiMatch[1].trim() : '💬'; // Fallback emoji

        // Ensure only one emoji is returned
        const firstEmoji = emoji.match(/\p{Emoji}/u)?.[0] || '💬';

        return { title, emoji: firstEmoji };
    }
}