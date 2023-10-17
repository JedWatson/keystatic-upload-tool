import { z } from 'zod';

export const ALLOWED_IMAGE_EXTENSIONS = [
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
] as const;

export const filenamePattern = /^\.([a-z]{1,5})$/;

export const imageUploadSchema = z.object({
  image: z.unknown(),
  filename: z
    .string()
    .regex(/^[a-z0-9-_]+$/, {
      message:
        'filename must only contain alphanumeric characters, dashes and underscores',
    })
    .min(1)
    .max(255),
  extension: z.enum(ALLOWED_IMAGE_EXTENSIONS),
  defaultAltText: z.string(),
  notes: z.string(),
});
