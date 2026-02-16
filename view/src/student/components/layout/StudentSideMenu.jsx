import * as React from 'react';
import { styled } from '@mui/material/styles';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import StudentMenuContent from './StudentMenuContent'; 
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

export default function StudentSideMenu({ activeTab, setActiveTab }) {
  // Get user info safely
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Student', email: '' };

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {/* <Box sx={{ 
          width: 32, height: 32, borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
        }}>
          <EventAvailableRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box> */}
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
          Event Flow
        </Typography>
      </Box>
      
      <Divider />

      <Box sx={{ overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <StudentMenuContent activeTab={activeTab} setActiveTab={setActiveTab} />
      </Box>

      <Divider />

      <Stack direction="row" sx={{ p: 2, gap: 1, alignItems: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
        <Avatar alt={user.name} sx={{ width: 36, height: 36, bgcolor: 'primary.light' }}>
          {user.name ? user.name.charAt(0) : 'S'}
        </Avatar>
        <Box sx={{ mr: 'auto', overflow: 'hidden' }}>
          <Typography variant="body2" fontWeight={600} noWrap>{user.name}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>{user.email}</Typography>
        </Box>
      </Stack>
    </Drawer>
  );
}