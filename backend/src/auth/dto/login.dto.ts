import { IsString, IsNotEmpty } from 'class-validator'; // Добавьте IsNotEmpty

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}