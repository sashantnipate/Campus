import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';

// Icons
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'; // Import Logout Icon

const mainListItems = [
  { text: 'Dashboard', icon: <HomeRoundedIcon />, path: '/admin/home', key: 'home' },
  { text: 'Calendar', icon: <CalendarMonthRoundedIcon />, path: '/admin/calendar', key: 'calendar' },
  { text: 'Students Data', icon: <PeopleRoundedIcon />, path: '/admin/data', key: 'data' },
  { text: 'My Profile', icon: <AssignmentIndRoundedIcon />, path: '/admin/profile', key: 'profile' },
];

const secondaryListItems = [

  { text: 'Logout', icon: <LogoutRoundedIcon />, path: '#', key: 'logout' }, 
];

export default function MenuContent({ activeTab }) {
  const navigate = useNavigate();

  const handleNavigation = (path, key) => {
    // Check if the clicked item is Logout
    if (key === 'logout') {
        // 1. Clear Session
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        // 2. Redirect to Login
        window.location.href = '#/login';
    } else {
        // Normal Navigation
        navigate(path);
    }
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={activeTab === item.key}
              onClick={() => handleNavigation(item.path, item.key)}
              sx={{borderRadius: 1}}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={activeTab === item.key}
              onClick={() => handleNavigation(item.path, item.key)}
              sx={{
                borderRadius: 1,
                // Optional: Make logout red to distinguish it
                color: item.key === 'logout' ? 'error.main' : 'inherit', 
                '& .MuiListItemIcon-root': {
                    color: item.key === 'logout' ? 'error.main' : 'inherit'
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}