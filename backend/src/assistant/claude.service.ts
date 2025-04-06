import { Injectable } from "@nestjs/common";
import { AssistantService, Message } from "./assistant-service.interface";
import Anthropic from "@anthropic-ai/sdk";

@Injectable()
export class ClaudeService implements AssistantService {

    private readonly model: string = 'claude-3-7-sonnet-20250219';
    private readonly client: Anthropic;

    constructor() {
        console.log('API KEY', process.env.CLAUDE_API_KEY)
        this.client = new Anthropic({
            apiKey: process.env.CLAUDE_API_KEY
        })
    }

    async generateResponse(messages: Message[]): Promise<string> {
        const anthropicMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        const response = await this.client.messages.create({
            model: this.model,
            max_tokens: 20000,
            temperature: 0,
            messages: anthropicMessages,
            // thinking: {
            //     "type": "enabled",
            //     "budget_tokens": 16000
            // }
        });
        const claudeResponse = response.content[0];
        if (claudeResponse.type === 'text') {
            return claudeResponse.text;
        }
        throw new Error('Unsupported response type.')
    }
}