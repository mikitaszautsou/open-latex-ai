import { Module } from '@nestjs/common';
import { ClaudeService } from './claude.service';
import { AssistantFactoryService } from './assistant-factory.service';
import { GeminiService } from './gemini.service';
import { OpenAIService } from './openai.service';
import { DeepSeekAIService } from './deepseek.service';

@Module({
  providers: [ClaudeService, GeminiService, OpenAIService, DeepSeekAIService, AssistantFactoryService],
  exports: [AssistantFactoryService],
})
export class AssistantModule {}