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
import logoo from '../../../assets/logoo.png';

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
      
      {/* <Box sx={{ 
        p: 0,              // Removed padding to eliminate margin space
        display: 'flex', 
        alignItems: 'center',
        overflow: 'hidden' // Ensures no weird scrollbars if the image is large
      }}>
        <Box
          component="img"
          src={logoo}
          alt="EventFlow Logo"
          sx={{
            height: 100,       // Increased height (adjust as needed: 50, 60, or 70)
            width: 'auto',    // Maintains aspect ratio
            objectFit: 'contain',
            display: 'block',
            ml: 1             // Small left margin to keep it from touching the very edge
          }}
          
        />
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', zIndex: 2 }}>
          Event Flow
        </Typography>
      </Box> */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1.5, // Creates consistent space between Logo and Text
        px: 2.5,  // Adds side padding so it's not glued to the edge
        py: 2,    // Adds vertical breathing room
        minHeight: '64px' // Standard toolbar height
      }}>
       <Box sx={{ display: 'flex', alignItems: 'center', }}>
        <img
          src={logoo}
          alt="EventFlow Logo"
          style={{
            height: '130px',     
            width: '60px',       // 1. You MUST set a fixed width to create the "crop box"
            objectFit: 'cover',  // 2. This crops the image to fill the 40x40 box
            objectPosition: 'center', // 3. (Optional) Focuses the crop on the center
            display: 'block',
            borderRadius: '8px'  // (Optional) Rounds the corners of your newly cropped image
          }}
        />

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1.5rem',
            color: '#1b129cff',
            whiteSpace: 'nowrap',
          }}
        >
          Event Flow
        </Typography>
      </Box>
        {/* <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700, 
            fontSize: '1.1rem', 
            color: 'text.primary',
            whiteSpace: 'nowrap' // Prevents text from breaking into two lines
          }}
        >
          Event Flow
        </Typography> */}
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