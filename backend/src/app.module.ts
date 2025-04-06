import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';
import { AssistantModule } from './assistant/assistant.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ChatModule, MessageModule, AssistantModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
