import { APPLICATION_NAME } from '../configs/env.config';

export const forgetPasswordOTPTemplate = ({
  otp,
  firstName,
}: {
  otp: string;
  firstName?: string | undefined;
}): string => {
  const greeting = firstName ? `, ${firstName}` : '';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset your password</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f2f4f8; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f4f8; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 16px rgba(31,45,110,0.08);">
            <tr>
              <td style="background-color:#3654e0; padding:20px 32px;">
                <p style="margin:0; color:#ffffff; font-size:18px; font-weight:700; letter-spacing:0.3px;">
                  Verify code
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 4px; font-size:22px; font-weight:700; color:#161b33;">
                  Welcome to <span style="color:#3654e0;">${APPLICATION_NAME}</span>
                </p>
                <p style="margin:0 0 24px; font-size:14px; color:#6b7280;">
                  Hi${greeting}, use the code below to reset your password.
                </p>
                <div style="text-align:center; margin:0 0 24px;">
                  <span style="display:inline-block; padding:14px 28px; font-size:28px; font-weight:700; letter-spacing:8px; color:#161b33; background-color:#f2f4f8; border:1px solid #d7deee; border-radius:8px;">
                    ${otp}
                  </span>
                </div>
                <p style="margin:0; font-size:13px; color:#6b7280; text-align:center;">
                  This code expires in 2 minutes. Didn't request this? You can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px; background-color:#f7f9fc; text-align:center;">
                <p style="margin:0; font-size:12px; color:#9aa2b1;">
                  &copy; ${new Date().getFullYear()} ${APPLICATION_NAME}. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
