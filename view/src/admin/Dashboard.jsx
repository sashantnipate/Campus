import * as React from 'react'; // Added to use React state
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from './components/AppNavbar';
import Header from './components/Header';
import MainGrid from './components/MainGrid';
import SideMenu from './components/SideMenu';
import AppTheme from '../theme/shared-theme/AppTheme';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from './theme/customizations';
import EventCalendar from './components/EventCalendar';
import AdminProfile from './components/AdminProfile';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props) {
  // 1. Create the state to track which menu item is clicked
  const [activeTab, setActiveTab] = React.useState('home');

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        
        {/* 2. Pass the state down to the SideMenu so it can change the tab */}
        <SideMenu activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <AppNavbar />
        
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
            
            {/* 3. Conditionally render ONLY the active component */}
            {activeTab === 'home' && <MainGrid />}
            {activeTab === 'calendar' && <EventCalendar />}
            {activeTab === 'profile' && <AdminProfile/>}
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}