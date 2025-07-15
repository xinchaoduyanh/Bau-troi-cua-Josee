import { Roles } from '@auth/guards/roles.guard';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role, User } from '@prisma/client';
import { ApiResponseOk } from '@shared/decorators/response.decorator';
import { ZodValidationPipe } from '@shared/pipes/validation.pipe';
import { Request } from 'express';
import { AuthService } from './auth.service';
import {
  AuthResponseDto,
  LoginUserDto,
  LoginUserSchema,
  RefreshTokenDto,
  RefreshTokenSchema,
  TokenResponseDto,
} from './dtos/auth.zod';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthMessage } from './message/auth.message';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Roles(Role.ADMIN)
  @ApiResponseOk(AuthMessage.LOGIN_SUCCESS)
  async login(
    @Body(new ZodValidationPipe(LoginUserSchema)) body: LoginUserDto,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.login(body);
    return result;
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiResponseOk('Redirect to GitHub OAuth')
  githubLogin() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiResponseOk(AuthMessage.GITHUB_LOGIN_SUCCESS)
  async githubCallback(@Req() req: Request): Promise<AuthResponseDto> {
    const user = req.user as User;
    if (!user) throw new UnauthorizedException('User not found');
    const result = await this.authService.loginOAuth(user);
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        avatarUrl: user.avatarUrl ?? '',
      },
    };
  }

  @Post('refresh')
  @ApiResponseOk(AuthMessage.REFRESH_SUCCESS)
  async refresh(
    @Body(new ZodValidationPipe(RefreshTokenSchema)) body: RefreshTokenDto,
  ): Promise<TokenResponseDto> {
    const result = await this.authService.refreshTokens(body.refreshToken);
    return result;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiResponseOk(AuthMessage.LOGOUT_SUCCESS)
  async logout(@Req() req: Request): Promise<void> {
    const user = req.user as User;
    if (!user) throw new UnauthorizedException('User not found');
    await this.authService.logout(user.id);
  }
}
