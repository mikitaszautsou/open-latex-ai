import { IsOptional, IsEnum, IsString } from 'class-validator';
import { AIProvider } from 'src/assistant/ai-provider.type';

export class UpdateChatDto {
  @IsOptional()
  @IsEnum(['claude', 'gemini', 'openai', 'deepseek', 'cerebras'] as const)
  provider?: AIProvider;

  @IsOptional()
  @IsString()
  model?: string;
}