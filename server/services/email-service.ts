import { MailService } from '@sendgrid/mail';

// Initialize SendGrid
const mailService = new MailService();

// Check for SendGrid API key in environment or use provided key for testing
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "SK46b6ded796e32b7ce8d635af8797355a";

if (SENDGRID_API_KEY && SENDGRID_API_KEY !== "SK46b6ded796e32b7ce8d635af8797355a") {
  mailService.setApiKey(SENDGRID_API_KEY);
  console.log('✅ SendGrid API key configured from environment');
} else if (SENDGRID_API_KEY === "SK46b6ded796e32b7ce8d635af8797355a") {
  mailService.setApiKey(SENDGRID_API_KEY);
  console.log('✅ SendGrid API key configured for testing');
} else {
  console.warn('⚠️ SENDGRID_API_KEY not found. Email functionality will be disabled.');
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

// Send email using SendGrid
export async function sendEmail(params: EmailParams): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY || "SK46b6ded796e32b7ce8d635af8797355a";
  if (!apiKey) {
    console.warn('SendGrid API key not configured. Email not sent.');
    return false;
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Send verification email for new users
export async function sendVerificationEmail(
  userEmail: string, 
  userName: string, 
  verificationCode: string, 
  tempPassword: string
): Promise<boolean> {
  const emailParams: EmailParams = {
    to: userEmail,
    from: 'noreply@autolytiq.com', // Use your verified sender email
    subject: 'Welcome to AutolytiQ - Account Verification Required',
    text: `
Welcome to AutolytiQ!

Your account has been created successfully. Please use the following credentials to log in:

Email: ${userEmail}
Temporary Password: ${tempPassword}
Verification Code: ${verificationCode}

Please log in and change your password immediately for security.

Visit: https://autolytiq.com

If you have any questions, please contact our support team.

Best regards,
AutolytiQ Team
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to AutolytiQ</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 30px; }
    .credentials { background: white; border: 2px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .code { font-size: 24px; font-weight: bold; color: #2563eb; text-align: center; padding: 10px; background: #eff6ff; border-radius: 4px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { background: #374151; color: white; padding: 20px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚗 Welcome to AutolytiQ</h1>
      <p>Your Comprehensive Dealership Management System</p>
    </div>
    
    <div class="content">
      <h2>Hello ${userName}!</h2>
      <p>Your AutolytiQ account has been created successfully. You now have access to our comprehensive dealership management platform with advanced analytics and competitive pricing intelligence.</p>
      
      <div class="credentials">
        <h3>🔐 Your Login Credentials</h3>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Temporary Password:</strong> <span style="font-family: monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 3px;">${tempPassword}</span></p>
        
        <div class="code">
          Verification Code: ${verificationCode}
        </div>
      </div>
      
      <p>🔒 <strong>Important Security Notice:</strong></p>
      <ul>
        <li>Please log in and change your password immediately</li>
        <li>Keep your verification code secure</li>
        <li>Never share your login credentials with others</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="https://autolytiq.com" class="button">Log In to AutolytiQ</a>
      </div>
      
      <h3>🚀 What you can do with AutolytiQ:</h3>
      <ul>
        <li>📊 <strong>Analytics Dashboard</strong> - Real-time dealership performance metrics</li>
        <li>🚗 <strong>Inventory Management</strong> - Complete vehicle lifecycle tracking</li>
        <li>👥 <strong>Customer CRM</strong> - Advanced customer relationship management</li>
        <li>💰 <strong>Competitive Pricing</strong> - AI-powered pricing intelligence</li>
        <li>📈 <strong>Sales Pipeline</strong> - Lead tracking and deal management</li>
      </ul>
    </div>
    
    <div class="footer">
      <p>AutolytiQ - Transforming automotive dealership management</p>
      <p>If you have any questions, contact our support team at <a href="mailto:support@autolytiq.com" style="color: #60a5fa;">support@autolytiq.com</a></p>
      <p>&copy; 2025 AutolytiQ. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `
  };

  return await sendEmail(emailParams);
}

// Send password reset email
export async function sendPasswordResetEmail(
  userEmail: string, 
  userName: string, 
  resetToken: string
): Promise<boolean> {
  const resetUrl = `https://autolytiq.com/reset-password?token=${resetToken}`;
  
  const emailParams: EmailParams = {
    to: userEmail,
    from: 'noreply@autolytiq.com',
    subject: 'AutolytiQ - Password Reset Request',
    text: `
Hello ${userName},

You have requested to reset your password for your AutolytiQ account.

Please click the following link to reset your password:
${resetUrl}

This link will expire in 24 hours for security reasons.

If you did not request this password reset, please ignore this email.

Best regards,
AutolytiQ Team
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Password Reset - AutolytiQ</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 30px; }
    .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { background: #374151; color: white; padding: 20px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 Password Reset Request</h1>
    </div>
    
    <div class="content">
      <h2>Hello ${userName},</h2>
      <p>You have requested to reset your password for your AutolytiQ account.</p>
      
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Your Password</a>
      </div>
      
      <p><strong>Important:</strong></p>
      <ul>
        <li>This link will expire in 24 hours</li>
        <li>If you did not request this reset, please ignore this email</li>
        <li>For security, never share this link with anyone</li>
      </ul>
    </div>
    
    <div class="footer">
      <p>AutolytiQ Security Team</p>
      <p>&copy; 2025 AutolytiQ. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `
  };

  return await sendEmail(emailParams);
}

// Send general notification email
export async function sendNotificationEmail(
  userEmail: string, 
  subject: string, 
  message: string
): Promise<boolean> {
  const emailParams: EmailParams = {
    to: userEmail,
    from: 'notifications@autolytiq.com',
    subject: `AutolytiQ - ${subject}`,
    text: message,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 30px; }
    .footer { background: #374151; color: white; padding: 20px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AutolytiQ Notification</h1>
    </div>
    
    <div class="content">
      <h2>${subject}</h2>
      <p>${message}</p>
    </div>
    
    <div class="footer">
      <p>AutolytiQ Team</p>
      <p>&copy; 2025 AutolytiQ. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `
  };

  return await sendEmail(emailParams);
}