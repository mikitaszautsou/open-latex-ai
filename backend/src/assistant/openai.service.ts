import { Injectable, Logger } from '@nestjs/common';
import { AssistantService, Message } from './assistant-service.interface';
import OpenAI from 'openai';
import { Role } from 'generated/prisma'; // to map roles
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

@Injectable()
export class OpenAIService implements AssistantService {
  private readonly logger = new Logger(OpenAIService.name);
  private client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async generateResponse(messages: Message[], model?: string): Promise<string> {
    const used = model ?? 'gpt-3.5-turbo';
    const chat = messages.map(m => ({
      role: m.role === Role.USER ? 'user' : 'assistant',
      content: m.content,
    })) as ChatCompletionMessageParam[];
    const res = await this.client.chat.completions.create({
      model: used,
      messages: chat,
      response_format: { type: 'text' },
      reasoning_effort: 'high',
      store: false,
    });
    const txt = res.choices?.[0]?.message?.content;
    if (typeof txt === 'string') return txt;
    throw new Error('OpenAI: unexpected response format');
  }

  /**
   * you can mirror whatever Claude/Gemini do
   */
  async generateTitleAndEmoji(
    messageContent: string,
  ): Promise<{ title: string; emoji: string }> {
    // naive placeholder – call OpenAI again or copy your Claude prompt
    return { title: 'AI Chat', emoji: '🤖' };
  }
}
