import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';

// Icons
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ImageNotSupportedRoundedIcon from '@mui/icons-material/ImageNotSupportedRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

import CreateEventModal from './CreateEventModal';
import { fetchEventDetails } from '../../services/studentEventService';

// --- STYLED COMPONENTS ---
const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[200],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.success.main,
  },
}));

export default function EventOverview() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [activeRoundIndex, setActiveRoundIndex] = React.useState(0);

  // --- DATA FETCHING ---
  const loadEventData = React.useCallback(async () => {
    if (!eventId) return; 

    setLoading(true);
    try {
      const data = await fetchEventDetails(eventId);
      setEvent(data);
      calculateActiveRound(data.rounds || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load event details.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // --- INITIAL LOAD ONLY (No Auto-Refresh) ---
  React.useEffect(() => {
    loadEventData(); 
  }, [loadEventData]);

  // --- LOGIC HELPERS ---
  const calculateActiveRound = (rounds) => {
    const index = rounds.findIndex(r => r.status === 'Live' || r.status === 'Upcoming');
    if (index === -1) {
        if (rounds.length > 0) {
            const lastRound = rounds[rounds.length - 1];
            if (lastRound.status === 'Completed' || lastRound.status === 'Complete') {
                setActiveRoundIndex(rounds.length); // 100% complete
            } else {
                setActiveRoundIndex(0);
            }
        } else {
            setActiveRoundIndex(0);
        }
    } else {
        setActiveRoundIndex(index);
    }
  };

  const getEventStatus = (start, end) => {
    const now = new Date().getTime();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    if (now < startTime) return { label: 'UPCOMING', color: 'info' };
    if (now > endTime) return { label: 'COMPLETED', color: 'default' };
    return { label: 'LIVE', color: 'success' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' 
    });
  };

  const handleManageRound = (roundIndex) => {
    // Note: Ensure your Router has a route for 'console' relative to this page
    navigate(`console`, { state: { startTab: roundIndex } });
  };

  if (loading && !event) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Skeleton variant="rectangular" height={250} sx={{ borderRadius: '24px', mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={4} key={i}><Skeleton variant="rectangular" height={120} sx={{ borderRadius: '20px' }} /></Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" variant="filled" sx={{ borderRadius: '12px' }}>{error || "Event not found."}</Alert>
      </Box>
    );
  }

  const status = getEventStatus(event.startDate, event.endDate);
  const displayImage = event.posterUrl || event.bannerUrl;
  
  const totalRounds = event.rounds?.length || 0;
  const registrationCount = event.registrations?.length || event.registeredStudents?.length || 0;
  const maxSeats = event.maxSeats || 0;
  
  const seatProgress = maxSeats > 0 ? Math.min(Math.round((registrationCount / maxSeats) * 100), 100) : 0;
  const roundProgress = totalRounds > 0 ? Math.round((activeRoundIndex / totalRounds) * 100) : 0;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      
      {/* 1. HERO CARD */}
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: '24px', border: '2px solid', borderColor: 'divider', mb: 4, bgcolor: 'white' }}>
        <Stack direction={{ xs: 'column-reverse', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={4}>
          <Box sx={{ flexGrow: 1, width: '100%' }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }} alignItems="center">
              <Chip label={event.category?.toUpperCase()} color="primary" size="small" sx={{ fontWeight: 500, borderRadius: '6px' }} />
              <Chip label={status.label} color={status.color} size="small" variant="outlined" sx={{ fontWeight: 500, borderRadius: '6px', borderWidth: 1 }} />
              <Button size="small" startIcon={<RefreshRoundedIcon />} onClick={loadEventData} sx={{ color: 'text.secondary', minWidth: 'auto', textTransform: 'none' }}>
                Refresh
              </Button>
            </Stack>
            
            <Typography variant="h3" fontWeight={600} sx={{ mb: 1, letterSpacing: '-0.5px', fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
              {event.title}
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 3 }} color="text.secondary" sx={{ mb: 3, mt: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarMonthRoundedIcon fontSize="small" color="primary" />
                <Typography variant="body2" fontWeight={500}>{formatDate(event.startDate)}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <LocationOnRoundedIcon fontSize="small" color="primary" />
                <Typography variant="body2" fontWeight={500}>{event.location || "Online"}</Typography>
              </Stack>
            </Stack>

            <Typography variant="body1" color="text.secondary" paragraph sx={{ whiteSpace: 'pre-line', maxWidth: '800px', lineHeight: 1.6 }}>
              {event.description}
            </Typography>

            <Button 
              variant="outlined" 
              onClick={() => setEditModalOpen(true)}
              startIcon={<EditRoundedIcon />} 
              sx={{ mt: 2, borderRadius: '12px', textTransform: 'none', px: 3, fontWeight: 500 }}
            >
              Edit Details
            </Button>
          </Box>

          <Box sx={{ 
            width: { xs: '100%', md: '350px' }, height: '250px', bgcolor: 'grey.100', 
            borderRadius: '20px', overflow: 'hidden', border: '1px solid', borderColor: 'divider', flexShrink: 0
          }}>
            {displayImage ? (
               <Box component="img" src={displayImage} alt="Event Poster" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Stack sx={{ width: '100%', height: '100%', color: 'text.disabled' }} alignItems="center" justifyContent="center">
                 <ImageNotSupportedRoundedIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                 <Typography variant="caption" fontWeight={500}>NO POSTER</Typography>
              </Stack>
            )}
          </Box>
        </Stack>
      </Paper>

      {/* 2. STATS GRID */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Registrations Card */}
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: '20px', border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 2, bgcolor: 'white' }}>
            <Stack direction="row" alignItems="center" gap={2.5}>
                <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: 'primary.lighter', color: 'primary.main', display: 'flex' }}><GroupsRoundedIcon fontSize="large" /></Box>
                <Box>
                <Typography variant="h4" fontWeight={600}>
                    {maxSeats > 0 ? `${registrationCount}/${maxSeats}` : registrationCount}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>Total Registrations</Typography>
                </Box>
            </Stack>
            {maxSeats > 0 && (
                <Box sx={{ width: '100%' }}>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" fontWeight={500} color="text.secondary">Capacity</Typography>
                        <Typography variant="caption" fontWeight={600} color={seatProgress >= 100 ? 'error.main' : 'primary.main'}>{seatProgress}%</Typography>
                    </Stack>
                    <BorderLinearProgress variant="determinate" value={seatProgress} color={seatProgress >= 100 ? 'error' : 'primary'} />
                </Box>
            )}
          </Paper>
        </Grid>

        {/* Current Stage Card */}
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: '20px', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2.5, height: '100%', bgcolor: 'white' }}>
            <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: 'warning.lighter', color: 'warning.main', display: 'flex' }}><EmojiEventsRoundedIcon fontSize="large" /></Box>
            <Box>
              <Typography variant="h4" fontWeight={600}>
                {Math.min(activeRoundIndex + 1, totalRounds)}<Typography component="span" variant="h6" color="text.secondary" fontWeight={400}>/{totalRounds}</Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>Current Stage</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 3. TIMELINE & PROGRESS */}
      {event.rounds && event.rounds.length > 0 && (
        <Paper elevation={3} sx={{ p: 4, borderRadius: '24px', border: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
          
          {/* --- EVENT PROGRESS BAR --- */}
          <Box sx={{ mb: 5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" fontWeight={600}>Event Progress</Typography>
                <Typography variant="body2" fontWeight={600} color="success.main">{roundProgress}% Complete</Typography>
            </Stack>
            <BorderLinearProgress variant="determinate" value={roundProgress} />
          </Box>
          
          <Stepper activeStep={activeRoundIndex} orientation="vertical">
            {event.rounds.map((round, index) => {
              const isCompleted = index < activeRoundIndex;
              const isActive = index === activeRoundIndex;
              
              return (
                <Step key={index} expanded={true} completed={isCompleted}>
                  <StepLabel 
                    StepIconComponent={() => (
                        <Box sx={{ 
                            width: 32, height: 32, borderRadius: '50%', 
                            bgcolor: isCompleted ? 'success.main' : isActive ? 'primary.main' : 'grey.300',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 'bold', zIndex: 1
                        }}>
                            {isCompleted ? <CheckCircleRoundedIcon fontSize="small" /> : index + 1}
                        </Box>
                    )}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ color: isActive ? 'text.primary' : 'text.secondary' }}>
                        {round.title}
                      </Typography>
                      {isActive && <Chip label="LIVE" size="small" color="error" variant="filled" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, animation: 'pulse 2s infinite' }} />}
                    </Stack>
                  </StepLabel>
                  
                  <StepContent>
                    <Box sx={{ 
                        ml: 1, mt: 1, mb: 2, p: 2, 
                        bgcolor: isActive ? 'primary.lighter' : 'transparent', 
                        borderRadius: '12px', 
                        borderLeft: isActive ? '4px solid' : 'none',
                        borderColor: 'primary.main'
                    }}>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1 }}>{round.description}</Typography>
                      
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Chip 
                            icon={<AccessTimeRoundedIcon fontSize="small" />} 
                            label={`${formatDate(round.startDate)}`} 
                            size="small" 
                            variant="outlined" 
                            sx={{ bgcolor: 'background.paper', borderColor: 'divider' }} 
                        />
                        <Button 
                            size="small" 
                            variant={isActive ? "contained" : "outlined"} 
                            onClick={() => handleManageRound(index)} 
                            endIcon={isActive ? <ArrowForwardRoundedIcon /> : <VisibilityRoundedIcon />}
                            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 500, boxShadow: 'none' }}
                        >
                            {isActive ? "Manage Active Round" : "View Round Details"}
                        </Button>
                      </Stack>
                    </Box>
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
        </Paper>
      )}

      {/* Modal Integration - Safe orgId Passing */}
      <CreateEventModal 
        open={editModalOpen} 
        onClose={() => setEditModalOpen(false)}
        existingEvent={event}
        onSuccess={() => loadEventData()}
        // Safe check: If orgId is an object (populated), get its _id, otherwise use string
        orgId={event.orgId && typeof event.orgId === 'object' ? event.orgId._id : event.orgId}
      />
      
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </Box>
  );
}