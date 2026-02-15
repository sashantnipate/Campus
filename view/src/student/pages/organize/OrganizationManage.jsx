import * as React from 'react';
import { useOutletContext } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';

export default function OrganizationManage() {
  const { orgData } = useOutletContext(); // Get real data from Layout

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Overview</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 3, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'primary.light', color: 'primary.main' }}><GroupsRoundedIcon /></Box>
            <Box>
              <Typography variant="h4" fontWeight={700}>{orgData?.members || 1}</Typography>
              <Typography variant="body2" color="text.secondary">Total Members</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 3, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'success.light', color: 'success.main' }}><EventAvailableRoundedIcon /></Box>
            <Box>
              <Typography variant="h4" fontWeight={700}>{orgData?.events || 0}</Typography>
              <Typography variant="body2" color="text.secondary">Events Created</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}