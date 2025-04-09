import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { AIProvider } from 'src/assistant/ai-provider.type';

export class CreateMessageDto {
    @IsNotEmpty()
    @IsString()
    content: string;

    @IsNotEmpty()
    @IsEnum(['user', 'assistant'], { message: 'Role must be either "user" or "assistant"' })
    role: 'user' | 'assistant';

    @IsOptional()
    @IsEnum(['claude', 'gemini'], { message: 'Provider must be either "claude" or "gemini"'})
    provider?: AIProvider;
}
