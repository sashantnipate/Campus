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

// ... (imports remain the same)

function ForgotPassword({ open, handleClose }) {
  const [step, setStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState('');

  const [email, setEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');

  // Clear all states on close/open
  const resetForm = () => {
    setStep(0);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setError('');
    setSuccessMsg('');
  };

  React.useEffect(() => {
    if (open) resetForm();
  }, [open]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg(''); // Clear previous success messages
    try {
      await sendForgotPasswordOtp(email);
      setSuccessMsg('OTP sent to your email.');
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg(''); 
    try {
      await verifyForgetPasswordOtp(email, otp);
      setSuccessMsg('OTP Verified! Please enter new password.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // NOTE: Ensure your backend doesn't need the OTP here too!
      await resetPassword(email, newPassword); 
      setSuccessMsg('Password reset successfully!');
      setTimeout(() => {
        handleClose();
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
      
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        <DialogContentText>
          {step === 0 && "Enter your account's email address."}
          {step === 1 && `Enter the 6-digit OTP sent to ${email}.`}
          {step === 2 && "Create a new strong password."}
        </DialogContentText>

        {/* Error Alert */}
        {error && (
        <Alert 
          severity="error" 
           sx={{ 
            mb: 2, 
            backgroundColor: '#FF7F7F', // Custom red
            color: 'black',
            '& .MuiAlert-icon': { color: 'black' } 
      }}
   >
      {error}
  </Alert>
)}

{/* Success Alert */}
{successMsg && (
  <Alert 
    severity="success" 
    sx={{ 
      mb: 2, 
      backgroundColor: '#38cb82', // Custom green
      color: 'black',
      '& .MuiAlert-icon': { color: 'black' } 
    }}
  >
    {successMsg}
  </Alert>
)}

        {step === 0 && (
          <OutlinedInput
            key="email-input"
            autoFocus
            required
            type="email"
            fullWidth
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        )}

        {step === 1 && (
          <OutlinedInput
            key="otp-input"
            autoFocus
            required
            fullWidth
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputProps={{ maxLength: 6 }}
          />
        )}

        {step === 2 && (
          <OutlinedInput
            key="pw-input"
            autoFocus
            required
            type="password"
            fullWidth
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" type="submit" disabled={loading}>
          {loading ? <CircularProgress size={24} sx={{
            color:'white',
          }} /> : 
           step === 0 ? 'Send OTP' : step === 1 ? 'Verify OTP' : 'Reset Password'}
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