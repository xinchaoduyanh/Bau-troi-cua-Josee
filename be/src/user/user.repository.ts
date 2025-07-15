import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '@shared/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findPublicUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        role: true,
      },
    });
  }

  findAllUsers(params: {
    page: number;
    limit: number;
    search?: string;
    role?: Role;
  }) {
    return this.prisma.user.findMany({
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      where: {
        username: {
          contains: params.search,
        },
        role: params.role,
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        role: true,
        email: true,
      },
    });
  }

  deleteUser(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
