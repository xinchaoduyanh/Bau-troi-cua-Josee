/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { AuthRepository } from '@auth/auth.repository';
import { AuthError } from '@auth/message/auth.error';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AppConfigService } from '@shared/config/app-config.service';
import { JwtUser } from '@shared/types/user.type';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly appConfig: AppConfigService,
    private readonly authRepo: AuthRepository,
  ) {
    super({
      jwtFromRequest: (ExtractJwt as any).fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfig.jwtSecret,
    });
  }

  async validate(payload: any): Promise<JwtUser> {
    console.log('JWT payload:', payload);
    const { id } = payload;
    const user = await this.authRepo.findUserById(id);
    if (!user) {
      throw new UnauthorizedException(AuthError.USER_NOT_FOUND);
    }
    return { id: user.id, username: user.username, role: user.role };
  }
}
