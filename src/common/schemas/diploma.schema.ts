import * as z from 'zod';

export const createDiplomaSchema = z.strictObject({
  diplomaName: z.string().trim().min(1, 'Diploma name is required'),
  diplomaDescription: z
    .string()
    .trim()
    .min(1, 'Diploma description is required'),
});

export type createDiplomaDTO = z.infer<typeof createDiplomaSchema>;
