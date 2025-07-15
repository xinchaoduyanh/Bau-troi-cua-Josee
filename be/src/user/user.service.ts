import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UserPublicDto } from './dtos/user.zod';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly repo: UserRepository) {}

  async findPublicUserById(id: string): Promise<UserPublicDto> {
    const user = await this.repo.findPublicUserById(id);
    if (!user) throw new NotFoundException('User not found');
    return { ...user, avatarUrl: user.avatarUrl ?? undefined };
  }

  async findAllUsers(
    page: number,
    limit: number,
    search?: string,
    role?: Role,
  ): Promise<UserPublicDto[]> {
    // TODO: implement pagination, filter
    const users = await this.repo.findAllUsers({ page, limit, search, role });
    return users.map((u) => ({ ...u, avatarUrl: u.avatarUrl ?? undefined }));
  }

  async deleteUser(id: string): Promise<void> {
    await this.repo.deleteUser(id);
  }
}
