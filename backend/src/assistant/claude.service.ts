import { Injectable } from "@nestjs/common";
import { AssistantService, BaseAssistantService, Message } from "./assistant-service.interface";
import Anthropic from "@anthropic-ai/sdk";
import { Role } from "generated/prisma";
import { MessageParam } from "@anthropic-ai/sdk/resources";

@Injectable()
export class ClaudeService extends BaseAssistantService {


    private readonly model: string = 'claude-3-7-sonnet-latest';
    private readonly client: Anthropic;

    constructor() {
        super();
        this.client = new Anthropic({
            apiKey: process.env.CLAUDE_API_KEY
        })
    }
    async generateResponseStream(messages: Message[], model?: string): Promise<AsyncIterable<string>> {
        const anthropicMessages = messages.map(msg => ({
            role: msg.role === Role.USER ? 'user' : 'assistant',
            content: msg.content
        }) as MessageParam);

        const response = await this.client.messages.create({
            model: model ?? this.model,
            max_tokens: 20000,
            temperature: 0,
            messages: anthropicMessages,
            stream: true
        });
        return {
            [Symbol.asyncIterator]: async function* () {
                for await (const chunk of response) {
                    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                        yield chunk.delta.text;
                    }
                }
            }
        };
    }
}