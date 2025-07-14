import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './shared/config/app-config.service';
import { validateEnv } from './shared/config/env.config';
import { PrismaService } from './shared/prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
  ],
  providers: [PrismaService, AppConfigService],
  exports: [PrismaService, AppConfigService],
})
export class AppModule {}
