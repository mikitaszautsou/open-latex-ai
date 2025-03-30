import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export class CreateMessageDto {
    @IsNotEmpty()
    @IsString()
    content: string;

    @IsNotEmpty()
    @IsEnum(['user', 'assistant'], { message: 'Role must be either "user" or "assistant"' })
    role: 'user' | 'assistant';

}
