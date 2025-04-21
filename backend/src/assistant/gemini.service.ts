import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AssistantService, Message } from './assistant-service.interface';
import { GoogleGenAI } from '@google/genai';
import { Role } from 'generated/prisma';

const ROLES_MAPPING = {
  [Role.ASSISTANT]: 'model',
  [Role.USER]: 'user',
};

@Injectable()
export class GeminiService implements AssistantService, OnModuleInit {
  private readonly logger = new Logger(GeminiService.name);
  private readonly apiKey: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found in environment variables');
      return;
    }
    this.apiKey = apiKey;
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

      const result = await this.generateResponse(
        [{ role: 'USER', content: prompt }],
        'gemini-2.5-flash-preview-04-17',
      );
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
  onModuleInit() {}

  async generateResponse(
    messages: Message[],
    modelName: string,
  ): Promise<string> {
    try {
      const genAI = new GoogleGenAI({ apiKey: this.apiKey });
      const history = messages.map((msg) => ({
        role: ROLES_MAPPING[msg.role],
        parts: [{ text: msg.content }],
      }));
      const response = await genAI.models.generateContent({
        model: modelName ?? 'gemini-2.5-pro-preview-03-25',
        config: {
          thinkingConfig: {
            includeThoughts: modelName !== 'gemini-2.5-pro-preview-03-25',
          },
          responseMimeType: 'text/plain',
          // systemInstruction: [
          //   {
          //     text: `sdf`,
          //   },
          // ],
        },
        contents: history,
      });
      return response.text ?? '';
    } catch (error) {
      console.error('Error generating response from Gemini:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }
}
