import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async findOneByUsername(username: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { username } });
    }

    async findOneById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        return this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });
    }
}
