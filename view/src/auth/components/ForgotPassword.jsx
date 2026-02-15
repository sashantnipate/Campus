import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

// Import services
import { sendForgotPasswordOtp, verifyOtp, resetPassword, verifyForgetPasswordOtp } from '../services/authService';

function ForgotPassword({ open, handleClose }) {
  // State for flow control
  const [step, setStep] = React.useState(0); // 0: Email, 1: OTP, 2: New Password
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState('');

  // Form Data
  const [email, setEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setStep(0);
      setEmail('');
      setOtp('');
      setNewPassword('');
      setError('');
      setSuccessMsg('');
    }
  }, [open]);

  // STEP 1: Handle Email Submission
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await sendForgotPasswordOtp(email);
      setSuccessMsg('OTP sent to your email.');
      setStep(1); // Move to OTP step
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Handle OTP Verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await verifyForgetPasswordOtp(email, otp);
      setSuccessMsg('OTP Verified! Please enter new password.');
      setStep(2); // Move to Password step
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Handle Password Reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await resetPassword(email, newPassword);
      setSuccessMsg('Password reset successfully!');
      setTimeout(() => {
        handleClose(); // Close dialog on success
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: step === 0 ? handleSendOtp : step === 1 ? handleVerifyOtp : handleResetPassword,
          sx: { backgroundImage: 'none', minWidth: '400px' },
        },
      }}
    >
      <DialogTitle>
        {step === 0 ? 'Reset Password' : step === 1 ? 'Verify OTP' : 'Set New Password'}
      </DialogTitle>
      
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
      >
        <DialogContentText>
          {step === 0 && "Enter your account's email address, and we'll send you an OTP."}
          {step === 1 && `Enter the 6-digit OTP sent to ${email}.`}
          {step === 2 && "Create a new strong password for your account."}
        </DialogContentText>

        {/* Show Error or Success Alerts */}
        {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
        {successMsg && <Alert severity="success" sx={{ mb: 1 }}>{successMsg}</Alert>}

        {/* STEP 0: EMAIL INPUT */}
        {step === 0 && (
          <OutlinedInput
            autoFocus
            required
            margin="dense"
            id="email"
            name="email"
            placeholder="Email address"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        )}

        {/* STEP 1: OTP INPUT */}
        {step === 1 && (
          <OutlinedInput
            autoFocus
            required
            margin="dense"
            id="otp"
            name="otp"
            placeholder="Enter 6-digit OTP"
            type="text"
            fullWidth
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputProps={{ maxLength: 6 }}
          />
        )}

        {/* STEP 2: NEW PASSWORD INPUT */}
        {step === 2 && (
          <OutlinedInput
            autoFocus
            required
            margin="dense"
            id="newPassword"
            name="newPassword"
            placeholder="New Password"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          type="submit" 
          disabled={loading}
          // Dynamic text based on step
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 
            step === 0 ? 'Send OTP' : 
            step === 1 ? 'Verify OTP' : 
            'Reset Password'
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ForgotPassword.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default ForgotPassword;