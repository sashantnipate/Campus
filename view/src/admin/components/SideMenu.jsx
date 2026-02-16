import * as React from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuContent from './MenuContent';
import logoo from '../../assets/logoo.png';

const drawerWidth = 240;

// FIX 1: Use standard CSS 'marginTop' instead of the 'mt' shorthand
const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  marginTop: '80px', // In MUI, an 'mt: 10' usually translates to 80px (10 * 8px)
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

export default function SideMenu({ activeTab }) {
  
  // FIX 2: Safely parse localStorage to prevent JSON or SSR crashes
  const [user, setUser] = React.useState({
    name: 'Admin User',
    email: 'admin@campus.edu',
    profileImage: ''
  });

  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage:", error);
    }
  }, []);

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
          paddingInline: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >   
        <Box sx={{ display: 'flex', alignItems: 'center', }}>
          <img
            src={logoo}
            alt="EventFlow Logo"
            style={{
              height: '130px',     // Adjusted for better sidebar proportions  
              width: '60px',      
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
        >
            {/* Fallback to initials if image fails to load */}
            {user.name?.charAt(0)}
        </Avatar>
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