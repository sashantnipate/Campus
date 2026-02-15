import * as React from 'react';
import Grid from '@mui/material/Grid'; // Assuming MUI v6 based on your 'size' usage, otherwise use standard Grid
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Copyright from '../internals/components/Copyright';
import CustomizedTreeView from './CustomizedTreeView';
import CustomizedDataGrid from './CustomizedDataGrid';
import StatCard from './StatCard';

// Updated data to match your Admin Prototype!
const data = [
  {
    title: 'Total Events',
    value: '3',
    interval: 'Currently active',
    trend: 'up',
    data: [1, 1, 2, 2, 3, 3, 3],
  },
  {
    title: 'Active Organizers',
    value: '3',
    interval: 'Managing teams',
    trend: 'neutral',
    data: [2, 2, 3, 3, 3, 3, 3],
  },
  {
    title: 'Pending Approvals',
    value: '1',
    interval: 'Needs action',
    trend: 'down', // Red/Warning color often indicates action needed
    data: [5, 4, 3, 2, 1, 1, 1],
  },
  {
    title: 'Registrations',
    value: '345',
    interval: 'Across all events',
    trend: 'up',
    data: [50, 100, 150, 200, 250, 300, 345],
  },
];

export default function MainGrid() {
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      
      {/* Top Cards Section */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Dashboard Overview
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {data.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Analytics Charts - Hidden for now to match prototype 
      <Grid container spacing={2} columns={12} sx={{ mb: 2 }}>
         <Grid size={{ xs: 12, sm: 6, lg: 3 }}><HighlightedCard /></Grid>
         <Grid size={{ xs: 12, md: 6 }}><SessionsChart /></Grid>
         <Grid size={{ xs: 12, md: 6 }}><PageViewsBarChart /></Grid>
      </Grid>
      */}

      {/* Bottom Data Grid Section */}
      <Typography component="h2" variant="h6" sx={{ mb: 2, mt: 4 }}>
        Recent Events
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 12 }}>
          {/* We will update this CustomizedDataGrid later to fetch from your database */}
          <CustomizedDataGrid />
        </Grid>
      </Grid>
      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}