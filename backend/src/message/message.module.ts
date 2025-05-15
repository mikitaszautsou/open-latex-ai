import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { ChatModule } from '../chat/chat.module';
import { AssistantModule } from 'src/assistant/assistant.module';
import { MessageGateway } from './message.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { FireworksAI } from '@fireworksai/sdk';

@Module({
  imports: [ChatModule, AssistantModule, AuthModule],
  controllers: [MessageController],
  providers: [MessageService, MessageGateway],
  exports: [MessageService]
})
export class MessageModule { }