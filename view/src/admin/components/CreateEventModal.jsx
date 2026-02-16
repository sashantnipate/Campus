import * as React from 'react';
import { useTheme } from '@mui/material/styles';
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

// MUI Date Pickers
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

// MUI Icons
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import PublishRoundedIcon from '@mui/icons-material/PublishRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

// API
import { createAdminEvent, updateAdminEvent } from '../services/adminEventService';

const DEFAULT_FORM = { title: "", category: "hackathon", department: "", location: "", description: "", startDate: null, endDate: null, maxSeats: 0 };

const FieldWrapper = ({ label, required, children, fullWidth = false }) => (
  <Box sx={{ gridColumn: fullWidth ? '1 / -1' : 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.85rem', ml: 0.5 }}>
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </Typography>
    {children}
  </Box>
);

export default function CreateEventModal({ open, onClose, initialDate, existingEvent, refreshEvents }) {
  const theme = useTheme();
  
  const [formData, setFormData] = React.useState(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [editMode, setEditMode] = React.useState(true);
  const [posterFile, setPosterFile] = React.useState(null);
  const [posterPreview, setPosterPreview] = React.useState("");
  const [hasRounds, setHasRounds] = React.useState(false);
  const [rounds, setRounds] = React.useState([{ roundNumber: 1, title: "", description: "", startDate: null, endDate: null }]);

  React.useEffect(() => {
    if (open) {
      if (existingEvent) {
        setEditMode(false); 
        setFormData({
          title: existingEvent.title || "",
          category: existingEvent.category || "hackathon",
          department: existingEvent.department || "",
          location: existingEvent.location || "",
          description: existingEvent.description || "",
          startDate: existingEvent.startDate ? new Date(existingEvent.startDate) : null,
          endDate: existingEvent.endDate ? new Date(existingEvent.endDate) : null,
          maxSeats: existingEvent.maxSeats || 0,
        });
        setPosterPreview(existingEvent.posterUrl || "");
        
        if (existingEvent.rounds && existingEvent.rounds.length > 0) {
          setHasRounds(true);
          setRounds(existingEvent.rounds.map(r => ({ ...r, startDate: r.startDate ? new Date(r.startDate) : null, endDate: r.endDate ? new Date(r.endDate) : null })));
        } else {
          setHasRounds(false);
        }
      } else if (initialDate) {
        setEditMode(true);
        const parsedDate = new Date(initialDate);
        setFormData({ ...DEFAULT_FORM, startDate: parsedDate, endDate: parsedDate });
      } else {
        setEditMode(true);
        setFormData(DEFAULT_FORM);
      }
    } else {
      setFormData(DEFAULT_FORM);
      setPosterFile(null);
      setPosterPreview("");
      setHasRounds(false);
      setRounds([{ roundNumber: 1, title: "", description: "", startDate: null, endDate: null }]);
      setEditMode(true);
    }
  }, [open, existingEvent, initialDate]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file)); 
  };

  const removePoster = () => { setPosterFile(null); setPosterPreview(""); };
  const addRound = () => setRounds(prev => [...prev, { roundNumber: prev.length + 1, title: "", description: "", startDate: null, endDate: null }]);
  const updateRound = (index, field, value) => setRounds(prev => { const copy = [...prev]; copy[index] = { ...copy[index], [field]: value }; return copy; });
  const removeRound = (index) => setRounds(prev => { if (prev.length === 1) return prev; return prev.filter((_, i) => i !== index).map((r, i) => ({ ...r, roundNumber: i + 1 })); });

  const handleSubmit = async () => {
    if (formData.startDate && formData.endDate) {
      const mainStart = new Date(formData.startDate).getTime();
      const mainEnd = new Date(formData.endDate).getTime();
      if (mainStart >= mainEnd) return alert("End Date must be after Start Date.");
      if (hasRounds) {
        for (let i = 0; i < rounds.length; i++) {
          const r = rounds[i];
          if (!r.startDate || !r.endDate) return alert(`Fill in dates for Round ${r.roundNumber}.`);
          const rStart = new Date(r.startDate).getTime();
          const rEnd = new Date(r.endDate).getTime();
          if (rStart >= rEnd) return alert(`Round ${r.roundNumber} End Date must be after Start Date.`);
          if (rStart < mainStart || rEnd > mainEnd) return alert(`Round ${r.roundNumber} timings must fall within main event.`);
        }
      }
    }

    setIsSubmitting(true);
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('department', formData.department);
    formDataToSend.append('location', formData.location);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('maxSeats', Number(formData.maxSeats));
    
    if (formData.startDate) formDataToSend.append('startDate', formData.startDate.toISOString());
    if (formData.endDate) formDataToSend.append('endDate', formData.endDate.toISOString());
    if (posterFile) formDataToSend.append('poster', posterFile);

    if (hasRounds) {
      const formattedRounds = rounds.map(r => ({ ...r, startDate: r.startDate ? r.startDate.toISOString() : null, endDate: r.endDate ? r.endDate.toISOString() : null }));
      formDataToSend.append('rounds', JSON.stringify(formattedRounds));
    }

    try {
      if (existingEvent) {
        await updateAdminEvent(existingEvent._id, formDataToSend);
      } else {
        await createAdminEvent(formDataToSend);
      }
      refreshEvents(); 
      onClose();
    } catch (err) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    '& .MuiInputBase-input': { color: 'text.primary' }, 
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      backgroundColor: editMode ? 'background.default' : 'background.paper',
      '& fieldset': { borderColor: 'divider', borderWidth: '1px', top: 0 },
      '& legend': { display: 'none' }, 
      '&:hover fieldset': { borderColor: editMode ? 'text.secondary' : 'divider' },
      '&.Mui-focused fieldset': { borderColor: '#2563eb', borderWidth: '1px' },
      '&.Mui-disabled': { WebkitTextFillColor: theme.palette.text.primary }
    },
    '& .MuiInputLabel-root': { display: 'none' }, 
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} onClose={!isSubmitting ? onClose : undefined} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: '24px', bgcolor: 'background.paper', backgroundImage: 'none', boxShadow: 24 } }}
      >
        <DialogTitle sx={{ m: 0, p: 4, pb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 700, letterSpacing: '-0.5px', color: 'text.primary' }}>
            {existingEvent ? (editMode ? "Edit Event" : "Event Details") : "Create New Event"}
          </Typography>
          <IconButton onClick={onClose} disabled={isSubmitting} sx={{ color: 'text.secondary', bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' }}}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 4, borderColor: 'divider' }}>
          
          <Box sx={{ mb: 5, display: 'flex', justifyContent: 'center' }}>
            {posterPreview ? (
              <Box sx={{ position: 'relative', width: '100%', height: 260, borderRadius: '16px', overflow: 'hidden', bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                <Box component="img" src={posterPreview} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {editMode && (
                  <IconButton onClick={removePoster} sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', '&:hover': { bgcolor: '#ef4444' }, backdropFilter: 'blur(4px)' }}>
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ) : (
              editMode && (
                <Button component="label" sx={{ width: '100%', height: 180, borderRadius: '16px', border: '2px dashed', borderColor: 'divider', color: 'text.secondary', display: 'flex', flexDirection: 'column', gap: 1, textTransform: 'none', bgcolor: 'background.default', '&:hover': { bgcolor: 'action.hover' } }}>
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                  <ImageRoundedIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                  <Typography variant="body1" fontWeight={500}>Click to select Poster / Banner</Typography>
                </Button>
              )
            )}
          </Box>

          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <FieldWrapper label="Event Title" required fullWidth>
              <TextField disabled={!editMode} sx={inputStyle} name="title" value={formData.title} onChange={handleChange} />
            </FieldWrapper>
            
            <FieldWrapper label="Category">
              <TextField disabled={!editMode} sx={inputStyle} select name="category" value={formData.category} onChange={handleChange}>
                <MenuItem value="hackathon">Hackathon</MenuItem>
                <MenuItem value="conference">Conference</MenuItem>
                <MenuItem value="workshop">Workshop</MenuItem>
                <MenuItem value="seminar">Seminar</MenuItem>
                <MenuItem value="cultural">Cultural</MenuItem>
              </TextField>
            </FieldWrapper>
            
            <FieldWrapper label="Department">
              <TextField disabled={!editMode} sx={inputStyle} name="department" value={formData.department} onChange={handleChange} />
            </FieldWrapper>
            
            <FieldWrapper label="Start Date & Time" required>
              <DateTimePicker disabled={!editMode} value={formData.startDate} onChange={(val) => setFormData(prev => ({ ...prev, startDate: val }))} renderInput={(params) => <TextField {...params} sx={inputStyle} />} />
            </FieldWrapper>
            
            <FieldWrapper label="End Date & Time" required>
              <DateTimePicker disabled={!editMode} value={formData.endDate} onChange={(val) => setFormData(prev => ({ ...prev, endDate: val }))} renderInput={(params) => <TextField {...params} sx={inputStyle} />} />
            </FieldWrapper>
            
           <FieldWrapper label="Location / Venue">
              <TextField 
                disabled={!editMode} 
                name="location" 
                value={formData.location} 
                onChange={handleChange} 
                multiline
                minRows={1}
                maxRows={4} // Box grows up to 4 lines, then scrolls
                sx={{
                  ...inputStyle,
                  '& .MuiOutlinedInput-root': {
                    ...inputStyle['& .MuiOutlinedInput-root'], // Keeps your colors and border-radius
                    height: 'auto',       // Forces the outer box to grow with the text
                    padding: '12px 14px', // Pushes the border away from the text
                    alignItems: 'flex-start' 
                  },
                  '& .MuiInputBase-inputMultiline': {
                    overflowY: 'auto !important', // Ensures the scrollbar stays inside the box
                  }
                }} 
              />
            </FieldWrapper>
            
            <FieldWrapper label="Max Seats (0 for unlimited)">
              <TextField disabled={!editMode} sx={inputStyle} type="number" name="maxSeats" value={formData.maxSeats} onChange={handleChange} />
            </FieldWrapper>
            
            {/* Forced rows={8} to make the description box large and clean */}
            <FieldWrapper label="Description" fullWidth>
              <TextField 
                disabled={!editMode} 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                multiline 
                minRows={4} // Starts at 4 lines tall
                maxRows={8} // Box grows up to 8 lines, then scrolls
                sx={{
                  ...inputStyle,
                  '& .MuiOutlinedInput-root': {
                    ...inputStyle['& .MuiOutlinedInput-root'], 
                    height: 'auto',
                    padding: '12px 14px',
                    alignItems: 'flex-start'
                  },
                  '& .MuiInputBase-inputMultiline': {
                    overflowY: 'auto !important',
                  }
                }} 
              />
            </FieldWrapper>
          </Box>

          <Box sx={{ mt: 5, p: 4, bgcolor: 'background.default', borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: hasRounds ? 4 : 0 }}>
              <FormControlLabel control={<Switch disabled={!editMode} checked={hasRounds} onChange={(e) => setHasRounds(e.target.checked)} color="primary" />} label={<Typography fontWeight={600} color="text.primary">Multi-Round Event Structure</Typography>} />
              {(hasRounds && editMode) && <Button size="small" startIcon={<AddRoundedIcon />} onClick={addRound} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, color: 'text.primary', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', px: 2 }}>Add Round</Button>}
            </Box>
            {hasRounds && (
              <Stack spacing={4}>
                {rounds.map((round, index) => (
                  <Box key={index} sx={{ p: 3, borderRadius: '16px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', position: 'relative' }}>
                    <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 800, color: 'text.secondary', letterSpacing: '0.5px' }}>ROUND {round.roundNumber}</Typography>
                    {(rounds.length > 1 && editMode) && <IconButton size="small" onClick={() => removeRound(index)} sx={{ position: 'absolute', top: 16, right: 16, color: 'text.secondary', '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' } }}><CloseRoundedIcon fontSize="small"/></IconButton>}
                    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                      <FieldWrapper label="Round Title" fullWidth>
                        <TextField disabled={!editMode} sx={inputStyle} value={round.title} onChange={e => updateRound(index, 'title', e.target.value)} />
                      </FieldWrapper>
                      
                      {/* Forced rows={6} to make the instructions box appropriately large */}
                      <FieldWrapper label="Instructions / Description" fullWidth>
                        <TextField disabled={!editMode} sx={inputStyle} multiline rows={6} value={round.description} onChange={e => updateRound(index, 'description', e.target.value)} />
                      </FieldWrapper>
                      
                      <FieldWrapper label="Start Time">
                        <DateTimePicker disabled={!editMode} value={round.startDate} onChange={(val) => updateRound(index, 'startDate', val)} renderInput={(params) => <TextField {...params} sx={inputStyle} />} />
                      </FieldWrapper>
                      
                      <FieldWrapper label="End Time">
                        <DateTimePicker disabled={!editMode} value={round.endDate} onChange={(val) => updateRound(index, 'endDate', val)} renderInput={(params) => <TextField {...params} sx={inputStyle} />} />
                      </FieldWrapper>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 4, pt: 3 }}>
          <Button onClick={onClose} disabled={isSubmitting} sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'none', borderRadius: '10px', px: 3, fontSize: '1rem' }}>
            {editMode ? "Cancel" : "Close"}
          </Button>
          
          {existingEvent && !editMode ? (
            <Button onClick={() => setEditMode(true)} variant="contained" startIcon={<EditRoundedIcon />} sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: '1rem', px: 4, py: 1.2, boxShadow: 'none', '&:hover': { bgcolor: 'text.secondary' } }}>
              Edit Event
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting || !formData.title || !formData.startDate || !formData.endDate} variant="contained" startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : (existingEvent ? <SaveRoundedIcon /> : <PublishRoundedIcon />)} sx={{ bgcolor: '#2563eb', color: '#ffffff', borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: '1rem', px: 4, py: 1.2, boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)', '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' } }}>
              {isSubmitting ? "Saving..." : (existingEvent ? "Update Event" : "Publish Event")}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}