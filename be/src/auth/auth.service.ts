import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import { AppConfigService } from '@shared/config/app-config.service';
import * as bcrypt from 'bcryptjs';
import ms, { StringValue } from 'ms';
import { v4 as uuidv4 } from 'uuid';
import { AuthRepository } from './auth.repository';
import {
  AuthResponseDto,
  LoginUserDto,
  TokenResponseDto,
} from './dtos/auth.zod';
import { AuthMessage } from './message/auth.message';

@Injectable()
export class AuthService {
  constructor(
    private readonly repo: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly appConfig: AppConfigService,
  ) {}

  async generateTokens(
    userId: string,
    username: string,
    role: Role,
  ): Promise<TokenResponseDto> {
    const payload = { id: userId, username, role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuidv4();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.repo.createRefreshToken({
      token: hashedRefreshToken,
      user: {
        connect: {
          id: userId,
        },
      },
      expiresAt: new Date(
        Date.now() +
          (() => {
            const msValue = ms(
              this.appConfig.jwtRefreshTokenExpiresIn as StringValue,
            );
            return typeof msValue === 'number' ? msValue : ms('7d');
          })(),
      ),
    });
    return { accessToken, refreshToken };
  }

  async validateUser(identifier: string, pass: string) {
    const user = await this.repo.findUserByIdentifier(identifier);
    if (!user) return null;
    const password = user.password ?? '';
    const valid = await bcrypt.compare(pass, password);
    if (!valid) return null;
    return user;
  }

  async validateOAuthUser(
    githubId: string,
    username: string,
    email: string,
    avatarUrl: string,
  ): Promise<User> {
    let user = await this.repo.findUserByGithubId(githubId);
    if (user) {
      user = await this.repo.updateUser(user.id, {
        username,
        email,
        avatarUrl,
      });
    } else {
      user = await this.repo.createUser({
        githubId,
        username,
        email,
        avatarUrl,
        role: Role.COMMENTER,
      });
    }
    return user;
  }

  async refreshTokens(refreshToken: string) {
    const tokens = await this.repo.findActiveRefreshTokens();
    const results = await Promise.all(
      tokens.map(async (token) => {
        const match = await bcrypt.compare(refreshToken, token.token);
        return match ? token : null;
      }),
    );
    const found = results.find((token) => token !== null);
    if (!found) {
      throw new UnauthorizedException(AuthMessage.INVALID_REFRESH_TOKEN);
    }
    if (found.isRevoked) {
      throw new UnauthorizedException(AuthMessage.INVALID_REFRESH_TOKEN);
    }
    if (found.expiresAt < new Date()) {
      throw new UnauthorizedException(AuthMessage.INVALID_REFRESH_TOKEN);
    }
    await this.repo.updateRefreshToken(found.id, { isRevoked: true });
    const user = await this.repo.findUserById(found.userId);
    if (!user) throw new UnauthorizedException(AuthMessage.USER_NOT_FOUND);
    return this.generateTokens(user.id, user.username, user.role);
  }

  async loginOAuth(user: User): Promise<TokenResponseDto> {
    return this.generateTokens(user.id, user.username, user.role);
  }

  async login(body: LoginUserDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(body.username, body.password);
    if (!user) {
      throw new UnauthorizedException(AuthMessage.INVALID_CREDENTIALS);
    }
    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.username,
      user.role,
    );
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        avatarUrl: user.avatarUrl ?? undefined,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    // await this.repo.revokeAllRefreshTokens(userId); Nghèo quá nên xóa chứ k update :D
    await this.repo.deleteAllRefreshTokens(userId);
  }
}
