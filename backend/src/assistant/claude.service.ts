import { Injectable } from "@nestjs/common";
import { AssistantService, BaseAssistantService, Message, MessageDelta } from "./assistant-service.interface";
import Anthropic from "@anthropic-ai/sdk";
import { Role } from "generated/prisma";
import { MessageParam, ThinkingBlock, ThinkingBlockParam } from "@anthropic-ai/sdk/resources";
import { MessageType } from "@prisma/client";
import { Stream } from "@anthropic-ai/sdk/streaming";

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
    async generateResponseStream(messages: Message[], model?: string): Promise<AsyncIterable<MessageDelta>> {

        const anthropicMessages: Anthropic.Messages.MessageParam[] = [];
        console.log({ messages });
        for (const message of messages) {
            if (message.type === 'TEXT') {
                if (message.role === Role.USER) {
                    anthropicMessages.push({
                        role: this.mapToAnthropicRole(message.role),
                        content: [
                            {
                                type: 'text',
                                text: message.content
                            }
                        ]
                    })
                } else if (message.role === Role.ASSISTANT) {
                    const lastMessage = anthropicMessages.at(-1)
                    const lastContent = lastMessage?.content.at(-1) as ThinkingBlockParam;
                    if (lastContent.type === 'thinking') {
                        (lastMessage?.content as Anthropic.Messages.ContentBlockParam[]).push({
                            type: 'text',
                            text: message.content
                        })
                    } else {
                        anthropicMessages.push({
                            role: 'assistant',
                            content: message.content
                        })
                    }
                }
            } else if (message.type === 'THINKING') {
                anthropicMessages.push({
                    role: this.mapToAnthropicRole(message.role),
                    content: [
                        {
                            type: 'thinking',
                            thinking: message.content,
                            signature: '',
                        }
                    ]
                })
            } else if (message.type === 'THINKING_SIGNATURE') {
                const lastMessage = anthropicMessages.at(-1)
                if (lastMessage?.role === 'assistant') {
                    const lastContent = lastMessage.content.at(-1) as ThinkingBlockParam;
                    lastContent.signature = message.content;
                }
            }
        }
        // const anthropicMessages2 = messages.map(msg => ({
        //     role: msg.role === Role.USER ? 'user' : 'assistant',
        //     content: msg.content
        // }) as MessageParam).filter(m => m.content.length > 0);
        console.log(JSON.stringify({ anthropicMessages }, null, 2))
        let response: Stream<Anthropic.Messages.RawMessageStreamEvent>;
        if (model === 'claude-opus-4-no-thinking') {
            response = await this.generateClaudeOpus4Config(anthropicMessages, false);
        } else {
            console.log('using thinking model')
            response = await this.generateClaudeOpus4Config(anthropicMessages, true);
        }
        let currentType: MessageType = 'TEXT';
        return {
            [Symbol.asyncIterator]: async function* () {
                for await (const chunk of response) {
                    if (chunk.type === 'content_block_start') {
                        if (chunk.content_block.type === 'thinking') {
                            currentType = 'THINKING';
                        } else if (chunk.content_block.type === 'text') {
                            currentType = 'TEXT';
                        }
                    } else if (chunk.type === 'content_block_delta') {
                        if (chunk.delta.type === 'signature_delta') {
                            currentType = 'THINKING_SIGNATURE';
                            yield { type: 'THINKING_SIGNATURE', content: chunk.delta.signature }
                        } else if (chunk.delta.type === 'text_delta') {
                            yield { type: currentType, content: chunk.delta.text };
                        } else if (chunk.delta.type === 'thinking_delta') {
                            yield { type: currentType, content: chunk.delta.thinking };
                        }
                    }
                }
            }
        };
    }

    private async generateClaudeOpus4Config(messages: Anthropic.Messages.MessageParam[], includeThinking?: boolean) {
        return await this.client.messages.create({
            model: 'claude-opus-4-20250514',
            max_tokens: 20000,
            temperature: 1,
            messages,
            stream: true,
            ...(includeThinking ? {
                thinking: {
                    "type": "enabled",
                    "budget_tokens": 16000
                }
            } : {})
        });
    }
    private mapToAnthropicRole(role: Role) {
        return role === Role.USER ? 'user' : 'assistant'
    }
}