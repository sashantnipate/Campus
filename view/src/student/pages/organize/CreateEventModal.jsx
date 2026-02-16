import * as React from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';

// MUI Date Pickers
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

// Icons
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

// Service
import { createEvent, updateEvent } from '../../services/studentOrgService';

const CATEGORIES = [
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'conference', label: 'Conference' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'sports', label: 'Sports' },
  { value: 'competition', label: 'Competition' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'others', label: 'Others' }
];

const DEFAULT_FORM = {
  title: '',
  description: '',
  category: 'workshop',
  department: 'General',
  location: '',
  startDate: null,
  endDate: null,
  maxSeats: 0,
  posterUrl: ''
};

// Minimalist Field Wrapper
const FieldWrapper = ({ label, required, children, fullWidth = false }) => (
  <Box
    sx={{
      gridColumn: fullWidth ? '1 / -1' : 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 0.8,
      width: '100%',
      minWidth: 0, // Allows the grid item to be smaller than its content
      overflow: 'hidden' // Trap any internal floating elements
    }}
  >
    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', ml: 0.5, letterSpacing: '0.02em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </Typography>
    {children}
  </Box>
);


export default function CreateEventModal({ open, onClose, orgId, onSuccess, existingEvent }) {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(false);
  
  const [formData, setFormData] = React.useState(DEFAULT_FORM);
  const [posterPreview, setPosterPreview] = React.useState("");
  const [posterFile, setPosterFile] = React.useState(null);
  
  const [hasRounds, setHasRounds] = React.useState(false);
  const [rounds, setRounds] = React.useState([
    { roundNumber: 1, title: 'Round 1', description: '', startDate: null, endDate: null }
  ]);

  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'info' });

  // --- HYDRATION ---
  React.useEffect(() => {
    if (open) {
      if (existingEvent) {
        setFormData({
          title: existingEvent.title || '',
          description: existingEvent.description || '',
          category: (existingEvent.category || 'workshop')?.toString().toLowerCase(),
          department: existingEvent.department || 'General',
          location: existingEvent.location || '',
          startDate: existingEvent.startDate ? new Date(existingEvent.startDate) : null,
          endDate: existingEvent.endDate ? new Date(existingEvent.endDate) : null,
          maxSeats: existingEvent.maxSeats || 0,
          posterUrl: existingEvent.posterUrl || ''
        });
        setPosterPreview(existingEvent.posterUrl || '');
        setPosterFile(null);

        if (existingEvent.rounds && existingEvent.rounds.length > 0) {
          setHasRounds(true);
          setRounds(existingEvent.rounds.map(r => ({
            ...r,
            startDate: r.startDate ? new Date(r.startDate) : null,
            endDate: r.endDate ? new Date(r.endDate) : null
          })));
        } else {
          setHasRounds(false);
          setRounds([{ roundNumber: 1, title: 'Round 1', description: '', startDate: null, endDate: null }]);
        }
      } else {
        setFormData(DEFAULT_FORM);
        setPosterPreview("");
        setPosterFile(null);
        setHasRounds(false);
        setRounds([{ roundNumber: 1, title: 'Round 1', description: '', startDate: null, endDate: null }]);
      }
    }
  }, [open, existingEvent]);

  // --- HANDLERS ---
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
  const showNotification = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const handleAddRound = () => {
    setRounds([...rounds, { roundNumber: rounds.length + 1, title: `Round ${rounds.length + 1}`, description: '', startDate: null, endDate: null }]);
  };

  const handleRemoveRound = (index) => {
    if (rounds.length === 1) return;
    const newRounds = rounds.filter((_, i) => i !== index).map((r, i) => ({ ...r, roundNumber: i + 1 }));
    setRounds(newRounds);
  };

  const handleRoundChange = (index, field, value) => {
    const updated = [...rounds];
    updated[index][field] = value;
    setRounds(updated);
  };

  // --- SUBMIT (FIXED LOGIC) ---
  const handleSubmit = async () => {
    if (!formData.title || !formData.startDate || !formData.endDate || !formData.description) {
      showNotification("Please fill in all required fields.", "error");
      return;
    }

    setLoading(true);
    try {
      // 1. Prepare JSON Payload (NOT FormData)
      // This works with `const payload = { ...eventData, userId }` in your service
      const eventPayload = {
        title: formData.title,
        description: formData.description,
        category: formData.category, // Matches dropdown value exactly
        department: formData.department,
        location: formData.location,
        maxSeats: formData.maxSeats,
        startDate: formData.startDate?.toISOString(),
        endDate: formData.endDate?.toISOString(),
        posterUrl: formData.posterUrl, // Preserve existing URL if editing
        rounds: hasRounds ? rounds.map(r => ({
            ...r,
            startDate: r.startDate?.toISOString(),
            endDate: r.endDate?.toISOString()
        })) : []
      };

      let eventId = existingEvent?._id;

      // 2. Create or Update the Event (Text Data)
      if (existingEvent) {
        // If editing, we might need FormData if image changed, but let's stick to JSON first
        // Note: Your updateEvent service handles FormData, but let's see logic below
        // If strict about not changing service, we assume updateEvent handles JSON too or we skip to image
        // For existingEvent, usually updateEvent is robust.
        // But to be safe, let's treat the Update identically to Create logic: Text first, then Image.
        
        // However, updateEvent in your service specifically sets 'multipart/form-data'. 
        // So we MUST send FormData to updateEvent. 
        const updateData = new FormData();
        Object.keys(eventPayload).forEach(key => {
            if (key === 'rounds') updateData.append(key, JSON.stringify(eventPayload[key]));
            else updateData.append(key, eventPayload[key]);
        });
        if (posterFile) updateData.append('poster', posterFile);
        
        await updateEvent(eventId, updateData);
        showNotification("Event updated successfully!", "success");

      } else {
        // CREATE NEW: Send JSON First
        const response = await createEvent(eventPayload, orgId);
        eventId = response._id || response.id; // Capture the new ID
        
        // 3. Upload Image (If exists) using updateEvent
        // We do this because createEvent API service breaks with FormData
        if (posterFile && eventId) {
            const imageFormData = new FormData();
            imageFormData.append('poster', posterFile);
            
            // Call updateEvent just for the image
            await updateEvent(eventId, imageFormData);
        }
        showNotification("Event published successfully!", "success");
      }
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);

    } catch (error) {
      console.error("Submission Error:", error);
      showNotification("Failed: " + (error.response?.data?.message || error.message), "error");
    } finally {
      setLoading(false);
    }
  };

  // --- STYLING CONSTANTS ---
  const cleanInputStyle = {
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: alpha(theme.palette.background.paper, 0.8),
    alignItems: 'flex-start', // Fixes the "weird starting position" for multiline
    '& fieldset': { 
      borderColor: alpha(theme.palette.divider, 0.4),
    },
    '&:hover fieldset': { 
      borderColor: alpha(theme.palette.text.primary, 0.2) 
    },
    '&.Mui-focused fieldset': { 
      borderColor: theme.palette.primary.main,
      borderWidth: '1.5px' 
    },
  },
  '& .MuiInputBase-input': {
    fontSize: '0.95rem',
    fontWeight: 500,
    padding: '12px !important', // Ensures consistent padding
  },
  '& .MuiInputBase-multiline': {
    padding: '0px', // Prevents double padding on multiline containers
  }
};

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        scroll="paper"
        open={open} 
        onClose={!loading ? onClose : undefined} 
        maxWidth="md" 
        fullWidth 
        PaperProps={{ 
          sx: { 
            borderRadius: '24px', 
            boxShadow: '0 24px 80px -12px rgba(0,0,0,0.08)',
            bgcolor: 'background.default',
            backgroundImage: 'none'
          } 
        }}
      >
        {/* HEADER */}
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 4, py: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={600} sx={{ letterSpacing: '-0.5px' }}>
              {existingEvent ? "Edit Event" : "Create New Event"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {existingEvent ? "Update the details below." : "Share a new opportunity with your community."}
            </Typography>
          </Box>
          <IconButton onClick={onClose} disabled={loading} size="small" sx={{ bgcolor: 'action.hover' }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        
        <Divider sx={{ opacity: 0.5 }} />

        <DialogContent sx={{ p: 4 }}>
          <Stack spacing={4}>
            
            {/* POSTER UPLOAD */}
            <Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Cover Image
              </Typography>
              
              {posterPreview ? (
                <Box sx={{ 
                  position: 'relative', width: '100%', height: 220, borderRadius: '16px', 
                  overflow: 'hidden', border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                }}>
                  <img src={posterPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <Button 
                    variant="contained" color="inherit" size="small"
                    startIcon={<DeleteOutlineRoundedIcon />} 
                    onClick={() => { setPosterPreview(""); setPosterFile(null); }}
                    sx={{ 
                      position: 'absolute', top: 12, right: 12, 
                      bgcolor: 'rgba(255,255,255,0.9)', color: 'text.primary',
                      backdropFilter: 'blur(4px)',
                      '&:hover': { bgcolor: '#fff', color: 'error.main' }
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              ) : (
                <Button component="label" sx={{ 
                  width: '100%', height: 140, borderRadius: '16px', 
                  border: `1px dashed ${alpha(theme.palette.text.secondary, 0.3)}`, 
                  display: 'flex', flexDirection: 'column', gap: 1, textTransform: 'none', 
                  bgcolor: alpha(theme.palette.background.paper, 0.4),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04), borderColor: 'primary.main', color: 'primary.main' }
                }}>
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                  <CloudUploadRoundedIcon sx={{ fontSize: 32, opacity: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    Drop your image here or <Box component="span" color="primary.main" fontWeight={600}>browse</Box>
                  </Typography>
                </Button>
              )}
            </Box>

            {/* FORM GRID */}
            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <FieldWrapper label="Event Title" required fullWidth>
                <TextField 
                 name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  placeholder="e.g. Annual Tech Symposium" 
                  sx={{ 
                    ...cleanInputStyle, 
                    width: '100%',
                    '& .MuiInputBase-input': {
                      height: '1.5em',      // Set a fixed height
                      padding: '12px 14px', // Equal vertical padding
                      display: 'flex',
                      alignItems: 'center', // Centers text vertically
                    },
                    // If you are using a specific height on the whole box:
                    '& .MuiOutlinedInput-root': {
                       display: 'flex',
                       alignItems: 'center',
                    }
                  }} 
                />
              </FieldWrapper>

              <FieldWrapper label="Category">
                <TextField select name="category" value={formData.category} onChange={handleChange} 
                      sx={{cleanInputStyle,'& .MuiInputBase-input': {
                            height: '1.5em',      // Set a fixed height
                            padding: '12px 14px', // Equal vertical padding
                            display: 'flex',
                            alignItems: 'center', // Centers text vertically
                          },
                          // If you are using a specific height on the whole box:
                          '& .MuiOutlinedInput-root': {
                             display: 'flex',
                             alignItems: 'center',
                          }}}>
                        {CATEGORIES.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                </TextField>
              </FieldWrapper>

              <FieldWrapper label="Department">
                <TextField name="department" value={formData.department} onChange={handleChange} 
                sx={{...cleanInputStyle, '& .MuiInputBase-input': {
                      height: '1.5em',      // Set a fixed height
                      padding: '12px 14px', // Equal vertical padding
                      display: 'flex',
                      alignItems: 'center', // Centers text vertically
                    },
                    // If you are using a specific height on the whole box:
                    '& .MuiOutlinedInput-root': {
                       display: 'flex',
                       alignItems: 'center',
                    }}} />
              </FieldWrapper>

              <FieldWrapper label="Starts" required>
                <DateTimePicker 
                  value={formData.startDate} 
                  onChange={(val) => setFormData(prev => ({ ...prev, startDate: val }))} 
                  slotProps={{ textField: { sx: cleanInputStyle, fullWidth: true } }} 
                />
              </FieldWrapper>

              <FieldWrapper label="Ends" required>
                <DateTimePicker 
                  value={formData.endDate} 
                  onChange={(val) => setFormData(prev => ({ ...prev, endDate: val }))} 
                  slotProps={{ textField: { sx: cleanInputStyle, fullWidth: true } }} 
                />
              </FieldWrapper>

              <FieldWrapper label="Location">
                <TextField name="location" value={formData.location} onChange={handleChange} 
                sx={{...cleanInputStyle, '& .MuiInputBase-input': {
                      height: '1.5em',      // Set a fixed height
                      padding: '12px 14px', // Equal vertical padding
                      display: 'flex',
                      alignItems: 'center', // Centers text vertically
                    },
                    // If you are using a specific height on the whole box:
                    '& .MuiOutlinedInput-root': {
                       display: 'flex',
                       alignItems: 'center',
                    }}} placeholder="e.g. Auditorium A" />
              </FieldWrapper>

              <FieldWrapper label="Max Seats">
                <TextField type="number" name="maxSeats" value={formData.maxSeats} onChange={handleChange} 
                sx={{...cleanInputStyle, '& .MuiInputBase-input': {
                      height: '1.5em',      // Set a fixed height
                      padding: '12px 14px', // Equal vertical padding
                      display: 'flex',
                      alignItems: 'center', // Centers text vertically
                    },
                    // If you are using a specific height on the whole box:
                    '& .MuiOutlinedInput-root': {
                       display: 'flex',
                       alignItems: 'center',
                    }}} 
                    placeholder="0 for unlimited" />
              </FieldWrapper>

            <FieldWrapper label="Description" required fullWidth>
                  <TextField 
                    multiline 
                    minRows={7} 
                    maxRows={15}
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    placeholder="What is this event about?" 
                    sx={{ 
                      ...cleanInputStyle, 
                      // This override fixes the overflow by allowing the box to grow
                      '& .MuiInputBase-input': {
                        height: 'auto !important', 
                        padding: '4px 6px', // Smaller vertical padding for multiline looks better
                        overflow: 'auto',   // Enables scrollbar if it hits maxRows
                      },
                      '& .MuiOutlinedInput-root': {
                       height: 'auto',     // Allows the container to expand with the text
                        alignItems: 'flex-start', // Starts text at the top instead of centering
                        padding: '12px 14px',
                     }
                    }} 
                  />
                  </FieldWrapper>
            </Box>

            {/* ROUNDS SECTION */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <FormControlLabel 
                  control={<Switch checked={hasRounds} onChange={(e) => setHasRounds(e.target.checked)} />} 
                  label={<Typography fontSize="0.95rem" fontWeight={500}>Enable Multi-Stage Rounds</Typography>} 
                />
                {hasRounds && (
                  <Button size="small" startIcon={<AddCircleOutlineRoundedIcon />} onClick={handleAddRound} sx={{ fontWeight: 600 }}>
                    Add Stage
                  </Button>
                )}
              </Stack>

              {hasRounds && (
                <Stack spacing={2}>
                  {rounds.map((round, index) => (
                    <Paper key={index} elevation={3} sx={{ 
                      p: 2.5, borderRadius: '16px', border: `1px solid ${alpha(theme.palette.divider, 0.6)}`, bgcolor: 'background.paper' 
                    }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight={700} color="primary">Stage {round.roundNumber}</Typography>
                        {rounds.length > 1 && (
                          <IconButton size="small" color="error" onClick={() => handleRemoveRound(index)}>
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                      <Stack spacing={2}>
                        <TextField size="small" placeholder="Stage Title" value={round.title} onChange={(e) => handleRoundChange(index, 'title', e.target.value)} 
                        sx={{...cleanInputStyle,bgcolor: 'background.paper',
                            '& .MuiInputBase-input': {height: 'auto !important', 
                                        padding: '4px 6px', // Smaller vertical padding for multiline looks better
                                        overflow: 'auto',
                                        
                                      },
                            '& .MuiOutlinedInput-root': {
                             height: 'auto',     // Allows the container to expand with the text
                              alignItems: 'flex-start', // Starts text at the top instead of centering
                              padding: '12px 14px',
                           }}} fullWidth />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                           <DateTimePicker label="Starts" value={round.startDate} onChange={(val) => handleRoundChange(index, 'startDate', val)} slotProps={{ textField: { size: 'small', sx: cleanInputStyle, fullWidth: true } }} />
                           <DateTimePicker label="Ends" value={round.endDate} onChange={(val) => handleRoundChange(index, 'endDate', val)} slotProps={{ textField: { size: 'small', sx: cleanInputStyle, fullWidth: true } }} />
                        </Stack>
                        <TextField size="small" placeholder="Instructions..." value={round.description} onChange={(e) => handleRoundChange(index, 'description', e.target.value)} 
                        sx={{...cleanInputStyle,
                            '& .MuiInputBase-input': {height: 'auto !important', 
                                        padding: '4px 6px', // Smaller vertical padding for multiline looks better
                                        overflow: 'auto',
                                      },
                            '& .MuiOutlinedInput-root': {
                             height: 'auto',     // Allows the container to expand with the text
                              alignItems: 'flex-start', // Starts text at the top instead of centering
                              padding: '12px 14px',
                           }}} fullWidth multiline rows={1} />
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </DialogContent>
        
        <Divider sx={{ opacity: 0.5 }} />

        <DialogActions sx={{ p: 3, bgcolor: 'background.default' }}>
          <Button onClick={onClose} disabled={loading} sx={{ color: 'text.secondary', fontWeight: 600, borderRadius: '10px', px: 3 }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            disabled={loading} 
            disableElevation
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{ 
              borderRadius: '10px', px: 4, py: 1, fontWeight: 600, textTransform: 'none', 
              fontSize: '0.95rem', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } 
            }}
          >
            {loading ? "Saving..." : (existingEvent ? "Save Changes" : "Publish Event")}
          </Button>
        </DialogActions>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', fontWeight: 500, borderRadius: '12px' }} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>

      </Dialog>
    </LocalizationProvider>
  );
}