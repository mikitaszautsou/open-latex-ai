import { Module } from '@nestjs/common';
import { ClaudeService } from './claude.service';
import { AssistantFactoryService } from './assistant-factory.service';
import { GeminiService } from './gemini.service';
import { OpenAIService } from './openai.service';

@Module({
  providers: [ClaudeService, GeminiService, OpenAIService, AssistantFactoryService],
  exports: [AssistantFactoryService],
})
export class AssistantModule {}