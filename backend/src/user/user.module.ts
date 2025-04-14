import { Module } from '@nestjs/common';
import { UserService } from './user.service';
// No controller needed for now if only Auth uses it

@Module({
  providers: [UserService],
  exports: [UserService], // Export service for AuthModule
})
export class UserModule {}