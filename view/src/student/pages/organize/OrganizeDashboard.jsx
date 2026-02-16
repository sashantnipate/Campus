import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// Icons
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';

// Services & Components
import { fetchMyOrgs, createOrganization, joinOrganization, fetchSoloEvents } from '../../services/studentOrgService';
import CreateEventModal from './CreateEventModal';

export default function OrganizeDashboard() {
  const navigate = useNavigate();
  
  // UI State
  const [tabIndex, setTabIndex] = React.useState(1); // Default to "My Orgs"
  const [loading, setLoading] = React.useState(true);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'info' });

  // Data State
  const [myOrgs, setMyOrgs] = React.useState([]);
  const [soloEvents, setSoloEvents] = React.useState([]);
  
  // Modal State
  const [createOrgOpen, setCreateOrgOpen] = React.useState(false);
  const [joinOrgOpen, setJoinOrgOpen] = React.useState(false);
  const [createEventModalOpen, setCreateEventModalOpen] = React.useState(false);

  // Form Inputs
  const [orgName, setOrgName] = React.useState('');
  const [joinCode, setJoinCode] = React.useState('');

  const statusColorMap = {
    Pending: '#FFEB3B',
    Approved: '#4CAF50',
    Rejected: '#F44336',
    Completed: '#2196F3'
  };

  // --- HELPERS ---
  const showSnack = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnack = () => setSnackbar({ ...snackbar, open: false });

  // --- DATA LOADING ---
  const loadData = async () => {
    try {
      setLoading(true);
      const [orgsData, soloData] = await Promise.all([
        fetchMyOrgs(),
        fetchSoloEvents()
      ]);
      setMyOrgs(orgsData || []);
      setSoloEvents(soloData || []);
    } catch (e) {
      console.error(e);
      showSnack("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  // --- HANDLERS ---
  const handleCreateOrg = async () => {
    try {
      await createOrganization({ name: orgName });
      setCreateOrgOpen(false);
      setOrgName('');
      showSnack("Organization created successfully!");
      loadData();
    } catch (e) {
      showSnack(e.response?.data?.message || "Failed to create organization", "error");
    }
  };

  const handleJoinOrg = async () => {
    try {
      await joinOrganization(joinCode);
      setJoinOrgOpen(false);
      setJoinCode('');
      showSnack("Joined organization successfully!");
      loadData();
    } catch (e) {
      showSnack(e.response?.data?.message || "Invalid code or already a member", "error");
    }
  };

  return (
    <Box sx={{ width: '100%', p: { xs: 2, md: 4 } }}>
      
      {/* --- HEADER --- */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={550}>Organizer Portal</Typography>
          <Typography variant="body2" color="text.secondary">Manage your communities and events</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<GroupsRoundedIcon />} onClick={() => setJoinOrgOpen(true)} sx={{ borderRadius: '8px', fontWeight: 600 }}>
            Join Code
          </Button>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreateOrgOpen(true)} sx={{ borderRadius: '8px', fontWeight: 600 }}>
            Create Org
          </Button>
        </Stack>
      </Stack>

      {/* --- TABS --- */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} aria-label="dashboard tabs">
          <Tab icon={<PersonRoundedIcon />} iconPosition="start" label="My Events" sx={{ fontWeight: 500, minHeight: 48 }} />
          <Tab icon={<GroupsRoundedIcon />} iconPosition="start" label="My Organizations" sx={{ fontWeight: 500, minHeight: 48 }} />
        </Tabs>
      </Box>

      {/* --- CONTENT AREA --- */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* TAB 0: SOLO EVENTS */}
          {tabIndex === 0 && (
            <Grid container spacing={3}>
              {/* Create New Card */}
              <Grid item xs={12} md={6} lg={4}>
                <Button 
                   fullWidth 
                   variant="outlined" 
                   sx={{ 
                     height: '100%', minHeight: 180, 
                     borderRadius: '16px', 
                     borderStyle: 'dashed', borderWidth: 2, 
                     display: 'flex', flexDirection: 'column', gap: 1,
                     color: 'text.secondary',
                     borderColor: 'divider',
                     '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                   }}
                   onClick={() => setCreateEventModalOpen(true)}
                >
                   <AddRoundedIcon sx={{ fontSize: 40 }} />
                   <Typography fontWeight={600}>Create Solo Event</Typography>
                </Button>
              </Grid>

              {/* List Events */}
              {soloEvents.map((ev) => (
                <Grid item xs={12} md={6} lg={4} key={ev._id}>
                  <Card sx={{ borderRadius: '16px', border: '3px solid', borderColor: 'divider', boxShadow: 'none', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: "#f9f9f9" }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Chip
                        label={ev.status}
                        size="small"
                        sx={{
                          mb: 1,
                          fontWeight: 700,
                          borderRadius: '6px',
                          bgcolor: statusColorMap[ev.status] || 'grey',
                          color: '#000000 !important',
                          border: 'none',
                          '& .MuiChip-label': {
                            color: '#000000 !important'
                          }
                        }}
                      />
                      <Typography variant="h6" fontWeight={700} gutterBottom>{ev.title}</Typography>
                      
                      <Stack direction="row" spacing={1} alignItems="center" color="text.secondary" sx={{ mb: 2 }}>
                        <CalendarMonthRoundedIcon fontSize="small" />
                        <Typography variant="body2">{new Date(ev.startDate).toLocaleDateString()}</Typography>
                      </Stack>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button 
                        fullWidth variant="contained" 
                        onClick={() => navigate(`/student/organize/event/${ev._id}`)}
                        sx={{ borderRadius: '8px', fontWeight: 600 }}
                      >
                        Manage Event
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* TAB 1: ORGANIZATIONS */}
          {tabIndex === 1 && (
            <Grid container spacing={3}>
              {myOrgs.length === 0 ? (
                <Box sx={{ width: '100%', textAlign: 'center', p: 5, color: 'text.secondary' }}>
                   <Typography>No organizations found. Join or Create one to get started.</Typography>
                </Box>
              ) : (
                myOrgs.map((org) => (
                  <Grid item xs={12} md={6} lg={4} key={org.id || org._id}>
                    <Card sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight={700}>{org.name}</Typography>
                        
                        <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 2 }}>
                          <Chip label={org.role || 'Member'} size="small" color="primary" sx={{ fontWeight: 700 }} />
                          <Typography variant="caption" sx={{ alignSelf:'center' }}>{org.members || 1} Members</Typography>
                        </Stack>
                        
                        <Box sx={{ bgcolor: 'action.hover', p: 1, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                           <Typography variant="caption" fontFamily="monospace" fontWeight={700} sx={{ color: 'text.primary' }}>
                             {org.code || org.joinCode}
                           </Typography>
                           <IconButton size="small" onClick={() => { navigator.clipboard.writeText(org.code || org.joinCode); showSnack("Code copied!"); }}>
                             <ContentCopyRoundedIcon fontSize="small"/>
                           </IconButton>
                        </Box>
                        
                        <Button 
                          fullWidth 
                          variant="contained" 
                          startIcon={<SettingsRoundedIcon />}
                          onClick={() => navigate(`/student/organize/org/${org.id || org._id}`)}
                          sx={{ borderRadius: '8px', fontWeight: 600, bgcolor: 'text.primary', color: 'background.paper', '&:hover': { bgcolor: 'text.secondary' } }}
                        >
                          Manage Org
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </>
      )}

      {/* --- MODALS --- */}

      {/* 1. Create Organization Modal */}
      <Dialog open={createOrgOpen} onClose={() => setCreateOrgOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Create Organization</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Organization Name" fullWidth variant="outlined" value={orgName} onChange={(e) => setOrgName(e.target.value)} sx={{padding:1, marginTop:2,}}/>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOrgOpen(false)}>Cancel</Button>
          <Button 
              variant="contained" 
              onClick={handleCreateOrg} 
              disabled={!orgName}
              sx={{ 
                color: '#FFFFFF !important', // Adding !important ensures it overrides theme defaults
                fontWeight: 'bold' 
              }}
           >Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* 2. Join Organization Modal */}
      <Dialog open={joinOrgOpen} onClose={() => setJoinOrgOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Join Organization</DialogTitle>
        <DialogContent >
          <TextField 
            autoFocus margin="dense"  fullWidth variant="outlined" 
            placeholder="e.g. GDS-1234"
            value={joinCode} onChange={(e) => setJoinCode(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><VpnKeyRoundedIcon /></InputAdornment> }} 
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setJoinOrgOpen(false)}>Cancel</Button>
          <Button 
  variant="contained" 
  onClick={handleJoinOrg} 
  disabled={!joinCode}
  sx={{ 
    color: '#ffffff',
    '&.Mui-disabled': {
      color: '#ffffff'        // Optional: makes it look faded instead of gray
    }
  }}
>
  Join
</Button>
        </DialogActions>
      </Dialog>

      {/* 3. Create Event Modal (SOLO MODE) */}
      {/* We pass orgId={null} to signal this is a Solo Event */}
      <CreateEventModal 
        open={createEventModalOpen} 
        onClose={() => setCreateEventModalOpen(false)} 
        orgId={null} 
        onSuccess={() => { loadData(); showSnack("Event created successfully!"); }}
      />

      {/* --- SNACKBAR ALERT --- */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnack} severity={snackbar.severity} sx={{ width: '100%', borderRadius: '8px', fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}