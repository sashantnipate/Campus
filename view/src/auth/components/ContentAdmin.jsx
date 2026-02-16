import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import Box from '@mui/material/Box';
import logoo from '../../assets/logoo.png'

const items = [
  {
    icon: <SecurityIcon sx={{ color: 'text.secondary' }} />,
    title: 'Secure Access',
    description: 'Multi-factor authentication and encrypted session management for system integrity.',
  },
  {
    icon: <DashboardIcon sx={{ color: 'text.secondary' }} />,
    title: 'Centralized Control',
    description: 'Manage users, events, and system settings from a single unified dashboard.',
  },
  {
    icon: <AssessmentIcon sx={{ color: 'text.secondary' }} />,
    title: 'Real-time Analytics',
    description: 'Monitor registration trends and event performance with live data feeds.',
  },
  {
    icon: <PeopleAltIcon sx={{ color: 'text.secondary' }} />,
    title: 'User Governance',
    description: 'Approve organizers, manage student profiles, and handle disputes efficiently.',
  },
];

export default function ContentAdmin() {
  return (
    <Stack sx={{ flexDirection: 'column', alignSelf: 'center', gap: 4, maxWidth: 450 }}>
      <Box 
  sx={{ 
    display: { xs: 'none', md: 'flex' }, 
    alignItems: 'center', // 1. Centers the image and text vertically
    gap: 3                // 2. Adds breathing room between the image and text
  }}
>
  <img
    src={logoo}
    alt="EventFlow Logo"
    style={{
      height: '130px',      
      width: '80px',      
      objectFit: 'cover', 
      objectPosition: 'center', 
      display: 'block',
      borderRadius: '8px' 
    }}
  />
  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
    Admin Console
  </Typography>
</Box>
      {items.map((item, index) => (
        <Stack key={index} direction="row" sx={{ gap: 2 }}>
          {item.icon}
          <div>
            <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
              {item.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {item.description}
            </Typography>
          </div>
        </Stack>
      ))}
    </Stack>
  );
}