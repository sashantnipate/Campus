import * as React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom'; // Import Router hooks
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from './components/layout/StudentAppNavbar';
import Header from '../admin/components/Header';
import StudentSideMenu from './components/layout/StudentSideMenu';
import AppTheme from '../theme/shared-theme/AppTheme';

export default function StudentDashboard(props) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname.split('/').pop(); 
  const [activeTab, setActiveTab] = React.useState(currentPath || 'discover');

  React.useEffect(() => {
    setActiveTab(currentPath);
  }, [currentPath]);

  const handleNavigation = (path) => {
    setActiveTab(path);
    navigate(`/student/${path}`); 
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        
        <StudentSideMenu activeTab={activeTab} setActiveTab={handleNavigation} />
        
        <AppNavbar />
        
        <Box component="main" sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: alpha(theme.palette.background.default, 1),
            overflow: 'auto',
            height: '100vh', 
          })}
        >
          <Stack spacing={2} sx={{ alignItems: 'center', mx: 3, pb: 5, mt: { xs: 8, md: 0 } }}>
            <Header />
            
            <Box sx={{ width: '100%', mt: 2 }}>
                <Outlet /> 
            </Box>

          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}