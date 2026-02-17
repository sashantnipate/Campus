import Alert from '@mui/material/Alert';
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse'; 
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import ForgotPassword from './ForgotPassword';
import { GoogleIcon, FacebookIcon, SitemarkIcon } from './CustomIcons';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EventIcon from '@mui/icons-material/Event'; // For Organizer
import PersonIcon from '@mui/icons-material/Person'; // For User
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { googleLoginApi, loginStudent } from '../services/authService';
import {getAuth, GoogleAuthProvider, signInWithPopup} from "firebase/auth";
import {app} from '../../firebase';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

export default function SignInCard() {
  const navigate = useNavigate();
  const [alertConfig, setAlertConfig] = React.useState({ show: false, message: '', severity: 'info' });
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [role, setRole] = React.useState('user');

  const showAlert = (message, severity = 'error') => {
    setAlertConfig({ show: true, message, severity });
    if (severity !== 'success') { 
        setTimeout(() => setAlertConfig(prev => ({ ...prev, show: false })), 5000);
    }
  };

  
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateInputs()) return;

    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');

    try {
      const response = await loginStudent({ email, password });
      

      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("role", response.user?.role || "student"); 

        showAlert("Login Successful! Redirecting...", "success");

        setTimeout(() => {
          navigate('/student');        
        }, 800);
      }else {
         throw new Error("No token received");
      }

    } catch (error) {
      console.error("Login Error:", error);
      const msg = error.response?.data?.message || "Login failed. Check your credentials.";
      showAlert(msg, "error");
    }
  };

  const auth = getAuth();

  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const resultsFromGoogle = await signInWithPopup(auth, provider);
      
      const userData = {
        name: resultsFromGoogle.user.displayName,
        email: resultsFromGoogle.user.email,
        profileImage: resultsFromGoogle.user.photoURL,
      };

      const response = await googleLoginApi(userData);

      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("role", response.user?.role || "student");

        showAlert("Google Login Successful!", "success");
        
        setTimeout(() => {
          navigate('/student');
        }, 1000);
      }
    } catch (error) {
      console.error("Google Auth Error:", error);
      showAlert(error.response?.data?.message || "Google Sign-In failed", "error");
    }
  };

  const validateInputs = () => {
    const email = document.getElementById('email');
    const password = document.getElementById('password');

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

    return isValid;
  };

  return (
    <Card variant="outlined">
      {/* <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
        <SitemarkIcon />
      </Box> */}
      <Typography
        component="h1"
        variant="h4"
        sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
      >
        Sign in
      </Typography>
      <Collapse in={alertConfig.show}>
        <Alert 
            
            key={alertConfig.severity} 
            severity={alertConfig.severity} 
            variant="filled" 
            onClose={() => setAlertConfig(p => ({...p, show: false}))}
            sx = {{
                mb: 2,
                backgroundColor: 
                    alertConfig.severity === 'success' ? '#38cb82' : 
                    alertConfig.severity === 'error' ? '#FF7F7F' :   
                    alertConfig.severity === 'warning' ? '#ed6c02' : 
                    '#0288d1',                                      
                color: 'black', 
                '& .MuiAlert-icon': {
                    color: 'black', // Force icon to be white
                },
                }}
        >
            {alertConfig.message}
        </Alert>
        </Collapse>

      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        noValidate 
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <FormControl>
          <FormLabel htmlFor="email">Email</FormLabel>
          <TextField
            error={emailError}
            helperText={emailErrorMessage}
            id="email"
            type="email"
            name="email"
            placeholder="your@email.com"
            autoComplete="email"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color={emailError ? 'error' : 'primary'}
          />
        </FormControl>
        <FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Link
              component="button"
              type="button"
              onClick={handleClickOpen}
              variant="body2"
              sx={{ alignSelf: 'baseline' }}
            >
              Forgot your password?
            </Link>
          </Box>
          <TextField
            error={passwordError}
            helperText={passwordErrorMessage}
            name="password"
            placeholder="••••••"
            type="password"
            id="password"
            autoComplete="current-password"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color={passwordError ? 'error' : 'primary'}
          />
        </FormControl>
        <FormControlLabel
          control={<Checkbox value="remember" color="primary" />}
          label="Remember me"
        />
        <ForgotPassword open={open} handleClose={handleClose} />
        <Button type="submit" fullWidth variant="contained" >
          Sign in
        </Button>
        </Box>
        <Typography sx={{ textAlign: 'center' }}>
          Don&apos;t have an account?{' '}
          <span>
            <Link
              component={RouterLink}
              to = '/signup'
              variant="body2"
              sx={{ alignSelf: 'center' }}
            >
              Sign up
            </Link>
          </span>
        </Typography>
      
      <Divider>or</Divider>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleGoogleClick}
          startIcon={<GoogleIcon />}
        >
          Sign in with Google
        </Button>
      </Box>
    </Card>
  );
}
