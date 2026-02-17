import * as React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuContent from './MenuContent';
import logoo from '../../assets/logoo.png'; // Ensure path matches your project structure

function SideMenuMobile({ open, toggleDrawer, activeTab }) {
  // 1. User State Logic (Matching SideMenu.jsx)
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
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: '70dvw',
          height: '100%',
        }}
      >
        {/* HEADER: LOGO & BRANDING (Matching SideMenu.jsx) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            gap: 1
          }}
        >
          <img
            src={logoo}
            alt="EventFlow Logo"
            style={{
              height: '40px', // Slightly smaller for mobile header balance
              width: 'auto',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.2rem',
              color: '#1b129cff',
              whiteSpace: 'nowrap',
            }}
          >
            Event Flow
          </Typography>
        </Box>
        
        <Divider />

        {/* BODY: MENU CONTENT */}
        <Stack sx={{ flexGrow: 1, overflowY: 'auto' }}>
          <MenuContent activeTab={activeTab} />
        </Stack>

        <Divider />

        {/* FOOTER: USER PROFILE & LOGOUT */}
        <Stack sx={{ p: 2, gap: 2 }}>
          {/* User Details */}
          <Stack direction="row" gap={1} alignItems="center">
            <Avatar
              sizes="small"
              alt={user.name}
              src={user.profileImage || "/static/images/avatar/7.jpg"}
              sx={{ width: 36, height: 36 }}
            >
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

          {/* Mobile Specific Logout Button */}
          <Button 
            variant="outlined" 
            fullWidth 
            startIcon={<LogoutRoundedIcon />}
            onClick={() => {
                // Add your logout logic here if needed
                toggleDrawer(false)();
            }}
          >
            Logout
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

SideMenuMobile.propTypes = {
  open: PropTypes.bool,
  toggleDrawer: PropTypes.func.isRequired,
  activeTab: PropTypes.string, // Added prop validation
};

export default SideMenuMobile;