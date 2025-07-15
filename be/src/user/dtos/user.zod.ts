import { z } from 'zod';

export const UserPublicSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  avatarUrl: z.string().optional(),
  role: z.enum(['ADMIN', 'COMMENTER']),
});

export type UserPublicDto = z.infer<typeof UserPublicSchema>;
