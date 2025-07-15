import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy as GithubStrategyBase,
  StrategyOptions,
} from 'passport-github';
import { AppConfigService } from '../../shared/config/app-config.service';
import { GithubProfileResponse } from '../../shared/types/github-profile.type';
import { JwtUser } from '../../shared/types/user.type';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(
  GithubStrategyBase,
  'github',
) {
  constructor(
    private readonly appConfig: AppConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: appConfig.githubClientId,
      clientSecret: appConfig.githubClientSecret,
      callbackURL: appConfig.githubCallbackUrl,
      scope: ['user:email'],
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GithubProfileResponse,
    done: (err: unknown, user?: JwtUser) => void,
  ): Promise<void> {
    const { id, username, emails, photos } = profile;
    const email = emails?.[0]?.value ?? '';
    const avatarUrl = photos?.[0]?.value ?? '';

    const user = await this.authService.validateOAuthUser(
      id,
      username,
      email,
      avatarUrl,
    );
    done(null, user as JwtUser);
  }
}
