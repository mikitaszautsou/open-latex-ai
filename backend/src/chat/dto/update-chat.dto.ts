import { IsOptional, IsEnum, IsString } from 'class-validator';

export class UpdateChatDto {
  @IsOptional()
  @IsEnum(['claude', 'gemini', 'openai', 'deepseek', 'cerebras', 'fireworks'] as const)
  provider?: string;

  @IsOptional()
  @IsString()
  model?: string;
}