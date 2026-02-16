import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Copyright from '../internals/components/Copyright';
import StatCard from './StatCard';
import EventManagementTable from './EventManagementTable';

// --- CHANGE THIS IMPORT ---
import { fetchDashboardStats } from '../services/dashboardService'; 

export default function MainGrid() {
  const [stats, setStats] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // --- USE THE NEW FUNCTION NAME ---
        const data = await fetchDashboardStats();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>Dashboard Overview</Typography>
      
      <Grid container spacing={2} columns={12} sx={{ mb: 4 }}>
        {stats.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...card} delay={index * 100} />
          </Grid>
        ))}
      </Grid>

      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>Campus Events Control</Typography>
      
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12 }}>
          <EventManagementTable />
        </Grid>
      </Grid>

      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}