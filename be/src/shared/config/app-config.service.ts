import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './env.config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService<EnvConfig>) {}

  get nodeEnv(): string {
    return this.configService.get('NODE_ENV', { infer: true }) as string;
  }

  get port(): string {
    return this.configService.get('PORT', { infer: true }) as string;
  }

  get databaseUrl(): string {
    return this.configService.get('DB_URL', { infer: true }) as string;
  }

  get jwtSecret(): string {
    return this.configService.get('JWT_SECRET', { infer: true }) as string;
  }

  get githubClientId(): string {
    return this.configService.get('GITHUB_CLIENT_ID', {
      infer: true,
    }) as string;
  }

  get githubClientSecret(): string {
    return this.configService.get('GITHUB_CLIENT_SECRET', {
      infer: true,
    }) as string;
  }

  get githubCallbackUrl(): string {
    return this.configService.get('GITHUB_CALLBACK_URL', {
      infer: true,
    }) as string;
  }

  get jwtAccessTokenExpiresIn(): string {
    return this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN', {
      infer: true,
    }) as string;
  }
  get jwtRefreshTokenExpiresIn(): string {
    return this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN', {
      infer: true,
    }) as string;
  }
}
