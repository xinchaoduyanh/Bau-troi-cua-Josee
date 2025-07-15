import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { Roles } from '@auth/guards/roles.guard';
import {
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ApiResponseOk } from '@shared/decorators/response.decorator';
import { UserPublicDto } from './dtos/user.zod';
import { UserService } from './user.service';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 1. Public user profile
  @Get(':id')
  @ApiResponseOk('Lấy thông tin người dùng công khai thành công')
  async getPublicUser(@Param('id') id: string): Promise<UserPublicDto> {
    return this.userService.findPublicUserById(id);
  }

  // 2. Admin: list users
  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @ApiResponseOk('Lấy danh sách người dùng thành công')
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('role') role?: Role,
  ): Promise<UserPublicDto[]> {
    // TODO: implement pagination, search, filter
    return this.userService.findAllUsers(page, limit, search, role);
  }

  // 3. Admin: delete user
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @ApiResponseOk('Xóa người dùng thành công')
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.userService.deleteUser(id);
  }
}
