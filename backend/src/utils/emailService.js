const axios = require('axios');

const getApiKey = () => process.env.BREVO_API_KEY;
const getSenderEmail = () => process.env.BREVO_SENDER_EMAIL;
const getSenderName = () => process.env.BREVO_SENDER_NAME || 'Lernnova';
const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:3000';
const isDev = () => process.env.NODE_ENV === 'development';

const sendEmail = async ({ to, subject, html }) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.warn('BREVO_API_KEY not configured — skipping email send to', to);
    return { skipped: true };
  }

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          email: getSenderEmail(),
          name: getSenderName(),
        },
        replyTo: {
          email: getSenderEmail(),
          name: getSenderName(),
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (isDev()) {
      console.error('Brevo send error:', error.response?.data || error.message);
    }
    throw new Error('Failed to send email');
  }
};

const sendVerificationEmail = async (userEmail, rawToken) => {
  const frontendUrl = getFrontendUrl();
  const verificationUrl = `${frontendUrl}/verify-email?token=${rawToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:40px 20px">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)">
        <tr><td style="padding:40px 32px 24px;text-align:center">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.5px">Lernnova</h1>
          <p style="margin:0 0 20px;font-size:14px;color:#64748b;line-height:1.6">Confirm your email to activate your account.</p>
          <a href="${verificationUrl}" style="display:inline-block;padding:14px 32px;border-radius:12px;background:#4A6CF7;color:#fff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:-0.2px">Verify email</a>
          <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;line-height:1.5">This link expires in 24 hours.<br>If you did not create an account with Lernnova, please ignore this email.</p>
        </td></tr>
        <tr><td style="padding:16px 32px;text-align:center;border-top:1px solid #f1f5f9">
          <p style="margin:0;font-size:11px;color:#94a3b8">&copy; Lernnova</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return sendEmail({
    to: userEmail,
    subject: 'Confirm your Lernnova email',
    html,
  });
};

const sendPasswordResetEmail = async (userEmail, rawToken) => {
  const frontendUrl = getFrontendUrl();
  const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:40px 20px">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)">
        <tr><td style="padding:40px 32px 24px;text-align:center">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.5px">Lernnova</h1>
          <p style="margin:0 0 20px;font-size:14px;color:#64748b;line-height:1.6">We received a request to reset your password.</p>
          <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;border-radius:12px;background:#4A6CF7;color:#fff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:-0.2px">Reset password</a>
          <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;line-height:1.5">This link expires in 30 minutes.<br>If you did not request a password reset, please ignore this email.</p>
        </td></tr>
        <tr><td style="padding:16px 32px;text-align:center;border-top:1px solid #f1f5f9">
          <p style="margin:0;font-size:11px;color:#94a3b8">&copy; Lernnova</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return sendEmail({
    to: userEmail,
    subject: 'Reset your Lernnova password',
    html,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
