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
    const chat = messages.map((m) => ({
      role: m.role === Role.USER ? 'user' : 'assistant',
      content: m.content,
    })) as ChatCompletionMessageParam[];
    let res: OpenAI.Chat.Completions.ChatCompletion;
    if (model === 'gpt-4.5-preview') {
      res = await this.client.chat.completions.create({
        model: used,
        messages: chat,
        response_format: { type: 'text' },
        store: false,
        temperature: 1,
        max_completion_tokens: 10000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
    } else {
      res = await this.client.chat.completions.create({
        model: used,
        messages: chat,
        response_format: { type: 'text' },
        reasoning_effort: 'high',
        store: false,
      });
    }
    const txt = res.choices?.[0]?.message?.content;
    if (typeof txt === 'string') return txt;
    throw new Error('OpenAI: unexpected response format');
  }

  async generateTitleAndEmoji(
    messageContent: string,
  ): Promise<{ title: string; emoji: string }> {
    try {
      const prompt = `Based on the following user message, generate a concise chat title (max 5 words) and a single relevant emoji.
Output *only* in the format:
Title: [Generated Title]
Emoji: [Emoji]

User Message: "${messageContent}"`;

      const result = await this.generateResponse([
        { role: 'USER', content: prompt },
      ]); // Use the potentially faster 'flash' model
      const textResponse = result;

      // Simple parsing - adjust regex if needed for robustness
      const titleMatch = textResponse.match(/Title:\s*(.*)/);
      const emojiMatch = textResponse.match(/Emoji:\s*(.*)/);

      const title = titleMatch
        ? titleMatch[1].trim()
        : `Chat about ${messageContent.substring(0, 15)}...`; // Fallback title
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
}
