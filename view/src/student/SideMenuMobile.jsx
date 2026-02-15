import * as React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import StudentMenuContent from './components/layout/StudentMenuContent';

function SideMenuMobile({ open, toggleDrawer, activeTab, setActiveTab }) {
  const user = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || { name: 'Student', email: '' };
    } catch (e) {
      return { name: 'Student', email: '' };
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
          width: '70dvw',
          maxWidth: '280px',
        },
      }}
    >
      <Stack sx={{ height: '100%' }}>
        <Stack direction="row" sx={{ p: 2, gap: 1, alignItems: 'center' }}>
          <Avatar
            alt={user.name}
            src={user.profileImage || ''}
            sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'S'}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
             <Typography variant="subtitle1" fontWeight={600} noWrap>
                {user.name}
             </Typography>
             <Typography variant="body2" color="text.secondary" noWrap>
                {user.email}
             </Typography>
          </Box>
        </Stack>
        
        <Divider />

        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {/* CRITICAL FIX: Pass activeTab and setActiveTab to the content list */}
          <StudentMenuContent 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            mobileOpen={open}
            setMobileOpen={toggleDrawer} 
          />
        </Box>
      </Stack>
    </Drawer>
  );
}

SideMenuMobile.propTypes = {
  open: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  activeTab: PropTypes.string,
  setActiveTab: PropTypes.func,
};

export default SideMenuMobile;