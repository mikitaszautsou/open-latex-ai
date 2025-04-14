import { Controller, Request, Post, UseGuards, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // Can be used for a /profile endpoint later
import { RegisterDto } from './dto/register.dto';
import { User } from '@prisma/client';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const response = await this.authService.login(loginDto.username, loginDto.password);
        return response;
    }

    //    @Post('register')
    //   async register(@Body() registerDto: RegisterDto) {
    //     const user = await this.authService.register(registerDto);
    //     // Optionally auto-login after registration
    //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //     const { password, ...result } = user;
    //     return this.authService.login(result); // Return token immediately
    //   }

}
