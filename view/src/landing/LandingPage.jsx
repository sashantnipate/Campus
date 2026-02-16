import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  AppBar,
  Toolbar,
  useTheme,
  alpha,
  IconButton,
  CssBaseline,
} from '@mui/material';
import {
  CalendarMonth,
  EmojiEvents,
  Groups,
  Timeline,
  CheckCircle,
  TrendingUp,
  ArrowForward,
  PlayCircleOutline,
  LightMode,
  DarkMode,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Theme configuration
const getDesignTokens = (mode) => {
  const brand = {
    50: 'hsl(210, 100%, 95%)',
    100: 'hsl(210, 100%, 92%)',
    200: 'hsl(210, 100%, 80%)',
    300: 'hsl(210, 100%, 65%)',
    400: 'hsl(210, 98%, 48%)',
    500: 'hsl(210, 98%, 42%)',
    600: 'hsl(210, 98%, 55%)',
    700: 'hsl(210, 100%, 35%)',
    800: 'hsl(210, 100%, 16%)',
    900: 'hsl(210, 100%, 21%)',
  };

  const gray = {
    50: 'hsl(220, 35%, 97%)',
    100: 'hsl(220, 30%, 94%)',
    200: 'hsl(220, 20%, 88%)',
    300: 'hsl(220, 20%, 80%)',
    400: 'hsl(220, 20%, 65%)',
    500: 'hsl(220, 20%, 42%)',
    600: 'hsl(220, 20%, 35%)',
    700: 'hsl(220, 20%, 25%)',
    800: 'hsl(220, 30%, 6%)',
    900: 'hsl(220, 35%, 3%)',
  };

  return {
    palette: {
      mode,
      primary: {
        light: brand[200],
        main: brand[400],
        dark: brand[700],
        contrastText: brand[50],
        ...(mode === 'dark' && {
          contrastText: brand[50],
          light: brand[300],
          main: brand[400],
          dark: brand[700],
        }),
      },
      grey: gray,
      divider: mode === 'dark' ? alpha(gray[700], 0.6) : alpha(gray[300], 0.4),
      background: {
        default: mode === 'dark' ? gray[900] : 'hsl(0, 0%, 99%)',
        paper: mode === 'dark' ? 'hsl(220, 30%, 7%)' : 'hsl(220, 35%, 97%)',
      },
      text: {
        primary: mode === 'dark' ? 'hsl(0, 0%, 100%)' : gray[800],
        secondary: mode === 'dark' ? gray[400] : gray[600],
      },
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
    },
  };
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('light');

  const theme = createTheme(getDesignTokens(mode));

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const features = [
    {
      icon: <CalendarMonth sx={{ fontSize: 40 }} />,
      title: 'Event Creation',
      description: 'Create and manage campus events with ease. Set dates, locations, and track registrations in real-time.',
    },
    {
      icon: <Groups sx={{ fontSize: 40 }} />,
      title: 'Team Collaboration',
      description: 'Build your organization team and collaborate on event management with role-based access.',
    },
    {
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      title: 'Attendance Tracking',
      description: 'Mark attendance for multi-round events and track student progress through each stage.',
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 40 }} />,
      title: 'Certificates',
      description: 'Generate beautiful certificates automatically for participants, winners, and organizers.',
    },
    {
      icon: <Timeline sx={{ fontSize: 40 }} />,
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights with charts, graphs, and real-time data about your events.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: 'Student Discovery',
      description: 'Students can discover and register for events across all organizations on campus.',
    },
  ];

  const stats = [
    { number: '500+', label: 'Events Created' },
    { number: '10K+', label: 'Students' },
    { number: '50+', label: 'Organizations' },
    { number: '5K+', label: 'Certificates Issued' },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Navigation */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Container maxWidth="lg">
            <Toolbar sx={{ justifyContent: 'space-between', py: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarMonth sx={{ color: 'primary.main', fontSize: 32 }} />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    letterSpacing: '-0.5px',
                  }}
                >
                  Campus Events
                </Typography>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <IconButton
                  onClick={toggleColorMode}
                  sx={{
                    color: 'text.primary',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  {mode === 'dark' ? <LightMode /> : <DarkMode />}
                </IconButton>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/signin')}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/signup')}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: 2,
                    },
                  }}
                >
                  Get Started
                </Button>
              </Stack>
            </Toolbar>
          </Container>
        </AppBar>

        {/* Hero Section */}
        <Box
          sx={{
            background: mode === 'dark' 
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.dark, 0.2)} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
            pt: { xs: 8, md: 12 },
            pb: { xs: 8, md: 12 },
            textAlign: 'center',
          }}
        >
          <Container maxWidth="md">
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: '-1px',
                mb: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Manage Campus Events with Ease
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, lineHeight: 1.6, fontWeight: 400 }}
            >
              The all-in-one platform for student organizations to create,
              manage, and track events effortlessly. From registration to
              certificates, we've got you covered.
            </Typography>

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2}
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/signup')}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  py: 1.5,
                  px: 4,
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
              >
                Get Started Free
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<PlayCircleOutline />}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  py: 1.5,
                  px: 4,
                }}
              >
                Watch Demo
              </Button>
            </Stack>
          </Container>
        </Box>

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Box sx={{ mb: 8 }}>
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    fontWeight: 700,
                    mb: 3,
                    letterSpacing: '-0.5px',
                  }}
                >
                  Powerful Features
                </Typography>
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  sx={{ 
                    lineHeight: 1.6,
                    mb: 2,
                  }}
                >
                  Everything you need to run successful campus events
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ 
                    lineHeight: 1.8,
                  }}
                >
                  From creating events to managing teams, tracking attendance, and issuing certificates - our comprehensive platform handles it all. Empower your student organization with tools designed specifically for campus event management.
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 4,
                    borderRadius: '24px',
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ 
                      lineHeight: 1.8,
                      mb: 2,
                    }}
                  >
                    <strong>Streamlined workflow:</strong> Manage multi-round events, track participant progress, and collaborate with your team members seamlessly.
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ 
                      lineHeight: 1.8,
                    }}
                  >
                    <strong>Data-driven insights:</strong> Get real-time analytics and comprehensive reports to make informed decisions about your events and improve engagement.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: '24px',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    bgcolor: 'background.paper',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-8px)',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '16px',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.main',
                        mb: 3,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, flexGrow: 1 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Stats Section */}
        <Box
          sx={{
            bgcolor: mode === 'dark' 
              ? alpha(theme.palette.primary.main, 0.08)
              : alpha(theme.palette.primary.main, 0.05),
            py: { xs: 6, md: 8 },
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              {stats.map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: 800,
                        color: 'primary.main',
                        fontSize: { xs: '2.5rem', md: '3.5rem' },
                        mb: 1,
                        lineHeight: 1,
                      }}
                    >
                      {stat.number}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* CTA Section */}
        <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 } }}>
          <Card
            sx={{
              borderRadius: '32px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: 8,
            }}
          >
            <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  letterSpacing: '-0.5px',
                }}
              >
                Ready to Get Started?
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: alpha('#ffffff', 0.9),
                  mb: 4,
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                Join thousands of students and organizations already using Campus Events
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/signup')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    py: 1.5,
                    px: 5,
                    '&:hover': {
                      bgcolor: alpha('#ffffff', 0.9),
                    },
                  }}
                >
                  Sign Up Now
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/signin')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    py: 1.5,
                    px: 5,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: alpha('#ffffff', 0.1),
                    },
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>

        {/* Footer */}
        <Box
          sx={{
            bgcolor: mode === 'dark' ? 'grey.900' : 'grey.900',
            color: 'white',
            py: 6,
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="flex-start">
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <CalendarMonth sx={{ fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={700}>
                    Campus Events
                  </Typography>
                </Stack>
                <Typography variant="body2" color="grey.400" sx={{ lineHeight: 1.7 }}>
                  Empowering campus communities to create memorable events and
                  meaningful experiences.
                </Typography>
              </Grid>

              <Grid item xs={12} md={8}>
                <Grid container spacing={4}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle2" fontWeight={700} mb={2}>
                      Product
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'grey.300' } }}>
                        Features
                      </Typography>
                      <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'grey.300' } }}>
                        Pricing
                      </Typography>
                      <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'grey.300' } }}>
                        FAQ
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle2" fontWeight={700} mb={2}>
                      Company
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'grey.300' } }}>
                        About
                      </Typography>
                      <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'grey.300' } }}>
                        Contact
                      </Typography>
                      <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'grey.300' } }}>
                        Careers
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle2" fontWeight={700} mb={2}>
                      Resources
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'grey.300' } }}>
                        Blog
                      </Typography>
                      <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'grey.300' } }}>
                        Help Center
                      </Typography>
                      <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'grey.300' } }}>
                        Community
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle2" fontWeight={700} mb={2}>
                      Legal
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'grey.300' } }}>
                        Privacy
                      </Typography>
                      <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'grey.300' } }}>
                        Terms
                      </Typography>
                      <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'grey.300' } }}>
                        Security
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Box
              sx={{
                borderTop: '1px solid',
                borderColor: 'grey.800',
                mt: 6,
                pt: 4,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color="grey.500">
                © 2026 Campus Events. All rights reserved.
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default LandingPage;