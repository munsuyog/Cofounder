// lib/email.ts
import nodemailer from 'nodemailer';

// Create transporter with Gmail credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    // If using 2FA, you'll need to use an app password
    pass: process.env.GMAIL_APP_PASSWORD,
  }
});

interface StatusUpdateEmailProps {
  to: string;
  name: string;
  gigTitle: string;
  founderName: string;
  founderEmail: string;
}

export async function sendStatusUpdateEmail({
  to,
  name,
  gigTitle,
  founderName,
  founderEmail
}: StatusUpdateEmailProps) {
  try {
    // Create email content
    const mailOptions = {
      from: `"CoFounder" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: `You've been shortlisted for ${gigTitle}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Congratulations ${name}!</h2>
          <p>You've been shortlisted for the position "${gigTitle}".</p>
          <p>${founderName} would like to connect with you to discuss the opportunity further.</p>
          <p>You can reach out directly at: <a href="mailto:${founderEmail}">${founderEmail}</a></p>
          <p>Next steps:</p>
          <ol>
            <li>Review the project details</li>
            <li>Prepare your questions</li>
            <li>Schedule a call with the founder</li>
          </ol>
          <p>Best of luck!</p>
          <p>- The CoFounder Team</p>
        </div>
      `,
      // Add text version for better email client compatibility
      text: `
Congratulations ${name}!

You've been shortlisted for the position "${gigTitle}".

${founderName} would like to connect with you to discuss the opportunity further.

You can reach out directly at: ${founderEmail}

Next steps:
1. Review the project details
2. Prepare your questions
3. Schedule a call with the founder

Best of luck!

- The CoFounder Team
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;

  } catch (error) {
    console.error('Email send error:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Utility function to verify email configuration
export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}