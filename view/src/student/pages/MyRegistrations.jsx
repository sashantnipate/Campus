import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Grid, Paper, Chip, Stack, Button, 
  Stepper, Step, StepLabel, Skeleton, Divider 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Icons
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import { fetchMyRegistrations } from '../services/studentEventService';

export default function MyRegistrations() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchMyRegistrations();
      setRegistrations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Qualified': return 'success';
      case 'Registered': return 'info';
      case 'Pending': return 'warning';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" fontWeight={700} mb={3}>My Registrations</Typography>
        <Grid container spacing={3}>
          {[1, 2].map((i) => (
            <Grid item xs={12} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '16px' }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
        My Registrations
      </Typography>

      {registrations.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: '16px', bgcolor: 'grey.50' }}>
          <EventAvailableRoundedIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">You haven't registered for any events yet.</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/student/discover')}>
            Discover Events
          </Button>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {registrations.map((reg) => {
            const event = reg.event || {};
            const rounds = event.rounds || [];
            // Assuming reg.currentRound is a number (1, 2, 3)
            const currentRoundNum = reg.currentRound || 1; 

            return (
              <Paper key={reg._id} elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid', borderColor: 'divider', transition: '0.2s', '&:hover': { boxShadow: 4 } }}>
                <Grid container spacing={4}>
                  
                  {/* LEFT: Event Details */}
                  <Grid item xs={12} md={4}>
                    <Stack spacing={2}>
                      <Box>
                        <Chip 
                          label={reg.status} 
                          color={getStatusColor(reg.status)} 
                          size="small" 
                          sx={{ mb: 1, fontWeight: 700, borderRadius: '6px' }} 
                        />
                        <Typography variant="h5" fontWeight={700}>
                          {event.title || "Untitled Event"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {event.category} • {event.department}
                        </Typography>
                      </Box>

                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                          <CalendarMonthRoundedIcon fontSize="small" />
                          <Typography variant="body2">{event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD'}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                          <LocationOnRoundedIcon fontSize="small" />
                          <Typography variant="body2">{event.location || 'Online'}</Typography>
                        </Stack>
                      </Stack>
                      
                      <Button 
                        variant="outlined" 
                        endIcon={<ArrowForwardRoundedIcon />}
                        onClick={() => navigate(`/student/event/${event._id}`)} // Assuming you have a student view for single event
                        sx={{ borderRadius: '10px', width: 'fit-content' }}
                      >
                        View Details
                      </Button>
                    </Stack>
                  </Grid>

                  {/* RIGHT: Round Status Stepper */}
                  <Grid item xs={12} md={8}>
                    <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: '16px', height: '100%' }}>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 3, textTransform: 'uppercase', color: 'text.secondary' }}>
                        Selection Process Tracker
                      </Typography>
                      
                      {rounds.length > 0 ? (
                        <Stepper activeStep={currentRoundNum - 1} alternativeLabel>
                          {rounds.map((round, index) => {
                            const stepNum = index + 1;
                            const isCompleted = stepNum < currentRoundNum;
                            const isCurrent = stepNum === currentRoundNum;
                            const isFailed = reg.status === 'Rejected' && isCurrent;

                            return (
                              <Step key={round._id || index} completed={isCompleted}>
                                <StepLabel 
                                  error={isFailed}
                                  StepIconComponent={() => (
                                    <Box sx={{
                                      width: 32, height: 32, borderRadius: '50%',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      bgcolor: isFailed ? 'error.main' : (isCompleted || isCurrent ? 'success.main' : 'grey.300'),
                                      color: 'white'
                                    }}>
                                      {isFailed ? <CancelRoundedIcon fontSize="small"/> : 
                                       isCompleted ? <CheckCircleRoundedIcon fontSize="small"/> : 
                                       stepNum}
                                    </Box>
                                  )}
                                >
                                  <Typography variant="body2" fontWeight={isCurrent ? 700 : 400}>
                                    {round.title}
                                  </Typography>
                                  {isCurrent && (
                                    <Typography variant="caption" color={isFailed ? 'error' : 'primary.main'} fontWeight={600}>
                                      {isFailed ? 'Not Selected' : 'Current Stage'}
                                    </Typography>
                                  )}
                                </StepLabel>
                              </Step>
                            );
                          })}
                        </Stepper>
                      ) : (
                        <Typography color="text.secondary" fontStyle="italic">No rounds defined for this event.</Typography>
                      )}
                    </Box>
                  </Grid>

                </Grid>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}