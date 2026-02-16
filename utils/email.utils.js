const Brevo = require('@getbrevo/brevo');
require('dotenv').config();

let apiInstance = new Brevo.TransactionalEmailsApi();
let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY; 

const sendVerificationEmail = async (userEmail, otp) => {
  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.subject = "Verify your Email - OTP";
    sendSmtpEmail.to = [{ email: userEmail }];
    sendSmtpEmail.sender = { name: "University Tech Portal", email: process.env.EMAIL_USER };
    sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Verification</h2>
          <p>You are receiving this email because you requested to sign up.</p>
          <p>Your 6-digit OTP is: <strong><span style="font-size: 24px;">${otp}</span></strong></p>
          <p>This OTP is valid for 15 minutes.</p>
        </div>
      `;

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Message sent successfully. ID:', data.messageId);
    return true;
  } catch (error) {
    console.error('Brevo Error:', error);
    throw new Error('Could not send verification email.');
  }
};

const sendPasswordResetEmail = async (userEmail, otp) => {
  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.subject = "Event Flow - Password Reset OTP";
    sendSmtpEmail.to = [{ email: userEmail }];
    sendSmtpEmail.sender = { name: "Event Flow", email: process.env.EMAIL_USER };
    sendSmtpEmail.htmlContent = `
        <div style="background-color:#f4f6f8; padding:40px 0; font-family:Arial, sans-serif;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:30px; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            <h2 style="color:#1e293b; text-align:center; margin-bottom:10px;">Password Reset Request</h2>
            <p style="color:#475569; font-size:14px; text-align:center; margin-bottom:30px;">
              We received a request to reset your password for <strong>Event Flow</strong>.
            </p>
            <div style="text-align:center; margin:30px 0;">
              <span style="display:inline-block; background:#2563eb; color:#ffffff; font-size:28px; font-weight:bold; letter-spacing:4px; padding:15px 30px; border-radius:8px;">
                ${otp}
              </span>
            </div>
            <p style="color:#64748b; font-size:14px; text-align:center;">This OTP is valid for <strong>15 minutes</strong>.</p>
            <hr style="margin:30px 0; border:none; border-top:1px solid #e2e8f0;" />
            <p style="color:#94a3b8; font-size:12px; text-align:center;">
              If you did not request a password reset, please ignore this email.<br/>
              © ${new Date().getFullYear()} Event Flow. All rights reserved.
            </p>
          </div>
        </div>
      `;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Password reset email sent.");
    return true;

  } catch (error) {
    console.error('Forgot Password Error:', error);
    throw new Error('Could not send password reset email.');
  }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };