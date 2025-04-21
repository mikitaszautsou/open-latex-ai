import { Injectable } from '@nestjs/common';
import { AssistantService } from './assistant-service.interface';
import { ClaudeService } from './claude.service';
import { GeminiService } from './gemini.service';
import { OpenAIService } from './openai.service';
import { AIProvider } from './ai-provider.type';

@Injectable()
export class AssistantFactoryService {
  constructor(
    private claude: ClaudeService,
    private gemini: GeminiService,
    private openai: OpenAIService,
  ) {}

  getService(provider: AIProvider = 'gemini'): AssistantService {
    switch (provider) {
      case 'openai':
        return this.openai;
      case 'gemini':
        return this.gemini;
      case 'claude':
      default:
        return this.claude;
    }
  }
}
