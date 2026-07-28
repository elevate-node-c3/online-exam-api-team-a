import * as z from 'zod';
import { otpSchema, passwordSchema } from './global.schema';

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const baseForgetPassowrd = z.strictObject({
  email: z.email(),
});

export const forgetPassowrdOTPSchema = baseForgetPassowrd.extend({});

export const verifyForgetPasswordOTPSchema = baseForgetPassowrd.extend({
  otp: otpSchema,
});

export const resetPasswordSchema = baseForgetPassowrd
  .extend({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type loginDTO = z.infer<typeof loginSchema>;
export type registerDTO = z.infer<typeof registerSchema>;
export type forgetPassowrdOTPDTO = z.infer<typeof forgetPassowrdOTPSchema>;
export type verifyForgetPasswordOTPDTO = z.infer<
  typeof verifyForgetPasswordOTPSchema
>;
export type resetPasswordDTO = z.infer<typeof resetPasswordSchema>;
