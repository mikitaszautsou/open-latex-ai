import { IsString, IsOptional, IsEnum } from "class-validator"
import { AIProvider } from "src/assistant/ai-provider.type"

export class CreateChatDto {
  @IsString()
  @IsOptional()
  title?: string

  @IsOptional()
  @IsEnum(['claude','gemini','openai'] as const)
  provider?: AIProvider

  @IsOptional()
  @IsString()
  model?: string
}