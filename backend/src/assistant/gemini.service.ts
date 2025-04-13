import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { AssistantService, Message } from "./assistant-service.interface";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Role } from "generated/prisma";

const ROLES_MAPPING = {
    [Role.ASSISTANT]: 'model',
    [Role.USER]: 'user',
}

@Injectable()
export class GeminiService implements AssistantService, OnModuleInit {

    private readonly logger = new Logger(GeminiService.name);
    private readonly model;
    private readonly genAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('GEMINI_API_KEY not found in environment variables');
            return;
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-2.5-pro-exp-03-25"
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

            const result = await this.model.generateContent(prompt); // Use the potentially faster 'flash' model
            const textResponse = result.response.text();

            // Simple parsing - adjust regex if needed for robustness
            const titleMatch = textResponse.match(/Title:\s*(.*)/);
            const emojiMatch = textResponse.match(/Emoji:\s*(.*)/);

            const title = titleMatch ? titleMatch[1].trim() : `Chat about ${messageContent.substring(0, 15)}...`; // Fallback title
            const emoji = emojiMatch ? emojiMatch[1].trim() : '💬'; // Fallback emoji

            // Ensure only one emoji is returned
            const firstEmoji = emoji.match(/\p{Emoji}/u)?.[0] || '💬';

            return { title, emoji: firstEmoji };

        } catch (error) {
            this.logger.error("Error generating title/emoji with Gemini:", error);
            // Return default values on error
            return { title: `Chat (${new Date().toLocaleTimeString()})`, emoji: '💬' };
        }
    }
    onModuleInit() {

    }

    async generateResponse(messages: Message[]): Promise<string> {
        try {
            const generationConfig = {
                temperature: 1,
                topP: 0.95,
                topK: 64,
                maxOutputTokens: 65536,
                responseMimeType: 'text/plain'
            }
            const history = messages.slice(0, -1).map(msg => ({
                role: ROLES_MAPPING[msg.role],
                parts: [{ text: msg.content }]
            }));

            const lastMessage = messages[messages.length - 1];

            const chatSession = this.model.startChat({
                generationConfig,
                history: history.length > 0 ? history : undefined
            });

            const result = await chatSession.sendMessage(lastMessage.content);

            return result.response.text();
        } catch (error) {
            console.error('Error generating response from Gemini:', error);
            throw new Error(`Failed to generate response: ${error.message}`);
        }
    }
}