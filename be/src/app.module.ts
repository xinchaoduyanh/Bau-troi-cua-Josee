import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import CustomZodValidationPipe from '@shared/pipes/custom-zod-validation-pipe';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import { AuthModule } from './auth/auth.module';
import { validateEnv } from './shared/config/env.config';
import { HttpExceptionFilter } from './shared/exception/http-exception.filter';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    AuthModule,
    UserModule,
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
