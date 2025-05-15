import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();

      if (client.data.user) {
        return true;
      }

      const token = this.extractTokenFromHeader(client);
      if (!token) {
        throw new WsException('Unauthorized access');
      }

      const payload = this.jwtService.verify(token);
      client.data.user = payload;
      return true;
    } catch (err) {
      throw new WsException('Unauthorized access');
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const authorization =
      client.handshake.headers.authorization || client.handshake.auth?.token;

    if (!authorization) {
      return undefined;
    }

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
