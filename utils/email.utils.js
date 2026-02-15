const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

const sendVerificationEmail = async (userEmail, otp) => {
  try {
    const mailOptions = {
      from: `"University Tech Portal" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Verify your Email - OTP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Verification</h2>
          <p>You are receiving this email because you requested to sign up.</p>
          <p>Your 6-digit OTP is: <strong><span style="font-size: 24px;">${otp}</span></strong></p>
          <p>This OTP is valid for 15 minutes.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw new Error('Could not send verification email.');
  }
};
 
const sendPasswordResetEmail = async (userEmail, otp) => {
  try {
    const mailOptions = {
      from: `"Event Flow" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Event Flow - Password Reset OTP",
      html: `
        <div style="background-color:#f4f6f8; padding:40px 0; font-family:Arial, sans-serif;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:30px; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            
            <h2 style="color:#1e293b; text-align:center; margin-bottom:10px;">
             Password Reset Request
            </h2>
            
            <p style="color:#475569; font-size:14px; text-align:center; margin-bottom:30px;">
              We received a request to reset your password for <strong>Event Flow</strong>.
            </p>

            <div style="text-align:center; margin:30px 0;">
              <span style="
                display:inline-block;
                background:#2563eb;
                color:#ffffff;
                font-size:28px;
                font-weight:bold;
                letter-spacing:4px;
                padding:15px 30px;
                border-radius:8px;">
                ${otp}
              </span>
            </div>

            <p style="color:#64748b; font-size:14px; text-align:center;">
              This OTP is valid for <strong>15 minutes</strong>.
            </p>

            <hr style="margin:30px 0; border:none; border-top:1px solid #e2e8f0;" />

            <p style="color:#94a3b8; font-size:12px; text-align:center;">
              If you did not request a password reset, please ignore this email.
              <br/>
              © ${new Date().getFullYear()} Event Flow. All rights reserved.
            </p>

          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent: %s", info.messageId);
    return true;

  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Could not send password reset email.");
  }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };

