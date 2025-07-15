import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { validateEnv } from './shared/config/env.config';
import { HttpExceptionFilter } from './shared/exception/http-exception.filter';
import { SharedModule } from './shared/shared.module';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import CustomZodValidationPipe from '@shared/pipes/custom-zod-validation-pipe';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    AuthModule,
    SharedModule,
  ],
  providers: [
    SharedModule,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
  ],
  exports: [SharedModule],
})
export class AppModule {}
