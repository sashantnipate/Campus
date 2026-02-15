import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';

// Imports
import { fetchOrgEvents } from '../../services/studentOrgService';
import CreateEventModal from './CreateEventModal'; 

export default function MyEventsList() {
  const { orgId } = useParams();
  const navigate = useNavigate(); // 2. Initialize Navigation Hook
  
  const [events, setEvents] = React.useState([]);
  const [isCreateOpen, setCreateOpen] = React.useState(false);

  // Fetch Logic
  const loadEvents = async () => {
    if(!orgId) return;
    try {
      const data = await fetchOrgEvents(orgId);
      setEvents(data || []);
    } catch (error) {
      console.error("Error loading events", error);
    }
  };

  React.useEffect(() => {
    loadEvents();
  }, [orgId]);

  return (
    <Box>
      {/* Header Actions */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={700}>Organization Events</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddRoundedIcon />} 
          onClick={() => setCreateOpen(true)}
          sx={{ borderRadius: '8px', fontWeight: 600 }}
        >
          Create New Event
        </Button>
      </Stack>

      {/* Events Grid */}
      <Grid container spacing={2}>
        {events.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 2 }}>No events created yet. Click "Create New Event" to start.</Typography>
        ) : (
          events.map((ev) => (
            <Grid item xs={12} key={ev._id || ev.id}>
              <Paper elevation={0} sx={{ 
                p: 2, borderRadius: '12px', border: '1px solid', borderColor: 'divider', 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', boxShadow: 1 }
              }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>{ev.title}</Typography>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5, color: 'text.secondary' }}>
                    <Chip label={ev.category || 'Event'} size="small" variant="outlined" sx={{ borderRadius: '4px', height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <CalendarMonthRoundedIcon sx={{ fontSize: 14 }} />
                      <Typography variant="caption" fontWeight={500}>
                        {ev.startDate ? new Date(ev.startDate).toLocaleDateString() : 'TBD'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
                
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip 
                    label={ev.status || 'Pending'} 
                    color={ev.status === 'Approved' ? 'success' : 'default'} 
                    size="small" 
                    sx={{ fontWeight: 600, borderRadius: '6px' }} 
                  />
                  
                  {/* 3. FIXED BUTTON: Added onClick handler */}
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate(`/student/organize/event/${ev._id || ev.id}`)}
                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                  >
                    Manage
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>

      <CreateEventModal 
        open={isCreateOpen} 
        onClose={() => setCreateOpen(false)} 
        orgId={orgId} 
        onSuccess={loadEvents} 
        existingEvent={null}
      />
    </Box>
  );
}