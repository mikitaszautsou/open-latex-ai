import { Injectable } from '@nestjs/common';
import { AssistantService } from './assistant-service.interface';
import { ClaudeService } from './claude.service';
import { GeminiService } from './gemini.service';
import { OpenAIService } from './openai.service';
import { AIProvider } from './ai-provider.type';
import { DeepSeekAIService } from './deepseek.service';

@Injectable()
export class AssistantFactoryService {
  constructor(
    private claude: ClaudeService,
    private gemini: GeminiService,
    private openai: OpenAIService,
    private deepseek: DeepSeekAIService,
  ) { }

  getService(provider: AIProvider = 'gemini'): AssistantService {
    console.log('provider', provider)
    switch (provider) {
      case 'openai':
        return this.openai;
      case 'gemini':
        return this.gemini;
      case 'deepseek':
        return this.deepseek;
      case 'claude':
      default:
        return this.claude;
    }
  }
}
