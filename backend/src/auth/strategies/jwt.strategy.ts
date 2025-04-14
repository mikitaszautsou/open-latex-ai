import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service'; // Adjust path
import { User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService, // Inject UserService to find user by ID
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  async validate(payload: { sub: string; username: string }): Promise<Omit<User, 'password'>> {
    // Payload contains 'sub' (user ID) and 'username' from AuthService.login
    const user = await this.userService.findOneByUsername(payload.username);
    if (!user) {
      throw new UnauthorizedException('User not found or token invalid');
    }
     // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user; // Exclude password
    return result; // NestJS attaches this to request.user
  }
}