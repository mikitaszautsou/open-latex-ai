import { Injectable, OnModuleInit } from "@nestjs/common";
import { AssistantService, Message } from "./assistant-service.interface";
import { GoogleGenerativeAI } from "@google/generative-ai";

const ROLES_MAPPING = {
    'assistant': 'model',
    'user': 'user',
}

@Injectable()
export class GeminiService implements AssistantService, OnModuleInit {

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