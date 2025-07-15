import { z } from 'zod';

export const LoginUserSchema = z.object({
  username: z.string(),
  password: z.string().min(6),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export enum Role {
  ADMIN = 'ADMIN',
  COMMENTER = 'COMMENTER',
}

export const RoleEnum = z.enum(Object.values(Role) as [string, ...string[]]);

export const UserPublicSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  avatarUrl: z.string().optional(),
  role: RoleEnum,
});

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserPublicSchema,
});

export const LogoutResponseSchema = z.object({
  success: z.boolean().default(true),
  message: z.string(),
});

export type LoginUserDto = z.infer<typeof LoginUserSchema>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;
export type UserPublicDto = z.infer<typeof UserPublicSchema>;
export type AuthResponseDto = z.infer<typeof AuthResponseSchema>;
export type LogoutResponseDto = z.infer<typeof LogoutResponseSchema>;

export const TokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type TokenResponseDto = z.infer<typeof TokenResponseSchema>;
