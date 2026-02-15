import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

// Icons
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';

// API Service
//import { updateAdminProfile } from '../services/adminProfileService';

// --- Helper: Label above the input field ---
const FieldLabel = ({ label }) => (
  <Typography 
    variant="caption" 
    sx={{ 
      fontWeight: 600, 
      color: 'text.primary', 
      mb: 1, 
      display: 'block',
      fontSize: '0.875rem' 
    }}
  >
    {label}
  </Typography>
);

export default function AdminProfile() {
  const theme = useTheme();
  
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Load User Data
  const user = JSON.parse(localStorage.getItem('user')) || { 
    name: 'Admin User', 
    email: 'admin@system.com',
    position: 'Senior Administrator',
    department: 'IT Operations',
    avatar: ''
  };

  const [formData, setFormData] = React.useState({
    name: user.name,
    email: user.email,
    position: user.position || 'Administrator',
    department: user.department || 'Management',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Clean Input Style ---
  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: isEditing ? 'transparent' : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F9FAFB'),
      transition: 'all 0.2s ease',
      '& fieldset': { 
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : '#E0E0E0', 
      },
      '&:hover fieldset': { 
        borderColor: isEditing ? theme.palette.primary.main : '#E0E0E0' 
      },
      '&.Mui-focused fieldset': { 
        borderColor: theme.palette.primary.main, 
        borderWidth: '2px' 
      },
      '& input': {
        py: 1.5,
        fontWeight: 500,
        color: 'text.primary'
      }
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1000px', mx: 'auto', p: { xs: 2, md: 4 } }}>
      
      {/* HEADER: Title + Edit Button */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.5px' }}>
          My profile
        </Typography>

        {!isEditing && (
          <Button 
            variant="contained" 
            startIcon={<EditRoundedIcon />}
            onClick={() => setIsEditing(true)}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600, 
              borderRadius: '8px',
              bgcolor: theme.palette.primary.main,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              '&:hover': { bgcolor: theme.palette.primary.dark }
            }}
          >
            Edit Profile
          </Button>
        )}
      </Stack>

      {/* MAIN CARD */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: '16px', 
          border: '1px solid', 
          borderColor: 'divider',
          overflow: 'hidden',
          bgcolor: 'background.paper'
        }}
      >
        <Box sx={{ p: { xs: 3, md: 5 } }}>
          
          {/* Inner Header */}
          <Box sx={{ mb: 5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Personal info
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Customize how your profile information will appear to the networks.
            </Typography>
          </Box>

          <Grid container spacing={5}>
            
            {/* LEFT COLUMN: Avatar (Stacks on top on mobile xs=12) */}
            <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' } }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar 
                  sx={{ 
                    width: 140, 
                    height: 140, 
                    fontSize: '3.5rem', 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e0e0e0',
                    color: theme.palette.text.secondary,
                  }}
                  src={user.avatar} 
                >
                  {!user.avatar && formData.name.charAt(0)}
                </Avatar>
                
                {/* Camera Icon Overlay */}
                <IconButton 
                  disabled={!isEditing}
                  sx={{
                    position: 'absolute',
                    bottom: 5,
                    right: 5,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    width: 36,
                    height: 36,
                    '&:hover': { bgcolor: 'background.paper' },
                    opacity: isEditing ? 1 : 0,
                    transition: 'opacity 0.2s'
                  }}
                >
                  <CameraAltRoundedIcon sx={{ fontSize: 18, color: 'text.primary' }} />
                </IconButton>
              </Box>
            </Grid>

            {/* RIGHT COLUMN: Form Inputs (Stacks below on mobile xs=12) */}
            <Grid item xs={12} md={9}>
              <Grid container spacing={3}>
                
                {/* Full Name */}
                <Grid item xs={12} sm={6}>
                  <FieldLabel label="Name" />
                  <TextField 
                    fullWidth 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    disabled={!isEditing} 
                    sx={inputStyle}
                    placeholder="Enter full name"
                  />
                </Grid>

                {/* Role */}
                <Grid item xs={12} sm={6}>
                  <FieldLabel label="Role / Position" />
                  <TextField 
                    fullWidth 
                    name="position" 
                    value={formData.position} 
                    onChange={handleChange} 
                    disabled={!isEditing} 
                    sx={inputStyle}
                    placeholder="e.g. Senior Administrator"
                  />
                </Grid>

                {/* Department */}
                <Grid item xs={12} sm={6}>
                  <FieldLabel label="Department" />
                  <TextField 
                    fullWidth 
                    name="department" 
                    value={formData.department} 
                    onChange={handleChange} 
                    disabled={!isEditing} 
                    sx={inputStyle}
                    placeholder="e.g. IT Operations"
                  />
                </Grid>

                {/* Email (Always Disabled/Read-Only) */}
                <Grid item xs={12}>
                  <FieldLabel label="Email" />
                  <TextField 
                    fullWidth 
                    value={formData.email} 
                    disabled 
                    sx={inputStyle}
                    InputProps={{
                      startAdornment: <EmailRoundedIcon sx={{ mr: 1.5, color: 'text.disabled', fontSize: 20 }} />
                    }}
                  />
                </Grid>

              </Grid>
            </Grid>
          </Grid>
        </Box>

        {/* Footer Actions (Only visible when editing) */}
        {isEditing && (
          <Box 
            sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#F9FAFB'
            }}
          >
            <Button 
              variant="outlined" 
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              sx={{ 
                color: 'text.primary', 
                borderColor: 'divider', 
                textTransform: 'none', 
                fontWeight: 600,
                borderRadius: '8px',
                '&:hover': { borderColor: 'text.primary', bgcolor: 'transparent' }
              }}
            >
              Cancel
            </Button>
            
            <Button 
              variant="contained" 
              onClick={handleSave}
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{ 
                bgcolor: theme.palette.primary.main, 
                textTransform: 'none', 
                fontWeight: 600,
                borderRadius: '8px',
                px: 3,
                boxShadow: 'none',
                '&:hover': { bgcolor: theme.palette.primary.dark, boxShadow: 'none' }
              }}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}