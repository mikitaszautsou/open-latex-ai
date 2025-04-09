import { Module } from '@nestjs/common';
import { ClaudeService } from './claude.service';
import { AssistantFactoryService } from './assistant-factory.service';
import { GeminiService } from './gemini.service';

@Module({
  providers: [ClaudeService, GeminiService, AssistantFactoryService],
  exports: [AssistantFactoryService],
})
export class AssistantModule {}