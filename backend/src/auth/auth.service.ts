import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserService } from '../user/user.service'; // Adjust path
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.userService.findOneByUsername(username);
    if (user && await bcrypt.compare(pass, user.password)) {
      return user;
    }
    return null;
  }

  async login(user: Omit<User, 'password'>) {
    const payload = { username: user.username, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
      user: user
    };
  }

   async register(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.userService.findOneByUsername(registerDto.username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }
    return this.userService.create(registerDto);
  }
}