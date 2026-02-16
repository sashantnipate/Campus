import * as React from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuContent from './MenuContent';

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

export default function SideMenu({ activeTab }) {
  // 1. Get User Data
  const user = JSON.parse(localStorage.getItem('user')) || {
    name: 'Admin User',
    email: 'admin@campus.edu',
    profileImage: ''
  };

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
      {/* HEADER */}
      <Box
        sx={{
          display: 'flex',
          mt: 'calc(var(--template-frame-height, 0px) + 4px)',
          p: 2,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
         <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main', letterSpacing: 1 }}>
            Event Flow
        </Typography>
      </Box>
      <Divider />

      {/* MAIN MENU LINKS */}
      <Box
        sx={{
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <MenuContent activeTab={activeTab} />
      </Box>

      {/* FOOTER: USER PROFILE ONLY */}
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Avatar
          sizes="small"
          alt={user.name}
          src={user.profileImage || "/static/images/avatar/7.jpg"}
          sx={{ width: 36, height: 36 }}
        />
        <Box sx={{ mr: 'auto', overflow: 'hidden' }}>
          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {user.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {user.email}
          </Typography>
        </Box>
      </Stack>
    </Drawer>
  );
}