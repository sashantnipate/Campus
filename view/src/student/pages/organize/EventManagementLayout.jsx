import * as React from 'react';
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

// Icons
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

export default function EventManagementLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventId } = useParams();

  // 1. Determine Tab Index from URL
  const currentPath = location.pathname.split('/').pop();
  const getTabIndex = () => {
    if (currentPath === 'participants') return 1;
    if (currentPath === 'certificates') return 2;
    if (currentPath === 'settings') return 3;
    return 0; // Default: Overview
  };

  const handleTabChange = (e, val) => {
    // Construct base path (e.g. /student/organize/event/123)
    // We need to be careful not to include the org part if it's a solo event, 
    // but usually this route is generic: /student/organize/event/:id
    const basePath = `/student/organize/event/${eventId}`; 
    
    switch (val) {
      case 0: navigate(basePath); break;
      case 1: navigate(`${basePath}/participants`); break;
      case 2: navigate(`${basePath}/certificates`); break;
      case 3: navigate(`${basePath}/settings`); break;
      default: break;
    }
  };

  const handleSaveCertificate = async (templateId) => {
    try {
        await API.put(`/events/${eventId}/certificate-config`, { templateId });
        alert("Certificate linked successfully!");
    } catch (err) {
        alert("Error saving configuration");
    }
};

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
      
      {/* --- STICKY HEADER --- */}
      <Box sx={{ 
        position: 'sticky', top: 0, zIndex: 1100, 
        bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider',
        px: { xs: 2, md: 4 }, pt: 2,
        borderRadius: '24px',
        border: '1px solid'
      }}>
        {/* Top Row */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
          <Button 
            startIcon={<ArrowBackRoundedIcon />} 
            onClick={() => navigate(-1)} // Go back to previous page (Org Console or List)
            sx={{ color: 'Black', fontWeight: 500, textTransform: 'none' }}
          >
            Back
          </Button>
          <Divider orientation="vertical" flexItem sx={{ height: 20, alignSelf: 'center' }} />
          <Typography variant="subtitle2" color="Black" fontWeight={500}>
            Event Console
          </Typography>
        </Stack>

        {/* Tabs */}
        <Tabs value={getTabIndex()} onChange={handleTabChange} sx={{ minHeight: 48, bgcolor: 'white' }}>
          <Tab icon={<DashboardRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Overview" sx={{ minHeight: 48, fontWeight: 500, textTransform: 'none', bgcolor: "white" }} />
          <Tab icon={<PeopleAltRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Participants" sx={{ minHeight: 48, fontWeight: 500, textTransform: 'none' }} />
          <Tab icon={<EmojiEventsRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Certificates" />
        </Tabs>
      </Box>

      {/* --- CONTENT AREA --- */}
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1600px', margin: '0 auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
}