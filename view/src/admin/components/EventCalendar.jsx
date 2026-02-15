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

// FullCalendar Imports
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// Icons
import DriveFileRenameOutlineRoundedIcon from '@mui/icons-material/DriveFileRenameOutlineRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import ViewWeekRoundedIcon from '@mui/icons-material/ViewWeekRounded';
import ViewDayRoundedIcon from '@mui/icons-material/ViewDayRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

// Modal & API
import CreateEventModal from './CreateEventModal';
import { fetchAdminEvents } from '../services/adminEventService';

export default function EventCalendar() {
  const theme = useTheme();
  const calendarRef = React.useRef(null);
  
  const [currentView, setCurrentView] = React.useState('dayGridMonth');
  const [calendarTitle, setCalendarTitle] = React.useState('');
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [selectedEvent, setSelectedEvent] = React.useState(null); 
  
  const [eventsData, setEventsData] = React.useState([]); 
  const [calendarEvents, setCalendarEvents] = React.useState([]); 

  const getEventColors = (category) => {
    const isDark = theme.palette.mode === 'dark';
    switch(category?.toLowerCase()) {
      case 'hackathon': return { bg: isDark ? 'rgba(253, 224, 71, 0.15)' : '#fef08a', text: isDark ? '#fde047' : '#854d0e', border: isDark ? 'rgba(253, 224, 71, 0.3)' : 'transparent' };
      case 'conference': return { bg: isDark ? 'rgba(52, 211, 153, 0.15)' : '#bbf7d0', text: isDark ? '#6ee7b7' : '#14532d', border: isDark ? 'rgba(52, 211, 153, 0.3)' : 'transparent' };
      case 'workshop': return { bg: isDark ? 'rgba(96, 165, 250, 0.15)' : '#bfdbfe', text: isDark ? '#93c5fd' : '#1e3a8a', border: isDark ? 'rgba(96, 165, 250, 0.3)' : 'transparent' };
      case 'seminar': return { bg: isDark ? 'rgba(167, 139, 250, 0.15)' : '#ddd6fe', text: isDark ? '#c4b5fd' : '#4c1d95', border: isDark ? 'rgba(167, 139, 250, 0.3)' : 'transparent' };
      case 'cultural': return { bg: isDark ? 'rgba(244, 114, 182, 0.15)' : '#fbcfe8', text: isDark ? '#f9a8d4' : '#831843', border: isDark ? 'rgba(244, 114, 182, 0.3)' : 'transparent' };
      default: return { bg: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6', text: theme.palette.text.primary, border: isDark ? 'rgba(255,255,255,0.2)' : 'transparent' };
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await fetchAdminEvents();
      if (typeof data === 'string' && data.startsWith('<!')) return;
      
      const validData = Array.isArray(data) ? data : [];
      setEventsData(validData);

      const mappedEvents = validData.map(ev => {
        const colors = getEventColors(ev.category);
        return {
          id: ev._id,
          title: ev.title,
          start: ev.startDate, 
          end: ev.endDate,    
          backgroundColor: colors.bg,
          textColor: colors.text,
          borderColor: colors.border,
          extendedProps: { originalEvent: ev } 
        };
      });
      setCalendarEvents(mappedEvents);
    } catch (err) {
      console.error("Error loading events: ", err);
    }
  };

  React.useEffect(() => { fetchEvents(); }, [theme.palette.mode]); 

  const handlePrev = () => calendarRef.current.getApi().prev();
  const handleNext = () => calendarRef.current.getApi().next();
  const goToToday = () => calendarRef.current.getApi().today();
  const changeView = (viewName) => {
    calendarRef.current.getApi().changeView(viewName);
    setCurrentView(viewName);
  };
  
  const handleDatesSet = (arg) => setCalendarTitle(arg.view.title);
  
  const handleDateClick = (arg) => { 
    setSelectedEvent(null); 
    setSelectedDate(arg.dateStr); 
    setIsModalOpen(true); 
  };
  
  const handleNewEventClick = () => { 
    setSelectedEvent(null);
    setSelectedDate(new Date().toISOString().split('T')[0]); 
    setIsModalOpen(true); 
  };

  const handleEventClick = (arg) => {
    const clickedEventData = arg.event.extendedProps.originalEvent; 
    setSelectedEvent(clickedEventData);
    setSelectedDate(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const getCatCount = (cat) => eventsData.filter(e => e.category === cat).length;
  const categories = [
    { label: 'All', count: eventsData.length },
    { label: 'Hackathons', count: getCatCount('hackathon') },
    { label: 'Conferences', count: getCatCount('conference') },
    { label: 'Workshops', count: getCatCount('workshop') },
    { label: 'Seminars', count: getCatCount('seminar') },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', margin: '0 auto', p: { xs: 2, xl: 6 }, bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh', fontFamily: 'inherit' }}>
      
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.5px', color: 'text.primary' }}>Event Schedule</Typography>
          <Button startIcon={<DriveFileRenameOutlineRoundedIcon />} onClick={handleNewEventClick} sx={{ borderRadius: '16px', textTransform: 'none', fontWeight: 600, fontSize: '1rem', px: 3, py: 1.2, bgcolor: 'transparent', color: 'text.primary', '&:hover': { bgcolor: 'action.hover', transform: 'translateY(-1px)' }, transition: 'all 0.2s ease' }}>
            New Event
          </Button>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ mt: 3, flexWrap: 'wrap', gap: 1 }}>
          {categories.map((cat) => (
            <Chip key={cat.label} label={`${cat.label} (${cat.count})`} size="small" sx={{ borderRadius: '12px', fontWeight: 500, fontSize: '0.8125rem', bgcolor: 'background.paper', color: 'text.primary', border: '1px solid', borderColor: 'divider', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'action.hover' } }} />
          ))}
        </Stack>
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.paper', borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: theme.palette.mode === 'dark' ? '0 20px 40px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        
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
                <Button key={view.id} size="small" onClick={() => changeView(view.id)} startIcon={<view.icon sx={{ fontSize: 18 }} />} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, px: 2, py: 0.75, color: currentView === view.id ? 'text.primary' : 'text.secondary', bgcolor: currentView === view.id ? 'background.paper' : 'transparent', boxShadow: currentView === view.id ? '0 2px 8px rgba(0,0,0,0.15)' : 'none', '&:hover': { bgcolor: currentView === view.id ? 'background.paper' : 'action.selected', color: 'text.primary' } }}>{view.label}</Button>
              ))}
            </Stack>
          </Stack>
        </Box>

        <Box sx={{
          // Forcing Native MUI Typography colors into FullCalendar
          '--fc-page-bg-color': theme.palette.background.paper,
          '--fc-neutral-bg-color': theme.palette.background.paper,
          '--fc-neutral-text-color': theme.palette.text.primary,
          '--fc-border-color': theme.palette.divider,
          
          '& .fc': { color: 'text.primary' },
          '& .fc-toolbar': { display: 'none' },
          '& .fc-col-header-cell': { padding: '16px 0', bgcolor: 'background.paper', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' },
          '& .fc-col-header-cell-cushion': { fontSize: '0.9rem', fontWeight: '600', color: 'text.primary' },
          '& .fc-theme-standard td, & .fc-theme-standard th': { border: '1px solid', borderColor: 'divider' },
          '& .fc-daygrid-day-frame': { minHeight: '160px', padding: '8px', borderRadius: '16px', transition: 'all 0.2s ease', cursor: 'pointer' },
          '& .fc-daygrid-day-frame:hover': { backgroundColor: 'action.hover' },
          '& .fc-daygrid-day-top': { flexDirection: 'row', padding: '4px 8px' },
          '& .fc-daygrid-day-number': { fontSize: '0.9rem', fontWeight: '600', color: 'text.primary', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' },
          '& .fc-day-today .fc-daygrid-day-number': { background: theme.palette.text.primary, color: theme.palette.background.paper, fontWeight: '700' },
          '& .fc-timegrid-slot': { height: '80px !important' },
          '& .fc-timegrid-slot-label-cushion': { fontSize: '0.75rem', fontWeight: '500', color: 'text.secondary', textTransform: 'uppercase', paddingRight: '12px' },
          '& .fc-timegrid-axis-cushion': { fontSize: '0.75rem', color: 'text.secondary' },
          
          '& .fc-event': { borderRadius: '10px', padding: '8px 12px', margin: '4px 0', fontSize: '0.85rem', fontWeight: '600', border: '1px solid', boxShadow: 'none', transition: 'all 0.2s ease', cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)', zIndex: 5, boxShadow: theme.palette.mode === 'dark' ? '0 6px 16px rgba(0,0,0,0.6)' : '0 4px 12px rgba(0,0,0,0.1)' } },
          '& .fc-h-event .fc-event-main, & .fc-v-event .fc-event-main': { color: 'inherit' },
          '& .fc-event-title': { fontWeight: '700' },
          '& .fc-timegrid-now-indicator-line': { borderColor: theme.palette.error.main, borderWidth: '2px' },
          '& .fc-timegrid-now-indicator-arrow': { borderColor: theme.palette.error.main, borderWidth: '6px' },
        }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false}
            datesSet={handleDatesSet}
            events={calendarEvents} 
            dateClick={handleDateClick}
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

      <CreateEventModal 
        open={isModalOpen} 
        onClose={closeModal} 
        initialDate={selectedDate}
        existingEvent={selectedEvent} 
        refreshEvents={fetchEvents}
      />
    </Box>
  );
}