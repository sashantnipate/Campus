import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

// Icons
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded'; 
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'; 
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded'; 
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'; 
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';


const studentNavItems = [
  { text: 'Discover', icon: <ExploreRoundedIcon />, id: 'discover' },
  { text: 'Calendar', icon: <CalendarMonthRoundedIcon />, id: 'calendar' },
  { text: 'Organize', icon: <Diversity3RoundedIcon />, id: 'organize' },
  { text: 'My Registrations', icon: <TaskAltRoundedIcon />, id: 'registrations' },
  { text: 'My Achievements', icon: <EmojiEventsRoundedIcon />, id: 'achievements' },
];

const secondaryItems = [
  { text: 'Profile', icon: <AccountCircleRoundedIcon />, id: 'profile' },
];

export default function StudentMenuContent({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user'); 
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleItemClick = (id) => {
    // 1. Update State (Safety Check added)
    if (typeof setActiveTab === 'function') {
        setActiveTab(id);
    }
    
    // 2. Navigate
    navigate(`/student/${id}`); 

    // 3. Close Drawer on Mobile
    if (setMobileOpen && mobileOpen) {
      // Handles the case where toggleDrawer returns a function
      try {
        setMobileOpen(false);
      } catch (e) {
        // Fallback for HOF (Higher Order Function) pattern
        if (typeof setMobileOpen === 'function') setMobileOpen(false)();
      }
    }
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between', height: '100%' }}>
      
      <List dense>
        {studentNavItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
            <ListItemButton 
              selected={activeTab === item.id} 
              onClick={() => handleItemClick(item.id)}
              sx={{ borderRadius: '8px', mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: activeTab === item.id ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ '& .MuiTypography-root': { fontWeight: activeTab === item.id ? 600 : 400 } }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <List dense>
        <Divider sx={{ my: 1 }} />
        
        {secondaryItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
            <ListItemButton 
              selected={activeTab === item.id} 
              onClick={() => handleItemClick(item.id)}
              sx={{ borderRadius: '8px', mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}

        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton 
            onClick={handleLogout}
            sx={{ 
              borderRadius: '8px', 
              color: 'error.main',
              '&:hover': { bgcolor: 'error.lighter' } 
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'error.main' }}>
              <LogoutRoundedIcon />
            </ListItemIcon>
            <ListItemText primary="Log out" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Stack>
  );
}