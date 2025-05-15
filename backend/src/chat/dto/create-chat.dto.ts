import { IsString, IsOptional, IsEnum } from "class-validator"

export class CreateChatDto {
  @IsString()
  @IsOptional()
  title?: string

  @IsOptional()
  @IsEnum(['claude', 'gemini', 'openai', 'deepseek', 'cerebras', 'fireworks'] as const)
  provider?: string

  @IsOptional()
  @IsString()
  model?: string
}