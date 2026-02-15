const Otp = require('../models/otp.model');   
const User = require('../models/user.model');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email.utils');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {generateToken} = require('../utils/jwt.util');

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered. Please login.' });
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp: generatedOtp });
    await sendVerificationEmail(email, generatedOtp);

    return res.status(200).json({ success: true, message: 'OTP sent successfully.' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered. Please login.' });
    }

    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found' });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (otpRecord.isVerified) {
      return res.status(400).json({ message: 'OTP already verified' });
    }

    otpRecord.isVerified = true;
    await otpRecord.save();

    return res.status(200).json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const registerStudent = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      studentProfile
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Required fields are missing.' });
    }

    const verifiedEmailRecord = await Otp.findOne({ email, isVerified: true });
    if (!verifiedEmailRecord) {
      return res.status(403).json({ 
        message: 'Email not verified. Please complete OTP verification first.' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newStudent = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'Student',
      studentProfile: {
        rollNumber: studentProfile?.rollNumber,
        department: studentProfile?.department,
        course: studentProfile?.course,
        yearOfStudy: studentProfile?.yearOfStudy
      },
      isVerified: true
    });
    

    await Otp.deleteMany({ email });

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully! Please log in.',
      user: {
        id: newStudent._id,
        name: newStudent.name,
        email: newStudent.email
      }
    });

  } catch (error) {
    console.error('Register Student Error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user)
    
    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNumber: user.studentProfile.rollNumber,
        role: user.role
      }
      
    });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
};

const registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Admin already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = await User.create({
            name,
            email,
            password: hashedPassword, 
            role: 'Admin',
            isVerified: true 
        });

        return res.status(201).json({ success: true, message: 'Admin registered successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && user.role === 'Admin') {
            if (!user.isVerified) {
                return res.status(401).json({ success: false, message: 'Admin account not verified.' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const token = generateToken(user);

                return res.status(200).json({
                    success: true,
                    token,
                    user: {
                        id: user._id,
                        name: user.name,
                        role: user.role,
                        email: user.email
                    }
                });
            } else {
                return res.status(401).json({ success: false, message: 'Invalid Admin credentials' });
            }
        } else {
            return res.status(403).json({ success: false, message: 'Access Denied: Not an Admin' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select('-password'); 
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    const { name, position, department } = req.body;
    
    const updateData = {
      name,
      position,   
      department
    };

    if (req.files && req.files.avatar) {
      updateData.avatar = req.files.avatar[0].path; 
    }

    const updatedAdmin = await User.findByIdAndUpdate(
      req.user.id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json(updatedAdmin);
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await Otp.deleteMany({ email });
    
    await Otp.create({ email, otp: generatedOtp });
    await sendPasswordResetEmail(email, generatedOtp);

    return res.status(200).json({ 
      success: true, 
      message: 'OTP sent to your email.' 
    });

  } catch (error) {
    console.error('Forgot Password OTP Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password required' });
    }

    const otpRecord = await Otp.findOne({ email, isVerified: true });
    
    if (!otpRecord) {
      return res.status(403).json({ message: 'Session expired or OTP not verified. Please try again.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await Otp.deleteMany({ email });

    res.status(200).json({ success: true, message: 'Password reset successful!' });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
  const verifyPasswordResetOtp = async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const otpRecord = await Otp.findOne({ email});

      if (!otpRecord) {
        return res.status(400).json({ message: "OTP expired or not found" });
      }

      if (otpRecord.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      if (otpRecord.expiresAt < new Date()) {
        await Otp.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({ message: "OTP has expired" });
      }

      otpRecord.isVerified = true;
      await otpRecord.save();

      return res.status(200).json({
        success: true,
        message: "OTP verified successfully. You can now reset your password.",
      });

    } catch (error) {
      console.error("Verify Password Reset OTP Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  const google = async (req, res) => {
    try {
      const { email, name, profileImage } = req.body;
      let user = await User.findOne({ email });

      if (user) {
        const token = generateToken(user);
        
        const { password, ...rest } = user._doc;

        return res.status(200).json({
          success: true,
          message: 'Login successful via Google!',
          token,
          user: {
            id: rest._id,
            name: rest.name,
            email: rest.email,
            role: rest.role,
          }
        });
      } else {
        const generatedPassword =
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(generatedPassword, salt);

        const newUser = await User.create({
          name: name,
          email: email,
          password: hashedPassword,
          profileImage: profileImage, 
          role: 'Student', 
          isVerified: true 
        });

        const token = generateToken(newUser);

        return res.status(201).json({
          success: true,
          message: 'Student registered and logged in via Google successfully!',
          token,
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
          }
        });
      }
    } catch (error) {
      console.error('Google Auth Error:', error);
    }
  };
module.exports = {
  sendOtp,
  verifyOtp,
  registerStudent,
  loginStudent,
  registerAdmin,
  loginAdmin,
  getAdminProfile,   
  updateAdminProfile,
  sendForgotPasswordOtp,
  resetPassword,
  verifyPasswordResetOtp,
  google
};