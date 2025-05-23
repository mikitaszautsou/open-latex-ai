import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AssistantService, Message } from './assistant-service.interface';
import axios from 'axios';
import { Role } from 'generated/prisma';

const ROLES_MAPPING = {
    [Role.ASSISTANT]: 'assistant',
    [Role.USER]: 'user',
};

@Injectable()
export class CerebrasService implements AssistantService, OnModuleInit {
    private readonly logger = new Logger(CerebrasService.name);
    private readonly apiKey: string;
    private readonly apiUrl = 'https://api.cerebras.ai/v1/chat/completions';

    constructor() {
        const apiKey = process.env.CEREBRAS_API_KEY;
        if (!apiKey) {
            console.warn('CEREBRAS_API_KEY not found in environment variables');
            return;
        }
        this.apiKey = apiKey;
    }

    onModuleInit() { }

    async generateTitleAndEmoji(
        messageContent: string,
    ): Promise<{ title: string; emoji: string }> {
        try {
            const prompt = `Based on the following user message, generate a concise chat title (max 5 words) and a single relevant emoji. Output *only* in the format: Title: [Generated Title] Emoji: [Emoji] User Message: "${messageContent}"`;
            const result = await this.generateResponse(
                [{ type: 'TEXT', role: 'USER', content: prompt }],
                'llama-3.3-70b',
            );
            const textResponse = result;

            // Simple parsing - adjust regex if needed for robustness
            const titleMatch = textResponse.match(/Title:\s*(.*)/);
            const emojiMatch = textResponse.match(/Emoji:\s*(.*)/);
            const title = titleMatch ? titleMatch[1].trim() : `Chat about ${messageContent.substring(0, 15)}...`; // Fallback title
            const emoji = emojiMatch ? emojiMatch[1].trim() : '💬'; // Fallback emoji

            // Ensure only one emoji is returned
            const firstEmoji = emoji.match(/\p{Emoji}/u)?.[0] || '💬';
            return { title, emoji: firstEmoji };
        } catch (error) {
            return {
                title: `Chat (${new Date().toLocaleTimeString()})`,
                emoji: '💬',
            };
        }
    }

    async generateResponse(
        messages: Message[],
        modelName: string,
    ): Promise<string> {
        try {
            const formattedMessages = messages.map((msg) => ({
                role: ROLES_MAPPING[msg.role],
                content: msg.content,
            }));

            if (!formattedMessages.some(msg => msg.role === 'system')) {
                formattedMessages.unshift({
                    role: 'system',
                    content: '',
                });
            }

            const response = await axios.post(
                this.apiUrl,
                {
                    model: 'llama-3.3-70b',
                    messages: formattedMessages,
                    stream: false,
                    max_tokens: 8192,
                    temperature: 0.2,
                    top_p: 1,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`,
                    },
                },
            );

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Error generating response from Cerebras:', error);
            throw new Error(`Failed to generate response: ${error.message}`);
        }
    }

    async generateStreamingResponse(
        messages: Message[],
        modelName: string,
        onChunk: (chunk: string) => void,
    ): Promise<void> {
        try {
            const formattedMessages = messages.map((msg) => ({
                role: ROLES_MAPPING[msg.role],
                content: msg.content,
            }));

            // Add system message if not present
            if (!formattedMessages.some(msg => msg.role === 'system')) {
                formattedMessages.unshift({
                    role: 'system',
                    content: '',
                });
            }

            const response = await axios.post(
                this.apiUrl,
                {
                    model: modelName || 'llama-3.3-70b',
                    messages: formattedMessages,
                    stream: true,
                    max_tokens: 8192,
                    temperature: 0.2,
                    top_p: 1,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`,
                    },
                    responseType: 'stream',
                },
            );

            response.data.on('data', (chunk: Buffer) => {
                const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.substring(6);
                        if (data === '[DONE]') return;

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content;
                            if (content) {
                                onChunk(content);
                            }
                        } catch (e) {
                            console.error('Error parsing streaming response:', e);
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error generating streaming response from Cerebras:', error);
            throw new Error(`Failed to generate streaming response: ${error.message}`);
        }
    }
}