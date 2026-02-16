import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

// FullCalendar Imports
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// Icons
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import ViewWeekRoundedIcon from '@mui/icons-material/ViewWeekRounded';
import ViewDayRoundedIcon from '@mui/icons-material/ViewDayRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';

import { fetchStudentEvents } from '../services/studentEventService';
import { useNavigate } from 'react-router-dom';
// import Maps from './Maps';

export default function StudentCalendar() {
  const theme = useTheme();
  const calendarRef = React.useRef(null);
  
  const [currentView, setCurrentView] = React.useState('dayGridMonth');
  const [calendarTitle, setCalendarTitle] = React.useState('');
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState(null); 
  const navigate = useNavigate();
  const [calendarEvents, setCalendarEvents] = React.useState([]); 

  // Bright color palette (no yellow) – each event gets one of these
  const brightColors = [
    '#4f9eff', // bright blue
    '#5bd96f', // bright green
    '#ff7b7b', // bright red
    '#ca8eff', // bright purple
    '#ffaa4e', // bright orange
    '#ff6b9d', // bright pink
    '#3bc0c0', // bright teal
    '#ff8c42', // bright coral
  ];

  // Assign a color based on event id (or index) for consistency
  const getEventColor = (id, index) => {
    // Use id if available, otherwise index
    const hash = id ? String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : index;
    return brightColors[hash % brightColors.length];
  };

  // --- API Data Loading ---
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchStudentEvents();
        const eventsList = Array.isArray(data) ? data : [];

        const mappedEvents = eventsList.map((ev, idx) => {
          const bgColor = getEventColor(ev._id, idx);
          return {
            id: ev._id,
            title: ev.title,
            start: ev.startDate,
            end: ev.endDate,
            backgroundColor: bgColor,
            textColor: '#000000', // black text
            borderColor: 'transparent',
            extendedProps: { originalEvent: ev }
          };
        });
        setCalendarEvents(mappedEvents);
      } catch (error) {
        console.error("Failed to load calendar events", error);
      }
    };
    loadData();
  }, []); // Run once on mount

  // --- Calendar Controls ---
  const handlePrev = () => calendarRef.current?.getApi()?.prev();
  const handleNext = () => calendarRef.current?.getApi()?.next();
  const goToToday = () => calendarRef.current?.getApi()?.today();
  const changeView = (viewName) => {
    calendarRef.current?.getApi()?.changeView(viewName);
    setCurrentView(viewName);
  };
  
  const handleDatesSet = (arg) => setCalendarTitle(arg.view.title);
  
  const handleEventClick = (arg) => {
    const clickedEventData = arg.event.extendedProps.originalEvent; 
    setSelectedEvent(clickedEventData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // --- Stats Logic (unchanged) ---
  const getCatCount = (cat) => calendarEvents.filter(e => e.extendedProps.originalEvent.eventType?.toLowerCase() === cat).length;
  
  const categories = React.useMemo(() => [
    { label: 'All', count: calendarEvents.length },
    { label: 'Hackathons', count: getCatCount('hackathon') },
    { label: 'Workshops', count: getCatCount('workshop') },
    { label: 'Seminars', count: getCatCount('seminar') },
  ], [calendarEvents]);


  return (
    <Box sx={{ width: '100%', maxWidth: '100%', margin: '0 auto', p: { xs: 2, xl: 6 }, bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh', fontFamily: 'inherit' }}>
      
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.5px', color: 'text.primary' }}>
            Event Schedule
          </Typography>
        </Stack>

        {/* <Stack direction="row" spacing={1.5} sx={{ mt: 3, flexWrap: 'wrap', gap: 1 }}>
          {categories.map((cat) => (
            <Chip key={cat.label} label={`${cat.label} (${cat.count})`} size="small" sx={{ borderRadius: '12px', fontWeight: 500, fontSize: '0.8125rem', bgcolor: 'background.paper', color: 'text.primary', border: '1px solid', borderColor: 'divider', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'action.hover' } }} />
          ))}
        </Stack> */}
      </Box>

      {/* Force white background for the calendar paper */}
      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, bgcolor: '#ffffff', borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: theme.palette.mode === 'dark' ? '0 20px 40px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between', mb: 4, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Stack direction="row" spacing={0.5}>
              <IconButton onClick={handlePrev} sx={{ borderRadius: '12px', color: 'text.secondary', '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}><ChevronLeftRoundedIcon /></IconButton>
              <IconButton onClick={handleNext} sx={{ borderRadius: '12px', color: 'text.secondary', '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}><ChevronRightRoundedIcon /></IconButton>
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', minWidth: '160px', letterSpacing: '-0.5px' }}>{calendarTitle}</Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Jump to Today" TransitionComponent={Zoom}>
              <Button onClick={goToToday} startIcon={<CalendarTodayRoundedIcon sx={{ fontSize: 18 }} />} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, bgcolor: 'transparent', color: 'text.primary', '&:hover': { bgcolor: 'action.hover' } }}>Today</Button>
            </Tooltip>
            <Stack direction="row" spacing={0.5} sx={{ bgcolor: 'action.hover', p: 0.5, borderRadius: '16px' }}>
              {[ { id: 'dayGridMonth', icon: ViewModuleRoundedIcon, label: 'Month' }, { id: 'timeGridWeek', icon: ViewWeekRoundedIcon, label: 'Week' }, { id: 'timeGridDay', icon: ViewDayRoundedIcon, label: 'Day' } ].map((view) => (
                <Button key={view.id} size="small" onClick={() => changeView(view.id)} startIcon={<view.icon sx={{ fontSize: 18 }} />} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, px: 2, py: 0.75, color: currentView === view.id ? 'text.primary' : 'text.secondary', bgcolor: currentView === view.id ? '#ffffff' : 'transparent', boxShadow: currentView === view.id ? '0 2px 8px rgba(0,0,0,0.15)' : 'none', '&:hover': { bgcolor: currentView === view.id ? '#ffffff' : 'action.selected', color: 'text.primary' } }}>{view.label}</Button>
              ))}
            </Stack>
          </Stack>
        </Box>

        {/* Calendar container with white background and bright event colors */}
        <Box sx={{
          '--fc-page-bg-color': '#ffffff',
          '--fc-neutral-bg-color': '#f5f5f5',
          '--fc-neutral-text-color': '#000000',
          '--fc-border-color': '#e0e0e0',
          '& .fc-col-header-cell': { 
            padding: '16px 0', 
            bgcolor: '#ffffff', 
            color: '#000000', 
            borderBottom: '1px solid', 
            borderColor: '#e0e0e0' 
          },
          '& .fc-col-header-cell-cushion': { 
            fontSize: '0.9rem', 
            fontWeight: '600', 
            color: '#000000' 
          },
          '& .fc-theme-standard td, & .fc-theme-standard th': { 
            border: '1px solid', 
            borderColor: '#e0e0e0' 
          },
          '& .fc-daygrid-day-frame': { 
            minHeight: '160px', 
            padding: '8px', 
            borderRadius: '16px', 
            transition: 'all 0.2s ease', 
            cursor: 'pointer', 
            backgroundColor: '#ffffff !important' 
          },
          '& .fc-daygrid-day-frame:hover': { 
            backgroundColor: '#f5f5f5' 
          },
          '& .fc-daygrid-day-top': { 
            flexDirection: 'row', 
            padding: '4px 8px' 
          },
          '& .fc-daygrid-day-number': { 
            fontSize: '0.9rem', 
            fontWeight: '600', 
            color: '#000000', 
            width: '32px', 
            height: '32px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            borderRadius: '50%' 
          },
          '& .fc-day-today .fc-daygrid-day-number': { 
            background: '#000000', 
            color: '#ffffff', 
            fontWeight: '700' 
          },
          '& .fc-timegrid-slot': { 
            height: '80px !important' 
          },
          '& .fc-timegrid-slot-label-cushion': { 
            fontSize: '0.75rem', 
            fontWeight: '500', 
            color: '#666', 
            textTransform: 'uppercase', 
            paddingRight: '12px' 
          },
          '& .fc-timegrid-axis-cushion': { 
            fontSize: '0.75rem', 
            color: '#666' 
          },
          // Events – bright colors already set inline, but ensure no override
          '& .fc-event': { 
            borderRadius: '10px', 
            padding: '8px 12px', 
            margin: '4px 0', 
            fontSize: '0.85rem', 
            fontWeight: '600', 
            border: '1px solid transparent', 
            boxShadow: 'none', 
            transition: 'all 0.2s ease', 
            cursor: 'pointer',
            '&:hover': { 
              transform: 'translateY(-2px)', 
              zIndex: 5, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
            } 
          },
          '& .fc-h-event .fc-event-main, & .fc-v-event .fc-event-main': { 
            color: 'inherit' 
          },
          '& .fc-event-title': { 
            fontWeight: '700' 
          },
          '& .fc-timegrid-now-indicator-line': { 
            borderColor: theme.palette.error.main, 
            borderWidth: '2px' 
          },
          '& .fc-timegrid-now-indicator-arrow': { 
            borderColor: theme.palette.error.main, 
            borderWidth: '6px' 
          },
        }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false}
            datesSet={handleDatesSet}
            events={calendarEvents} 
            eventClick={handleEventClick} 
            height="auto"
            firstDay={0}
            fixedWeekCount={false}
            dayMaxEvents={4} 
            eventDisplay="block"
            nowIndicator={true}
            slotDuration="01:00:00"
          />
        </Box>
      </Paper>

      {/* Event Details Modal (unchanged) */}
      <Dialog 
        open={isModalOpen} 
        onClose={closeModal}
        PaperProps={{
          sx: { borderRadius: '20px', p: 1, maxWidth: '800px', width: '100%' }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.3rem', pb: 1 }}>
          {selectedEvent?.title}
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1}>
              <Chip 
                label={selectedEvent?.eventType || 'Event'} 
                size="small" 
                color="primary" 
                sx={{ fontWeight: 600, borderRadius: '6px' }} 
              />
              <Chip 
                label={selectedEvent?.department || 'General'} 
                size="small" 
                variant="outlined" 
                sx={{ fontWeight: 600, borderRadius: '6px' }} 
              />
            </Stack>

            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, whiteSpace: 'pre-line', }}>
              {selectedEvent?.description}
            </Typography>

            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
                <AccessTimeRoundedIcon fontSize="small" color="action" />
                <Typography variant="body2" fontWeight={500}>
                  {selectedEvent?.startDate ? new Date(selectedEvent.startDate).toLocaleString() : 'TBD'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
                <LocationOnRoundedIcon fontSize="small" color="action" />
                <Typography variant="body2" fontWeight={500}>
                  {selectedEvent?.location}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={closeModal} 
            sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            disableElevation
            onClick={() => {
              closeModal();
              navigate(`/student/event/${selectedEvent._id}`);
            }}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 700, 
              borderRadius: '10px',
              px: 3,
              bgcolor: '#2563eb'
            }}
          >
            Learn More
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}