import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { Role } from 'generated/prisma';
import { AIProvider } from 'src/assistant/ai-provider.type';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsEnum(Role, { message: 'Role must be either "USER" or "ASSISTANT"' })
  role: Role;

}
