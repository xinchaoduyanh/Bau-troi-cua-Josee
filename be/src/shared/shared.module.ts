import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './config/app-config.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [ConfigModule],
  providers: [AppConfigService, PrismaService],
  exports: [AppConfigService, PrismaService],
})
export class SharedModule {}
