import { z } from 'zod';

export const tripIdSchema = z
  .string()
  .min(1)
  .max(30)
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid trip ID format');

export const chatMessageSchema = z.object({
  tripId: tripIdSchema,
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long (max 2000 characters)'),
  locale: z.enum(['ko', 'en', 'ja', 'zh']).optional(),
});

export const qrUrlSchema = z
  .string()
  .url()
  .max(2048)
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:' || parsed.protocol === 'http:';
      } catch {
        return false;
      }
    },
    { message: 'Only HTTP/HTTPS URLs are allowed' }
  );

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
