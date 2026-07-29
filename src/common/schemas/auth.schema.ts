import * as z from 'zod';
import { otpSchema, passwordSchema } from './global.schema';

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

export type forgetPassowrdOTPDTO = z.infer<typeof forgetPassowrdOTPSchema>;
export type verifyForgetPasswordOTPDTO = z.infer<
  typeof verifyForgetPasswordOTPSchema
>;
export type resetPasswordDTO = z.infer<typeof resetPasswordSchema>;
