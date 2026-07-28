import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(5),
  lastName: z.string().min(5),
  email: z.email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});

export type RegisterDto = z.infer<typeof registerSchema>;
