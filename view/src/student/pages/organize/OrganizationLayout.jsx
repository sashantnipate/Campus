import * as React from 'react';
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert'; // Import Alert for errors

// Icons
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';

import { fetchOrgDetails } from '../../services/studentOrgService';

export default function OrganizationLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orgId } = useParams();

  const [orgData, setOrgData] = React.useState(null);
  const [loading, setLoading] = React.useState(true); // Track loading state
  const [error, setError] = React.useState(null);     // Track errors

  // 1. Fetch Org Details on Mount
  React.useEffect(() => {
    const getDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchOrgDetails(orgId);
        
        if (!data) {
           throw new Error("Organization not found");
        }
        setOrgData(data);
      } catch (err) {
        console.error("Layout Fetch Error:", err);
        setError("Failed to load organization details.");
      } finally {
        setLoading(false); // <--- CRITICAL: Stops the spinner
      }
    };

    if (orgId) {
      getDetails();
    }
  }, [orgId]);

  // 2. Handle Tab Selection
  const currentPath = location.pathname.split('/').pop();
  const tabMap = { events: 1, team: 2 };
  const currentTab = tabMap[currentPath] || 0;

  const handleTabChange = (e, val) => {
    const base = `/student/organize/org/${orgId}`;
    if (val === 0) navigate(base);
    if (val === 1) navigate(`${base}/events`);
    if (val === 2) navigate(`${base}/team`);
  };

  // 3. Loading State (The Spinner)
  if (loading) {
    return (
      <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 4. Error State (Stops infinite spin)
  if (error || !orgData) {
    return (
      <Box sx={{ p: 4 }}>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/student/organize')}>
            Back to List
        </Button>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error || "Organization not found."}
        </Alert>
      </Box>
    );
  }

  // 5. Success State (The Console)
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      
      {/* Header */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1100, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', px: 4, pt: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/student/organize')}>Back</Button>
          <Divider orientation="vertical" flexItem />
          
          <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: 'primary.main' }}>
            {orgData.name ? orgData.name[0] : 'O'}
          </Avatar>
          
          <Typography variant="subtitle1" fontWeight={700}>
            {orgData.name}
          </Typography>
          
          <Chip label={orgData.role || 'Admin'} size="small" variant="outlined" sx={{ borderRadius: '6px', height: 20, fontSize: '0.65rem' }} />
        </Stack>
        
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab icon={<DashboardRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Dashboard" />
          <Tab icon={<EventRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Events" />
          <Tab icon={<PeopleAltRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Team" />
        </Tabs>
      </Box>

      {/* Content Injection */}
      <Box sx={{ p: 4, maxWidth: '1600px', margin: '0 auto' }}>
        <Outlet context={{ orgData }} /> 
      </Box>
    </Box>
  );
}