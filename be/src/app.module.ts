import { Module } from '@nestjs/common';
import { PrismaService } from './shared/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './shared/config/env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
