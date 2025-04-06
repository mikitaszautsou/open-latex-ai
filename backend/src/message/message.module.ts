import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { ChatModule } from '../chat/chat.module';
import { AssistantModule } from 'src/assistant/assistant.module';

@Module({
  imports: [ChatModule, AssistantModule],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService]
})
export class MessageModule {}