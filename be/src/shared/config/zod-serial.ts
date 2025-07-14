import { ZodError, ZodSchema } from 'zod';

export function parseWithZod<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ZodValidationException(result.error);
  }
  return result.data;
}

export class ZodValidationException extends Error {
  constructor(public readonly zodError: ZodError) {
    super('Validation failed');
    this.name = 'ZodValidationException';
  }
}
