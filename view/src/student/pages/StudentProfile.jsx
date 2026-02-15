import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { 
  Box, Paper, Typography, Button, Avatar, Stack, TextField, Grid, 
  MenuItem, IconButton, CircularProgress, Alert, Snackbar 
} from '@mui/material';

// Icons
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';

// Service Import
import { fetchUserProfile, updateUserProfile } from '../services/userService';

// Helper Component for Labels
const FieldLabel = ({ label }) => (
  <Typography 
    variant="caption" 
    sx={{ 
      fontWeight: 600, color: 'text.secondary', mb: 0.5, 
      display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' 
    }}
  >
    {label}
  </Typography>
);

export default function StudentProfile() {
  const theme = useTheme();
  const fileInputRef = useRef(null); // Reference for hidden input
  
  // --- States ---
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profileImage: '',
    rollNumber: '',
    department: '',
    course: '',
    yearOfStudy: ''
  });

  // --- 1. Fetch Data from Backend ---
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const userId = storedUser?.id || storedUser?._id;

        if (!userId) throw new Error("No user ID found.");

        const user = await fetchUserProfile(userId);

        setFormData({
          name: user.name || '',
          email: user.email || '',
          profileImage: user.profileImage || '',
          rollNumber: user.studentProfile?.rollNumber || '',
          department: user.studentProfile?.department || '',
          course: user.studentProfile?.course || '',
          yearOfStudy: user.studentProfile?.yearOfStudy || '',
        });
      } catch (err) {
        setNotification({ open: true, message: "Failed to load profile.", severity: "error" });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // --- 2. Handlers ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- NEW: Handle Image Upload ---
  const handleImageClick = () => {
    fileInputRef.current.click(); // Trigger hidden input
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Convert file to Base64 string for easy storage/preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const userId = storedUser?.id || storedUser?._id;

      const payload = {
        name: formData.name,
        profileImage: formData.profileImage, // Sends the Base64 string
        studentProfile: {
          rollNumber: formData.rollNumber,
          department: formData.department,
          course: formData.course,
          yearOfStudy: formData.yearOfStudy
        }
      };

      await updateUserProfile(userId, payload);

      setNotification({ open: true, message: "Profile updated successfully!", severity: "success" });
      setIsEditing(false);

      const updatedLocalStorage = { ...storedUser, name: formData.name, profileImage: formData.profileImage };
      localStorage.setItem('user', JSON.stringify(updatedLocalStorage));

    } catch (err) {
      setNotification({ open: true, message: "Update failed (Image might be too large).", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  // --- Styles ---
  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      bgcolor: isEditing ? 'transparent' : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F9FAFB'),
      '& fieldset': { borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : '#E0E0E0' },
      '&:hover fieldset': { borderColor: isEditing ? theme.palette.primary.main : '#E0E0E0' },
      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
      '& input': { py: 1.5, fontWeight: 500 }
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ width: '100%', maxWidth: '1000px', mx: 'auto', p: { xs: 2, md: 4 } }}>
      
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
            <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.5px' }}>Student Profile</Typography>
            <Typography variant="body2" color="text.secondary">Manage your academic details</Typography>
        </Box>
        {!isEditing && (
          <Button 
            variant="contained" startIcon={<EditRoundedIcon />} onClick={() => setIsEditing(true)}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
          >
            Edit Profile
          </Button>
        )}
      </Stack>

      {/* MAIN CARD */}
      <Paper elevation={0} sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ p: { xs: 3, md: 5 } }}>
          <Grid container spacing={5}>
            
            {/* AVATAR */}
            <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar 
                  src={formData.profileImage} 
                  sx={{ width: 140, height: 140, fontSize: '3rem', bgcolor: 'primary.light', color: 'primary.main' }}
                >
                  {formData.name.charAt(0)}
                </Avatar>
                
                {/* HIDDEN INPUT FOR FILE UPLOAD */}
                <input 
                    type="file" 
                    hidden 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                />

                <IconButton 
                  disabled={!isEditing}
                  onClick={handleImageClick} // Triggers the hidden input
                  sx={{
                    position: 'absolute', bottom: 5, right: 5, bgcolor: 'background.paper', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', opacity: isEditing ? 1 : 0, transition: '0.2s',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                >
                  <CameraAltRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Grid>

            {/* FORM */}
            <Grid item xs={12} md={9}>
              <Grid container spacing={3}>
                
                {/* Personal Info */}
                <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary" fontWeight={700} mb={2}>BASIC INFO</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <FieldLabel label="Full Name" />
                            <TextField fullWidth name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} sx={inputStyle} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FieldLabel label="Email" />
                            <TextField fullWidth value={formData.email} disabled sx={inputStyle} InputProps={{ startAdornment: <EmailRoundedIcon sx={{ mr: 1, color: 'text.disabled', fontSize: 20 }} /> }} />
                        </Grid>
                    </Grid>
                </Grid>

                {/* Academic Info */}
                <Grid item xs={12} sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" color="primary" fontWeight={700} mb={2}>ACADEMIC DETAILS</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <FieldLabel label="Roll Number" />
                            <TextField fullWidth name="rollNumber" value={formData.rollNumber} onChange={handleChange} disabled={!isEditing} sx={inputStyle} InputProps={{ startAdornment: <BadgeRoundedIcon sx={{ mr: 1, color: 'text.disabled', fontSize: 20 }} /> }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FieldLabel label="Year of Study" />
                            <TextField select fullWidth name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange} disabled={!isEditing} sx={inputStyle}>
                                <MenuItem value="1">1st Year</MenuItem>
                                <MenuItem value="2">2nd Year</MenuItem>
                                <MenuItem value="3">3rd Year</MenuItem>
                                <MenuItem value="4">4th Year</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FieldLabel label="Course / Degree" />
                            <TextField fullWidth name="course" value={formData.course} onChange={handleChange} disabled={!isEditing} sx={inputStyle} InputProps={{ startAdornment: <SchoolRoundedIcon sx={{ mr: 1, color: 'text.disabled', fontSize: 20 }} /> }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FieldLabel label="Department" />
                            <TextField fullWidth name="department" value={formData.department} onChange={handleChange} disabled={!isEditing} sx={inputStyle} />
                        </Grid>
                    </Grid>
                </Grid>

              </Grid>
            </Grid>
          </Grid>
        </Box>

        {/* ACTIONS */}
        {isEditing && (
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end', gap: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
            <Button variant="outlined" onClick={() => setIsEditing(false)} disabled={saving} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
            <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 4 }}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        )}
      </Paper>

      {/* SNACKBAR */}
      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({ ...notification, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={notification.severity} variant="filled" sx={{ width: '100%', borderRadius: '10px' }}>{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
}