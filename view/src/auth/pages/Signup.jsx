import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import AppTheme from '../../theme/shared-theme/AppTheme';
import ColorModeSelect from '../../theme/shared-theme/ColorModeSelect.jsx';
import { GoogleIcon, FacebookIcon } from '../components/CustomIcons';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { sendOtp, verifyOtp, registerStudent } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
// Import CircularProgress for the loader
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import logoo from '../../assets/logoo.png'

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '600px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function SignUp(props) {
  const navigate = useNavigate();
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  
  const [otpSent, setOtpSent] = React.useState(false);
  const [otp, setOtp] = React.useState('');
  const [isEmailVerified, setIsEmailVerified] = React.useState(false);

  // Separate loading states for better UX
  const [sendingOtpLoading, setSendingOtpLoading] = React.useState(false);
  const [verifyingOtpLoading, setVerifyingOtpLoading] = React.useState(false);
  const [registerLoading, setRegisterLoading] = React.useState(false);
  
  const [alertConfig, setAlertConfig] = React.useState({ show: false, message: '', severity: 'info' });

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setAlertConfig({ ...alertConfig, show: false });
  };

  const showNotify = (message, severity = 'error') => {
    setAlertConfig({ show: true, message, severity });
  };

  const validateInputs = () => {
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const name = document.getElementById('name');

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (!name.value || name.value.length < 1) {
      setNameError(true);
      setNameErrorMessage('Name is required.');
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }

    return isValid;
  };

  const handleSendOtp = async () => {
    const emailInput = document.getElementById('email');
    const emailValue = emailInput ? emailInput.value : '';

    if (!emailValue || !/\S+@\S+\.\S+/.test(emailValue)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      return;
    }
    try {
      setSendingOtpLoading(true);
      const response = await sendOtp(emailValue);
      showNotify(response.data.message, "info");
      setOtpSent(true);
    } catch (error) {
      showNotify(error.response?.data?.message || 'Failed to send OTP', "error");
    } finally {
      setSendingOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const emailValue = document.getElementById('email').value;
    try {
      setVerifyingOtpLoading(true);
      const response = await verifyOtp(emailValue, otp);
      showNotify(response.data.message, "success");
      setIsEmailVerified(true);
      setOtpSent(false); // Optionally hide OTP field after success
    } catch (error) {
      showNotify(error.response?.data?.message || 'Invalid OTP', "error");
    } finally {
      setVerifyingOtpLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateInputs()) return;
    
    if (!isEmailVerified) {
        showNotify("Please verify your email address first.", "warning");
        return;
    }

    const formElement = event.currentTarget.closest('form');
    const data = new FormData(formElement);

    const studentData = {
      name: data.get('name').trim(),
      email: data.get('email').trim(),
      password: data.get('password'),
      studentProfile: {
        rollNumber: data.get('rollNumber').trim(),
        department: data.get('department').trim(),
        yearOfStudy: data.get('yearOfStudy').trim(),
        course: "B.Tech"
      }
    };

    try {
      setRegisterLoading(true);
      const response = await registerStudent(studentData);
      showNotify("Registration Successful! Redirecting to login...", "success");
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      showNotify(error.response?.data?.message || 'Registration failed', "error");
    } finally {
      setRegisterLoading(false);
    }
  };

  return (

    <AppTheme {...props}>
      <Snackbar
        open={alertConfig.show}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={alertConfig.severity}
          variant="filled"
          sx={{
            mb: 2,
            backgroundColor:
              alertConfig.severity === 'success' ? '#02e215' :
                alertConfig.severity === 'error' ? '#ffa38ae4' :
                  alertConfig.severity === 'warning' ? '#e16602' :
                    '#0288d1',
            color: 'black',
            '& .MuiAlert-icon': {
              color: 'black',
            },
          }}
        >
          {alertConfig.message}
        </Alert>
      </Snackbar>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', width: '100%' }}
          >
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 0}}>
      <img
        src={logoo}
        alt="EventFlow Logo"
        style={{
          height: '130px',     // Adjusted for better sidebar proportions  
          width: '80px',      
          objectFit: 'cover', 
          objectPosition: 'center', 
          display: 'block',
          borderRadius: '8px' 
        }}
      />
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          fontSize: '1.3rem',
          color: '#1b129cff',
          whiteSpace: 'nowrap',
        }}
      >
        Event Flow
      </Typography>
    </Box>
          </Stack>

          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign up
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column' }}
          >
            <Grid container spacing={2}>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <FormLabel htmlFor="name">Full name</FormLabel>
                  <TextField
                    autoComplete="name"
                    name="name"
                    required
                    fullWidth
                    id="name"
                    placeholder="Jon Snow"
                    error={nameError}
                    helperText={nameErrorMessage}
                    color={nameError ? 'error' : 'primary'}
                    sx={{
                      '& .MuiInputBase-input': {
                        paddingRight: '55px',
                      }
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <FormLabel htmlFor="rollNumber">Roll Number</FormLabel>
                  <TextField
                    fullWidth
                    name="rollNumber"
                    id="rollNumber"
                    placeholder="CS101"
                    sx={{
                      '& .MuiInputBase-input': {
                        paddingRight: '55px',
                      }
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <FormLabel htmlFor="department">Department</FormLabel>
                  <TextField
                    fullWidth
                    name="department"
                    id="department"
                    placeholder="Computer Science"
                    sx={{
                      '& .MuiInputBase-input': {
                        paddingRight: '55px',
                      }
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <FormLabel htmlFor="yearOfStudy">Year of Study</FormLabel>
                  <TextField
                    fullWidth
                    name="yearOfStudy"
                    id="yearOfStudy"
                    placeholder="2"
                    sx={{
                      '& .MuiInputBase-input': {
                        paddingRight: '55px',
                      }
                    }}
                  />
                </FormControl>
              </Grid>
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <FormLabel htmlFor="email">Email</FormLabel>
                <TextField
                  required
                  fullWidth
                  id="email"
                  placeholder="your@email.com"
                  name="email"
                  autoComplete="email"
                  variant="outlined"
                  error={emailError}
                  helperText={emailErrorMessage}
                  color={emailError ? 'error' : 'primary'}
                  disabled={isEmailVerified} // Lock email after verification
                  sx={{
                    '& .MuiInputBase-input': {
                      paddingTop: '10px',
                      paddingBottom: '5px'
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="contained"
                          size="small"
                          disableElevation
                          disabled={isEmailVerified || sendingOtpLoading}
                          onClick={handleSendOtp}
                          sx={{ 
                            borderRadius: '8px', 
                            textTransform: 'none', 
                            fontWeight: 600,
                            // Light green when loading or verified
                            backgroundColor: (sendingOtpLoading || isEmailVerified) ? '#90ee90' : 'primary.main',
                            color: (sendingOtpLoading || isEmailVerified) ? '#000' : 'white',
                            '&:hover': {
                                backgroundColor: (sendingOtpLoading || isEmailVerified) ? '#90ee90' : 'primary.dark',
                            }
                          }}
                        >
                          {sendingOtpLoading ? (
                            <CircularProgress size={20} sx={{ color: 'black' }} />
                          ) : isEmailVerified ? (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <CheckCircleOutlineIcon fontSize="small" />
                                <span>Verified</span>
                            </Stack>
                          ) : (
                            "Verify"
                          )}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
            </Grid>

            {/* Only show OTP field if sent and NOT yet verified */}
            {otpSent && !isEmailVerified && (
              <Grid item xs={12} sx={{ mt: 2 }}>
                <FormControl fullWidth>
                  <FormLabel htmlFor="otp">Enter OTP</FormLabel>
                  <TextField
                    fullWidth
                    id="otp"
                    name='otp'
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            variant="contained"
                            size="small"
                            disableElevation
                            disabled={verifyingOtpLoading}
                            onClick={handleVerifyOtp}
                            sx={{ 
                              borderRadius: '8px', 
                              textTransform: 'none', 
                              fontWeight: 600,
                              // Light green when loading
                              backgroundColor: verifyingOtpLoading ? '#90ee90' : 'primary.main',
                              color: verifyingOtpLoading ? '#000' : 'white',
                              '&:hover': {
                                  backgroundColor: verifyingOtpLoading ? '#90ee90' : 'primary.dark',
                              }
                            }}
                          >
                            {verifyingOtpLoading ? (
                                <CircularProgress size={20} sx={{ color: 'black' }} />
                            ) : (
                                "Verify Email"
                            )}
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <FormLabel htmlFor="password">Password</FormLabel>
                <TextField
                  required
                  fullWidth
                  name="password"
                  placeholder="••••••"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  variant="outlined"
                  error={passwordError}
                  helperText={passwordErrorMessage}
                  color={passwordError ? 'error' : 'primary'}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sx={{ mt: 1 }}>
              <FormControlLabel
                control={<Checkbox value="allowExtraEmails" color="primary" />}
                label="I want to receive updates via email."
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={registerLoading}
              >
                 {registerLoading ? <CircularProgress size={24} color="inherit" /> : "Sign up"}
              </Button>
            </Grid>
          </Box>
          
            <Typography sx={{ textAlign: 'center' }}>
              Already have an account?{' '}
              <Link
                component={RouterLink}
                to='/login'
                variant="body2"
                sx={{ alignSelf: 'center' }}
              >
                Sign in
              </Link>
            </Typography>
          
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}