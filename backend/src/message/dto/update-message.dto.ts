import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { Role } from 'generated/prisma';

export class UpdateMessageDto {
  @IsString()
  content: string;

  @IsEnum(Role, { message: 'Role must be either "USER" or "ASSISTANT"' })
  role: Role;

}
