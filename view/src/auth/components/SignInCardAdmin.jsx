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
import { loginStudent } from '../services/authService';
import { loginAdmin } from '../services/authService';
import CircularProgress from '@mui/material/CircularProgress';

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

export default function SignInCardAdmin() {
  const navigate = useNavigate();
  const [alertConfig, setAlertConfig] = React.useState({ show: false, message: '', severity: 'info' });
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [role, setRole] = React.useState('user');
  const [loading, setLoading] = React.useState(false); 

  const showAlert = (message, severity = 'error') => {
    setAlertConfig({ show: true, message, severity });
    if (severity !== 'success') { 
        setTimeout(() => setAlertConfig(prev => ({ ...prev, show: false })), 5000);
    }
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
      const response = await loginAdmin({ email, password });
      

      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("role", response.user?.role || "admin"); 

        showAlert("Login Successful! Redirecting...", "success");

        setTimeout(() => {
          navigate('/admin');        
        }, 1000);
      }else {
         throw new Error("No token received");
      }

    } catch (error) {
      console.error("Login Error:", error);
      const msg = error.response?.data?.message || "Login failed. Check your credentials.";
      showAlert(msg, "error");
    } finally {
      setLoading(false); 
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <AdminPanelSettingsIcon color="primary" />
        <Typography variant="h5" component="h1" sx={{}}>
            Staff & Administrator Access
        </Typography>
      </Box>
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
                    alertConfig.severity === 'success' ? '#02e215' : 
                    alertConfig.severity === 'error' ? '#ffa38ae4' :   
                    alertConfig.severity === 'warning' ? '#e16602' : 
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
        
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      </Box>
    </Card>
  );
}
