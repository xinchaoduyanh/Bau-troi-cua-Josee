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
    return this.configService.get('DATABASE_URL', { infer: true }) as string;
  }

  // Thêm getter cho các biến môi trường khác nếu cần
}
