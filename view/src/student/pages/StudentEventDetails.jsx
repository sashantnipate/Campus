import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Stack, Chip, Button, Grid, 
  Divider, CircularProgress, Alert, Stepper, Step, StepLabel, StepContent
} from '@mui/material';

// Icons
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

// Services
import { fetchEventDetails, fetchMyRegistrations } from '../services/studentEventService';

export default function StudentEventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);       // The Event Details
  const [myReg, setMyReg] = useState(null);     // The User's Registration for this event
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // 1. Fetch public event details
        const eventResult = await fetchEventDetails(eventId);
        setData(eventResult);

        const myRegs = await fetchMyRegistrations();
        const match = myRegs.find(r => r.event && (r.event._id === eventId || r.event.id === eventId));
        setMyReg(match);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [eventId]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;
  if (!data) return <Alert severity="error">Event details not found.</Alert>;

  // --- LOGIC ---
  const currentRoundNum = myReg ? (myReg.currentRound || 1) : 1;
  const totalRounds = data.rounds?.length || 0;
  const isRejected = myReg?.status === 'Rejected' || myReg?.status === 'Eliminated';

  // --- RENDER ---
  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 4 } }}>
      
      {/* HEADER NAV */}
      <Button 
        startIcon={<ArrowBackRoundedIcon />} 
        onClick={() => navigate(-1)} 
        sx={{ mb: 3, textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
      >
        Back
      </Button>

      <Paper elevation={0} sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', mb: 4 }}>
        {/* Banner */}
        <Box sx={{ width: '100%', height: 250, bgcolor: 'grey.100' }}>
          {data.posterUrl ? (
            <img src={data.posterUrl} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.disabled' }}>
              <Typography>No Banner Available</Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ p: 4 }}>
          {/* Header Info */}
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 3 }}>
            <Box>
              <Chip label={data.category} color="primary" size="small" sx={{ mb: 1.5, fontWeight: 700 }} />
              <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-1px', mb: 1 }}>{data.title}</Typography>
              <Typography variant="body2" color="text.secondary">Hosted by <b>{data.department}</b></Typography>
            </Box>
            
            {/* My Status Badge */}
            {myReg && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: isRejected ? 'error.lighter' : 'primary.lighter', borderColor: isRejected ? 'error.light' : 'primary.light', minWidth: 150 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">My Status</Typography>
                    <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                        {isRejected ? <CancelRoundedIcon color="error" /> : <EmojiEventsRoundedIcon color="primary" />}
                        <Typography variant="h6" fontWeight={700} color={isRejected ? 'error.main' : 'primary.main'}>
                            {myReg.status || 'Registered'}
                        </Typography>
                    </Stack>
                </Paper>
            )}
          </Stack>

          {/* Key Details */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Stack direction="row" spacing={1.5} alignItems="center" color="text.secondary">
                <CalendarMonthRoundedIcon color="action" />
                <Typography variant="body1" fontWeight={500}>
                  {new Date(data.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Stack direction="row" spacing={1.5} alignItems="center" color="text.secondary">
                <LocationOnRoundedIcon color="action" />
                <Typography variant="body1" fontWeight={500}>{data.location || 'Online'}</Typography>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 4 }} />

          <Typography variant="h6" fontWeight={700} gutterBottom>About this Event</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
            {data.description}
          </Typography>
        </Box>
      </Paper>

      {/* --- ROUNDS STEPPER (No Progress Bar) --- */}
      {totalRounds > 0 && (
        <Paper elevation={3} sx={{ p: 4, borderRadius: '24px', border: '1px solid', borderColor: 'divider' }}>
          
          <Typography variant="h6" fontWeight={600} sx={{ mb: 4 }}>Event Stages</Typography>

          <Stepper activeStep={currentRoundNum - 1} orientation="vertical">
              {data.rounds?.map((round, index) => {
                  const roundNum = index + 1;
                  const isCompleted = roundNum < currentRoundNum;
                  const isActive = roundNum === currentRoundNum;
                  
                  const showQualifiedMsg = isActive && roundNum > 1 && !isRejected;
                  const showEliminatedMsg = isActive && isRejected;

                  return (
                      <Step key={index} expanded={true} completed={isCompleted}>
                          <StepLabel 
                              error={isActive && isRejected}
                              StepIconComponent={() => (
                                  <Box sx={{ 
                                      width: 32, height: 32, borderRadius: '50%', 
                                      bgcolor: (isActive && isRejected) ? 'error.main' : 
                                               isCompleted ? 'success.main' : 
                                               isActive ? 'primary.main' : 'grey.300',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      color: 'white', fontWeight: 'bold', zIndex: 1
                                  }}>
                                      {(isActive && isRejected) ? <CancelRoundedIcon fontSize="small" /> :
                                       isCompleted ? <CheckCircleRoundedIcon fontSize="small" /> : 
                                       roundNum}
                                  </Box>
                              )}
                          >
                              <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Typography variant="subtitle1" fontWeight={600} sx={{ color: isActive ? (isRejected ? 'error.main' : 'text.primary') : 'text.secondary' }}>
                                      {round.title}
                                  </Typography>
                                  {isActive && !isRejected && (
                                      <Chip label="CURRENT STAGE" size="small" color="primary" variant="filled" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                                  )}
                              </Stack>
                          </StepLabel>
                          
                          <StepContent>
                              <Box sx={{ 
                                  ml: 1, mt: 1, mb: 2, p: 2, 
                                  bgcolor: (isActive && isRejected) ? 'error.lighter' : isActive ? 'primary.lighter' : 'transparent', 
                                  borderRadius: '12px', 
                                  borderLeft: isActive ? '4px solid' : 'none',
                                  borderColor: isRejected ? 'error.main' : 'primary.main'
                              }}>
                                  {/* QUALIFIED MESSAGE */}
                                  {showQualifiedMsg && (
                                      <Alert 
                                          icon={<StarRoundedIcon fontSize="inherit" />} 
                                          severity="success" 
                                          sx={{ mb: 2, borderRadius: '8px', fontWeight: 600, alignItems: 'center' }}
                                      >
                                          Congratulations! You've qualified for this round.
                                      </Alert>
                                  )}

                                  {/* ELIMINATED MESSAGE */}
                                  {showEliminatedMsg && (
                                      <Alert 
                                          severity="error" 
                                          sx={{ mb: 2, borderRadius: '8px', fontWeight: 600, alignItems: 'center' }}
                                      >
                                          Unfortunately, you were not selected for the next round.
                                      </Alert>
                                  )}

                                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1 }}>
                                      {round.description}
                                  </Typography>
                                  
                                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                                      <Chip 
                                          icon={<AccessTimeRoundedIcon fontSize="small" />} 
                                          label={round.startDate ? new Date(round.startDate).toLocaleString() : "TBD"} 
                                          size="small" 
                                          variant="outlined" 
                                          sx={{ bgcolor: 'background.paper', borderColor: 'divider' }} 
                                      />
                                  </Stack>
                              </Box>
                          </StepContent>
                      </Step>
                  );
              })}
          </Stepper>
        </Paper>
      )}
    </Box>
  );
}