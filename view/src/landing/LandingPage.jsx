// view/src/landing/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Stack, 
  Grid, 
  Card, 
  CardContent 
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      
      {/* 1. NAVBAR */}
      <Box sx={{ py: 2, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Event Flow
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={() => navigate('/login')}>
            Admin Login
          </Button>
          <Button variant="contained" onClick={() => navigate('/login')}>
            Student Sign In
          </Button>
        </Stack>
      </Box>

      {/* 2. HERO SECTION */}
      <Container maxWidth="lg" sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h2" fontWeight="800" gutterBottom>
          Manage Campus Events <br />
          <Box component="span" sx={{ color: 'primary.main' }}>Like a Pro</Box>
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: '700px', mx: 'auto' }}>
          The ultimate platform for students and faculty to organize, participate, 
          and track events. Get digital certificates, real-time updates, and more.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="contained" size="large" onClick={() => navigate('/signup')} sx={{ px: 4, py: 1.5, borderRadius: 2 }}>
            Get Started
          </Button>
          <Button variant="outlined" size="large" onClick={() => navigate('/login')} sx={{ px: 4, py: 1.5, borderRadius: 2 }}>
            I have an account
          </Button>
        </Stack>
      </Container>

      {/* 3. FEATURES SECTION */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <FeatureCard 
            icon={<EventAvailableIcon fontSize="large" color="primary" />}
            title="Easy Registration"
            desc="One-click registration for hackathons, workshops, and seminars."
          />
          <FeatureCard 
            icon={<GroupsIcon fontSize="large" color="primary" />}
            title="Team Management"
            desc="Create teams, manage members, and track participation progress."
          />
          <FeatureCard 
            icon={<EmojiEventsIcon fontSize="large" color="primary" />}
            title="Digital Certificates"
            desc="Receive automated, verifiable certificates directly to your profile."
          />
        </Grid>
      </Container>
    </Box>
  );
}

// Helper Component for Feature Cards
function FeatureCard({ icon, title, desc }) {
  return (
    <Grid item xs={12} md={4}>
      <Card sx={{ height: '100%', borderRadius: 4, textAlign: 'center', p: 2 }} elevation={2}>
        <CardContent>
          <Box sx={{ mb: 2 }}>{icon}</Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>{title}</Typography>
          <Typography variant="body2" color="text.secondary">{desc}</Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}