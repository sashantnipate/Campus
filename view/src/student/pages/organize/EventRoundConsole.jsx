import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  Box, Paper, Typography, Tabs, Tab, Button, Stack, Chip,
  Menu, MenuItem, Avatar, useTheme,
  CircularProgress, Divider, TextField, InputAdornment, IconButton, Tooltip,
  Snackbar, Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

// Icons
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

// Services
import { fetchEventDetails } from '../../services/studentEventService';
import { 
  getEventParticipants, 
  markAttendance, 
  qualifyStudent, 
  updateRoundStatus 
} from '../../services/studentOrgService';

// --- HELPER: LOGIC LOCK ---
const isRoundAccessible = (rounds, currentTabIndex) => {
  if (currentTabIndex === 0) return true; 
  const prevRound = rounds[currentTabIndex - 1];
  return prevRound && (prevRound.status === 'Complete' || prevRound.status === 'Completed');
};

// --- COMPONENT: CUSTOM CHECKBOX (SQUARE) ---
const CustomCheckbox = ({ checked, onClick, disabled }) => (
  <Box
    onClick={!disabled ? onClick : undefined}
    sx={{
      width: 24, 
      height: 24,
      borderRadius: '6px', 
      border: '2px solid',
      borderColor: checked ? 'success.main' : '#CFD8DC',
      bgcolor: checked ? 'success.main' : 'transparent',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.15s ease-in-out',
      '&:hover': { 
        borderColor: !disabled && !checked ? 'primary.main' : undefined,
        bgcolor: !disabled && !checked ? 'action.hover' : undefined 
      }
    }}
  >
    {checked && <CheckRoundedIcon sx={{ color: 'white', fontSize: 18, fontWeight: 900 }} />}
  </Box>
);

export default function EventRoundConsole() {
  const { eventId } = useParams();
  const location = useLocation();
  const theme = useTheme();

  // State
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentRoundTab, setCurrentRoundTab] = useState(location.state?.startTab || 0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // --- DATA LOADING ---
  const loadData = async () => {
    try {
      const [details, list] = await Promise.all([
        fetchEventDetails(eventId),
        getEventParticipants(eventId)
      ]);
      setEventData(details);
      setParticipants(list);
    } catch (error) {
      console.error("Failed to load:", error);
      setSnackbar({ open: true, message: "Sync failed", severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [eventId, currentRoundTab]);

  // --- HANDLERS (Optimistic) ---

  const handleRoundStatusUpdate = async (newStatus) => {
    setStatusMenuAnchor(null);
    try {
      await updateRoundStatus(eventId, currentRoundTab + 1, newStatus);
      const updatedRounds = [...eventData.rounds];
      updatedRounds[currentRoundTab].status = newStatus;
      setEventData({ ...eventData, rounds: updatedRounds });
    } catch (err) { setSnackbar({ open: true, message: "Update failed", severity: 'error' }); }
  };

  const toggleAttendance = async (studentId, currentStatus) => {
    const roundNum = currentRoundTab + 1;
    const newStatus = currentStatus === 'Present' ? 'Absent' : 'Present';

    setParticipants(prev => prev.map(p => p._id === studentId ? {
      ...p, roundStatus: { ...p.roundStatus, [roundNum]: { status: newStatus } }
    } : p));

    try { await markAttendance(eventId, studentId, roundNum, newStatus); } 
    catch (err) { loadData(); }
  };

  const toggleQualified = async (studentId, currentStatus) => {
    const roundNum = currentRoundTab + 1;
    const isQualified = currentStatus === 'Qualified';

    setParticipants(prev => prev.map(p => p._id === studentId ? {
      ...p, 
      roundStatus: { ...p.roundStatus, [roundNum]: { status: isQualified ? 'Present' : 'Qualified' } },
      currentRound: isQualified ? roundNum : roundNum + 1 
    } : p));

    try {
      if (isQualified) await markAttendance(eventId, studentId, roundNum, 'Present'); 
      else await qualifyStudent(eventId, studentId, roundNum + 1); 
    } catch (err) { loadData(); }
  };

  const toggleWinner = async (studentId, currentStatus) => {
    const roundNum = currentRoundTab + 1;
    const isWinner = currentStatus === 'Winner';
    const newStatus = isWinner ? 'Present' : 'Winner';

    setParticipants(prev => prev.map(p => p._id === studentId ? {
      ...p, roundStatus: { ...p.roundStatus, [roundNum]: { status: newStatus } }
    } : p));

    try { await markAttendance(eventId, studentId, roundNum, newStatus); } 
    catch (err) { loadData(); }
  };

  // --- GRID CONFIGURATION ---

  const currentRound = eventData?.rounds?.[currentRoundTab];
  const isRoundLive = currentRound?.status === 'Live';
  const isLastRound = eventData?.rounds && currentRoundTab === eventData.rounds.length - 1;
  const isLocked = !isRoundAccessible(eventData?.rounds || [], currentRoundTab);

  // 1. Prepare Rows (FIXED FILTERING LOGIC)
  const rows = useMemo(() => {
    if (!participants || !eventData || isLocked) return [];
    const roundNum = currentRoundTab + 1;

    return participants
      .filter(p => {
        // --- STRICT FILTERING FIX ---
        // 1. If Round 1: Show everyone.
        // 2. If Round > 1: Only show students whose PREVIOUS round status is 'Qualified'.
        // This prevents 'Present' students from Round 1 appearing in Round 2.
        
        let isEligible = false;
        
        if (roundNum === 1) {
          isEligible = true;
        } else {
          const prevRoundStatus = p.roundStatus?.[roundNum - 1]?.status;
          isEligible = prevRoundStatus === 'Qualified';
        }
        
        const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.roll?.toLowerCase().includes(searchQuery.toLowerCase());
                              
        return isEligible && matchesSearch;
      })
      .map(p => ({
        id: p._id,
        avatar: p.name?.[0],
        name: p.name,
        roll: p.roll,
        status: p.roundStatus?.[roundNum]?.status || 'Pending'
      }));
  }, [participants, searchQuery, currentRoundTab, eventData, isLocked]);

  const columns = useMemo(() => [
    { 
      field: 'name', 
      headerName: 'Student Name', 
      flex: 1, 
      minWidth: 200,
      renderCell: (params) => (
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: '100%' }}>
          <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: theme.palette.primary.light, fontWeight: 700 }}>
            {params.row.avatar}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600} lineHeight={1.2}>{params.row.name}</Typography>
            <Typography variant="caption" color="text.secondary">{params.row.roll}</Typography>
          </Box>
        </Stack>
      )
    },
    { 
      field: 'statusDisplay', 
      headerName: 'Status', 
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const s = params.row.status;
        let color = 'default';
        if (s === 'Present') color = 'info';
        if (s === 'Qualified') color = 'success';
        if (s === 'Winner') color = 'warning';
        
        if(s === 'Pending' || s === 'Absent') return <Typography variant="caption" color="text.disabled">-</Typography>;
        return <Chip label={s} size="small" color={color} variant={s === 'Qualified' ? 'outlined' : 'filled'} sx={{ height: 24, fontWeight: 600 }} />;
      }
    },
    { 
      field: 'attendance', 
      headerName: 'Present', 
      width: 100, 
      headerAlign: 'center', 
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CustomCheckbox 
            checked={['Present', 'Qualified', 'Winner'].includes(params.row.status)}
            disabled={!isRoundLive || params.row.status === 'Qualified' || params.row.status === 'Winner'}
            onClick={() => toggleAttendance(params.row.id, params.row.status)}
          />
        </Box>
      )
    },
    { 
      field: 'action', 
      headerName: isLastRound ? 'Winner' : 'Qualified', 
      width: 100, 
      headerAlign: 'center', 
      align: 'center',
      renderCell: (params) => {
        const s = params.row.status;
        const isPresent = ['Present', 'Qualified', 'Winner'].includes(s);
        
        if (isLastRound) {
           const isWinner = s === 'Winner';
           return (
             <IconButton 
               onClick={() => toggleWinner(params.row.id, s)}
               disabled={!isRoundLive || !isPresent}
               sx={{ 
                 color: isWinner ? '#FFD700' : 'action.disabled',
                 transform: isWinner ? 'scale(1.2)' : 'scale(1)',
                 transition: 'all 0.2s'
               }}
             >
               <EmojiEventsRoundedIcon />
             </IconButton>
           );
        }
        
        const isQualified = s === 'Qualified';
        return (
          <IconButton 
            onClick={() => toggleQualified(params.row.id, s)}
            disabled={!isRoundLive || !isPresent}
            color={isQualified ? "primary" : "default"}
          >
            {isQualified ? <StarRoundedIcon /> : <StarBorderRoundedIcon />}
          </IconButton>
        );
      }
    }
  ], [participants, isRoundLive, isLastRound]);

  if (loading && !eventData) return <Box sx={{ p: 10, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3, height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER */}
      <Paper elevation={3} sx={{ p: 2, mb: 2, borderRadius: '16px', flexShrink: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="h6" fontWeight={700}>{currentRound?.title}</Typography>
              <Chip 
                label={currentRound?.status || "UPCOMING"} 
                color={isRoundLive ? 'success' : 'default'} 
                size="small" 
                sx={{ fontWeight: 800, borderRadius: '6px' }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {rows.length} Eligible Participants
            </Typography>
          </Box>
          <Button variant="outlined" endIcon={<SettingsRoundedIcon />} onClick={(e) => setStatusMenuAnchor(e.currentTarget)} size="small">
            Status
          </Button>
          <Menu anchorEl={statusMenuAnchor} open={Boolean(statusMenuAnchor)} onClose={() => setStatusMenuAnchor(null)}>
            <MenuItem onClick={() => handleRoundStatusUpdate('Upcoming')}>Set Upcoming</MenuItem>
            <MenuItem onClick={() => handleRoundStatusUpdate('Live')}>Go Live</MenuItem>
            <MenuItem onClick={() => handleRoundStatusUpdate('Complete')}>Mark Completed</MenuItem>
          </Menu>
        </Stack>
        <Divider sx={{ my: 1.5 }} />
        <Tabs value={currentRoundTab} onChange={(e, v) => setCurrentRoundTab(v)} variant="scrollable" sx={{ minHeight: 36 }}>
          {eventData?.rounds?.map((r, i) => <Tab key={i} label={r.title} />)}
        </Tabs>
      </Paper>

      {/* SEARCH */}
      <TextField 
        fullWidth placeholder="Search Students..." size="small"
        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2, bgcolor: 'background.paper', borderRadius: '12px', flexShrink: 0 }}
        InputProps={{ 
          startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment>,
          sx: { borderRadius: '12px' }
        }}
      />

      {/* DATA GRID */}
      <Paper sx={{ flexGrow: 1, width: '100%', overflow: 'hidden', borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
        {isLocked ? (
          <Stack alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: '#fafafa' }}>
            <BlockRoundedIcon sx={{ fontSize: 50, color: 'text.disabled', mb: 1, opacity: 0.5 }} />
            <Typography color="text.secondary" fontWeight={500}>Previous round must be Completed to unlock.</Typography>
          </Stack>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            disableColumnMenu
            hideFooter={rows.length < 100}
            density="comfortable"
            rowHeight={60}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': { 
                bgcolor: '#f5f5f5', 
                color: 'text.secondary',
                fontWeight: 700,
                borderBottom: '1px solid #e0e0e0'
              },
              '& .MuiDataGrid-row:hover': { bgcolor: '#fafafa' },
              '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f0f0' },
              '& .MuiDataGrid-cell:focus': { outline: 'none' },
            }}
          />
        )}
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}