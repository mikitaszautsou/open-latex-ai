import { Injectable } from '@nestjs/common';
import { AssistantService, StreamingAssistService } from './assistant-service.interface';
import { ClaudeService } from './claude.service';
import { GeminiService } from './gemini.service';
import { OpenAIService } from './openai.service';
import { DeepSeekAIService } from './deepseek.service';
import { CerebrasService } from './cerebras-ai.service';
import { FireworksAI } from '@fireworksai/sdk';
import { FireworksAIService } from './fireworks.service';

@Injectable()
export class AssistantFactoryService {
  constructor(
    private fireworksService: FireworksAIService,
    private claudeService: ClaudeService,
  ) { }

  getService(provider: string = 'gemini'): StreamingAssistService {
    switch (provider) {
      case 'fireworks':
        return this.fireworksService;
      case 'claude':
        return this.claudeService;
      default:
        return this.fireworksService;
    }
  }
}
