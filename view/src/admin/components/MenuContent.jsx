import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

const mainListItems = [
  { text: 'Home', icon: <HomeRoundedIcon />, id: 'home' },
  { text: 'Calendar', icon: <CalendarTodayRoundedIcon />, id: 'calendar' },
  { text: 'Event Management', icon: <EventNoteRoundedIcon />, id: 'events' },
  { text: 'Analytics', icon: <AnalyticsRoundedIcon />, id: 'analytics' },
];

const secondaryListItems = [
  { text: 'Profile', icon: <PersonRoundedIcon />, id: 'profile' },
  { text: 'Settings', icon: <SettingsRoundedIcon />, id: 'settings' },
];

export default function MenuContent({ activeTab, setActiveTab }) {
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
            <ListItemButton 
              selected={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
            <ListItemButton 
              selected={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
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