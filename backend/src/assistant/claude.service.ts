import { Injectable } from "@nestjs/common";
import { AssistantService, Message } from "./assistant-service.interface";
import Anthropic from "@anthropic-ai/sdk";
import { Role } from "generated/prisma";
import { MessageParam } from "@anthropic-ai/sdk/resources";

@Injectable()
export class ClaudeService implements AssistantService {

    private readonly model: string = 'claude-3-7-sonnet-latest';
    private readonly client: Anthropic;

    constructor() {
        console.log('API KEY', process.env.CLAUDE_API_KEY)
        this.client = new Anthropic({
            apiKey: process.env.CLAUDE_API_KEY
        })
    }
    async generateTitleAndEmoji(messageContent: string): Promise<{ title: string; emoji: string; }> {
        if (!this.model) throw new Error('Gemini Service not initialized (missing API key?)');
        try {
            const prompt = `Based on the following user message, generate a concise chat title (max 5 words) and a single relevant emoji.
Output *only* in the format:
Title: [Generated Title]
Emoji: [Emoji]

User Message: "${messageContent}"`;

            const result = await this.generateResponse([{ role: 'USER', content: prompt }]); // Use the potentially faster 'flash' model
            const textResponse = result

            // Simple parsing - adjust regex if needed for robustness
            const titleMatch = textResponse.match(/Title:\s*(.*)/);
            const emojiMatch = textResponse.match(/Emoji:\s*(.*)/);

            const title = titleMatch ? titleMatch[1].trim() : `Chat about ${messageContent.substring(0, 15)}...`; // Fallback title
            const emoji = emojiMatch ? emojiMatch[1].trim() : '💬'; // Fallback emoji

            // Ensure only one emoji is returned
            const firstEmoji = emoji.match(/\p{Emoji}/u)?.[0] || '💬';

            return { title, emoji: firstEmoji };

        } catch (error) {
            return { title: `Chat (${new Date().toLocaleTimeString()})`, emoji: '💬' };
        }
    }

    async generateResponse(messages: Message[], model?: string): Promise<string> {
        const anthropicMessages = messages.map(msg => ({
            role: msg.role === Role.USER ? 'user' : 'assistant',
            content: msg.content
        }) as MessageParam);

        const response = await this.client.messages.create({
            model: model ?? this.model,
            max_tokens: 20000,
            temperature: 0,
            messages: anthropicMessages,
        });
        const claudeResponse = response.content[0];
        if (claudeResponse.type === 'text') {
            return claudeResponse.text;
        }
        throw new Error('Unsupported response type.')
    }
}