import { Module } from '@nestjs/common';
import { ClaudeService } from './claude.service';
import { AssistantFactoryService } from './assistant-factory.service';

@Module({
  providers: [ClaudeService, AssistantFactoryService],
  exports: [AssistantFactoryService],
})
export class AssistantModule {}