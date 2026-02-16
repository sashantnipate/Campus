import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import LinearProgress from '@mui/material/LinearProgress';
import { useTheme, alpha } from '@mui/material/styles';

// Icons
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import AccessTimeFilledRoundedIcon from '@mui/icons-material/AccessTimeFilledRounded'; // New Icon

// Services
import { fetchStudentEvents, registerForEvent } from '../services/studentEventService';

// Vibrant color palette
const COLOR_PALETTE = [
  { light: '#FF6B6B', dark: '#E63946', accent: '#FFE0E0' },  // Red
  { light: '#4ECDC4', dark: '#2D9E8F', accent: '#D4F7F5' },  // Teal
  { light: '#FFE66D', dark: '#F4C430', accent: '#FFF9E0' },  // Yellow
  { light: '#1A535C', dark: '#0D2C38', accent: '#D4E4E8' },  // Navy
  { light: '#FF9F1C', dark: '#E67E22', accent: '#FFE5CC' },  // Orange
  { light: '#9B59B6', dark: '#8E44AD', accent: '#F0E6FF' },  // Purple
  { light: '#00D4FF', dark: '#0099CC', accent: '#D4F7FF' },  // Cyan
  { light: '#FF1744', dark: '#D32F2F', accent: '#FFCDD2' },  // Pink
];

export default function StudentDiscovery() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [events, setEvents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [registering, setRegistering] = React.useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('All');
  const [timeFilter, setTimeFilter] = React.useState('Upcoming'); // Default to Upcoming to hide started events

  const [selectedEvent, setSelectedEvent] = React.useState(null);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'info' });

  // Load Events
  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await fetchStudentEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load discovery events", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadEvents();
  }, []);

  // Filter Logic
  const filteredEvents = React.useMemo(() => {
    const now = new Date();

    return events.filter(ev => {
      // 1. Search Filter
      const matchesSearch = ev.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            ev.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Category Filter
      const matchesCategory = categoryFilter === 'All' || ((ev.category || '').toString().toLowerCase() === categoryFilter.toString().toLowerCase());

      // 3. Time Filter (New Logic)
      const eventDate = new Date(ev.startDate);
      let matchesTime = true;
      if (timeFilter === 'Upcoming') {
        // Only show events that have NOT started yet
        matchesTime = eventDate > now;
      }
      // If timeFilter is 'All', matchesTime remains true

      return matchesSearch && matchesCategory && matchesTime;
    });
  }, [events, searchTerm, categoryFilter, timeFilter]);

  const categories = ['All', ...new Set(events.map(ev => ev.category || 'General'))];

  const getColorForIndex = (index) => {
    return COLOR_PALETTE[index % COLOR_PALETTE.length];
  };

  // --- REGISTRATION LOGIC ---
  const handleRegister = async () => {
    if (!selectedEvent) return;
    
    const userString = localStorage.getItem('user'); 
    const userData = userString ? JSON.parse(userString) : null;
    const userId = userData?.id; 

    if (!userId) {
      setSnackbar({ open: true, message: "Please login to register", severity: 'error' });
      return;
    }

    setRegistering(true);
    try {
      await registerForEvent(selectedEvent._id, userId);
      setSnackbar({ open: true, message: "Registration Successful! Check your dashboard.", severity: 'success' });
      
      // Update local state to reflect registration immediately
      setEvents(prev => prev.map(ev => {
        if (ev._id === selectedEvent._id) {
          return { ...ev, registeredStudents: [...(ev.registeredStudents || []), userId] };
        }
        return ev;
      }));
      
      setSelectedEvent(null); // Close modal on success
    } catch (err) {
      setSnackbar({ open: true, message: err || "Registration failed", severity: 'error' });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Helper to check if current user is registered
  const isRegistered = (ev) => {
    const userId = localStorage.getItem('userId'); // Assuming userId is stored separately or parsed from user obj
    // Fallback if strictly stored in user object
    if (!userId) {
       const userStr = localStorage.getItem('user');
       if(userStr) return ev.registeredStudents?.includes(JSON.parse(userStr).id);
    }
    return ev.registeredStudents?.includes(userId);
  };

  return (
    <Box sx={{ width: '100%', p: { xs: 2, md: 4 }, minHeight: '100vh' }}>
      
      {/* Header */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" sx={{ mb: 5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, letterSpacing: '-0.5px', background: isDark ? 'linear-gradient(135deg, #4ECDC4 0%, #9B59B6 100%)' : 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Explore Events
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Find and register for upcoming activities on campus.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
          {/* Search Input */}
          <TextField
            placeholder="Search events..."
            variant="outlined" size="small"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
            sx={{ width: { xs: '100%', md: '220px' }, bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />

          {/* Time Filter (Upcoming vs All) */}
          <TextField
            select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            size="small"
            variant="outlined"
            InputProps={{ startAdornment: <InputAdornment position="start"><AccessTimeFilledRoundedIcon fontSize="small" /></InputAdornment> }}
            sx={{ width: { xs: '100%', md: '160px' }, bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          >
            <MenuItem value="Upcoming">Upcoming</MenuItem>
            <MenuItem value="All">All Events</MenuItem>
          </TextField>

          {/* Category Filter */}
          <TextField
            select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            size="small" variant="outlined"
            InputProps={{ startAdornment: <InputAdornment position="start"><FilterAltRoundedIcon fontSize="small" /></InputAdornment> }}
            sx={{ width: { xs: '100%', md: '160px' }, bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          >
            {categories.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
          </TextField>
        </Stack>
      </Stack>

      {/* Events Grid */}
      <Grid container spacing={3}>
        {filteredEvents.length === 0 ? (
           <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 10, opacity: 0.6 }}>
                 <EmojiEventsRoundedIcon sx={{ fontSize: 60, mb: 2, color: 'text.secondary' }} />
                 <Typography variant="h6" color="text.secondary">No events found matching your criteria.</Typography>
                 {timeFilter === 'Upcoming' && <Typography variant="body2" color="text.secondary">Try switching the time filter to "All Events".</Typography>}
              </Box>
           </Grid>
        ) : (
          filteredEvents.map((ev, index) => {
            const colors = getColorForIndex(index);
            const headerBg = isDark ? colors.dark : colors.light;
            const registered = isRegistered(ev);

            return (
              <Grid item xs={12} sm={6} lg={4} key={ev._id || index}>
                <Card 
                  elevation={0} 
                  onClick={() => setSelectedEvent(ev)}
                  sx={{ 
                    height: '100%', minHeight: 420, display: 'flex', flexDirection: 'column',
                    borderRadius: '16px', border: '1px solid', borderColor: isDark ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.common.black, 0.08),
                    overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer',
                    '&:hover': { transform: 'translateY(-8px)', boxShadow: isDark ? '0 12px 24px rgba(0,0,0,0.6)' : '0 12px 24px rgba(0,0,0,0.12)', borderColor: headerBg }
                  }}
                >
                  {/* Card Header */}
                  <Box sx={{ height: 140, position: 'relative', bgcolor: headerBg, background: `linear-gradient(135deg, ${headerBg} 0%, ${isDark ? alpha(colors.dark, 0.9) : alpha(colors.light, 0.9)} 100%)`, overflow: 'hidden' }}>
                    {ev.posterUrl ? (
                      <CardMedia component="img" height="140" image={ev.posterUrl} alt={ev.title} sx={{ objectFit: 'cover', opacity: 0.85 }} />
                    ) : (
                      <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', position: 'relative', zIndex: 1 }}>
                        <Typography sx={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, letterSpacing: 1.2, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                          {ev.category?.toUpperCase() || 'EVENT'}
                        </Typography>
                      </Stack>
                    )}
                    <Chip label={ev.category || 'Event'} size="small" sx={{ position: 'absolute', top: 10, right: 10, bgcolor: isDark ? alpha(theme.palette.common.black, 0.7) : 'rgba(255,255,255,0.95)', fontWeight: 500, color: headerBg, fontSize: '0.75rem', backdropFilter: 'blur(8px)', zIndex: 2 }} />
                  </Box>

                  {/* Card Content */}
                  <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column', bgcolor: isDark ? alpha(colors.light, 0.08) : colors.accent, borderLeft: `4px solid ${headerBg}`, position: 'relative', overflow: 'hidden' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, lineHeight: 1.3, color: isDark ? '#fff' : '#000', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', zIndex: 1 }}>
                      {ev.title}
                    </Typography>
                    
                    <Stack spacing={1.5} sx={{ mt: 'auto', position: 'relative', zIndex: 1 }}>
                      <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ color: 'text.secondary' }}>
                        <CalendarMonthRoundedIcon sx={{ fontSize: 18, color: headerBg, mt: 0.25 }} />
                        <Typography variant="body2" sx={{ fontWeight: 400, lineHeight: 1.4 }}>
                          {ev.startDate ? new Date(ev.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Date TBD'}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ color: 'text.secondary' }}>
                        <LocationOnRoundedIcon sx={{ fontSize: 18, color: headerBg, mt: 0.25 }} />
                        <Typography variant="body2" sx={{ fontWeight: 400, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {ev.location || 'Campus'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>

                  {/* Card Actions */}
                  <CardActions sx={{ p: 2.5, pt: 1 }}>
                    <Button fullWidth variant={registered ? "outlined" : "contained"} onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); }} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, py: 1.2, bgcolor: registered ? 'transparent' : headerBg, color: registered ? headerBg : '#fff', borderColor: headerBg, '&:hover': { bgcolor: registered ? alpha(headerBg, 0.1) : headerBg } }}>
                      {registered ? "View Status" : "View Details"}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>

      {/* --- EVENT DETAILS DIALOG --- */}
      <Dialog 
        open={Boolean(selectedEvent)} 
        onClose={() => setSelectedEvent(null)}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '20px', bgcolor: 'background.paper', overflow: 'hidden' } }}
      >
        {selectedEvent && (
          <>
            <Box sx={{ position: 'relative', height: 180, bgcolor: getColorForIndex(events.indexOf(selectedEvent)).light }}>
                {selectedEvent.posterUrl ? (
                    <Box component="img" src={selectedEvent.posterUrl} sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                ) : (
                    <Stack alignItems="center" justifyContent="center" height="100%"><EmojiEventsRoundedIcon sx={{ fontSize: 60, color: 'white', opacity: 0.5 }}/></Stack>
                )}
                <IconButton onClick={() => setSelectedEvent(null)} sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(0,0,0,0.4)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}>
                    <CloseRoundedIcon />
                </IconButton>
                <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', p: 3, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                    <Typography variant="h5" fontWeight={700} color="white">{selectedEvent.title}</Typography>
                    <Stack direction="row" spacing={1} mt={1}>
                        <Chip label={selectedEvent.category} size="small" sx={{ bgcolor: 'white', color: 'black', fontWeight: 600 }} />
                        <Chip label={selectedEvent.department} size="small" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }} />
                    </Stack>
                </Box>
            </Box>
            
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                {/* Left: Info */}
                <Grid item xs={12}>
                    <Stack direction="row" spacing={4} sx={{ mb: 2 }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>START DATE</Typography>
                            <Typography variant="body2" fontWeight={600}>
                                {new Date(selectedEvent.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>LOCATION</Typography>
                            <Typography variant="body2" fontWeight={600}>{selectedEvent.location || 'TBD'}</Typography>
                        </Box>
                    </Stack>

                    <Divider sx={{ mb: 2 }} />
                    
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {selectedEvent.description}
                    </Typography>

                    {/* SEATS INDICATOR */}
                    {selectedEvent.maxSeats > 0 && (
                        <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: '12px' }}>
                            <Stack direction="row" justifyContent="space-between" mb={1}>
                                <Typography variant="caption" fontWeight={600} color="primary">SEATS FILLING FAST</Typography>
                                <Typography variant="caption" fontWeight={600}>
                                    {selectedEvent.registeredStudents?.length || 0} / {selectedEvent.maxSeats}
                                </Typography>
                            </Stack>
                            <LinearProgress 
                                variant="determinate" 
                                value={Math.min(((selectedEvent.registeredStudents?.length || 0) / selectedEvent.maxSeats) * 100, 100)} 
                                sx={{ height: 8, borderRadius: 4 }} 
                            />
                        </Box>
                    )}
                </Grid>

                {/* Right: Round Timeline */}
                {selectedEvent.rounds && selectedEvent.rounds.length > 0 && (
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>EVENT STAGES</Typography>
                        <Stepper orientation="vertical" activeStep={-1} sx={{ '& .MuiStepConnector-line': { minHeight: '20px' } }}>
                            {selectedEvent.rounds.map((round, index) => (
                                <Step key={index} expanded>
                                    <StepLabel icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />}>
                                        <Typography variant="body2" fontWeight={600}>{round.title}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(round.startDate).toLocaleDateString()}
                                        </Typography>
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Grid>
                )}
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button 
                fullWidth 
                size="large" 
                variant="contained" 
                onClick={handleRegister}
                disabled={isRegistered(selectedEvent) || registering || (selectedEvent.maxSeats > 0 && (selectedEvent.registeredStudents?.length || 0) >= selectedEvent.maxSeats)}
                sx={{ 
                    borderRadius: '12px', 
                    py: 1.5, 
                    fontWeight: 700, 
                    bgcolor: isRegistered(selectedEvent) ? 'success.main' : 'primary.main',
                    '&:disabled': { bgcolor: isRegistered(selectedEvent) ? alpha(theme.palette.success.main, 0.7) : 'action.disabledBackground' }
                }}
              >
                {registering ? <CircularProgress
                                        size={20}
                                        sx={{
                                          color: 'white',
                                        }}
                  /> : 
                 isRegistered(selectedEvent) ? "✓ Already Registered" : 
                 (selectedEvent.maxSeats > 0 && (selectedEvent.registeredStudents?.length || 0) >= selectedEvent.maxSeats) ? "Sold Out" : 
                 "Confirm Registration"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity} 
          variant="filled" 
          sx={{ 
            borderRadius: '12px', 
            fontWeight: 600,
            color: 'white', 
            backgroundColor: 
              snackbar.severity === 'success' ? '#38cb82' : 
              snackbar.severity === 'error' ? '#FF7F7F' : 
              undefined, 
            '& .MuiAlert-icon': { color: 'white' }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}