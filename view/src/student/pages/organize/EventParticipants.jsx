import * as React from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

// Icons
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

// Service
import { getEventParticipants } from '../../services/studentOrgService';

export default function EventParticipants() {
  const { eventId } = useParams();
  const [participants, setParticipants] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    const loadParticipants = async () => {
      if (!eventId) return;
      try {
        setLoading(true);
        // Use the new service that merges progress data
        const data = await getEventParticipants(eventId);
        setParticipants(data);
      } catch (error) {
        console.error("Error loading participants:", error);
      } finally {
        setLoading(false);
      }
    };

    loadParticipants();
  }, [eventId]);

  const filteredParticipants = participants.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.roll?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <TextField 
          size="small" 
          placeholder="Search participants..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
          sx={{ width: 300, bgcolor: 'background.paper' }}
        />
        <Button variant="contained" startIcon={<DownloadRoundedIcon />} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 500 }}>
          Export CSV
        </Button>
      </Stack>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Roll No</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Dept</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredParticipants.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                   No participants found.
                 </TableCell>
               </TableRow>
            ) : (
              filteredParticipants.map((row) => (
                <TableRow key={row._id} hover>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{row.roll || 'N/A'}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PersonRoundedIcon fontSize="small" color="action" />
                      {row.name}
                    </Stack>
                  </TableCell>
                  <TableCell>{row.department || 'General'}</TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                        <EmailRoundedIcon sx={{ fontSize: 14 }} /> {row.email}
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                        <Chip 
                          label="Registered" 
                          size="small" 
                          variant="outlined"
                          sx={{ borderRadius: '6px', fontWeight: 500 }} 
                        />
                        {row.currentRound > 1 && (
                            <Chip 
                                label={`Round ${row.currentRound}`} 
                                size="small" 
                                color="primary" 
                                sx={{ borderRadius: '6px', fontWeight: 600 }} 
                            />
                        )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}