import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Stack, Alert, IconButton } from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';

// API Service
import API from '../../../services/api'; 

export default function CertificateDesigner() {
  const { eventId } = useParams(); 
  const EMBED_ID = "cbf2ad86-171c-4dd6-9662-270003fb76c2"; // Replace with real ID
  
  const [templateId, setTemplateId] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false); // State for Full Screen

  const handleSaveConfig = async () => {
     try {
        await API.put(`/events/${eventId}/certificate-config`, { templateId });
        alert("Certificate linked successfully!");
    } catch (err) {
        alert("Error saving configuration");
    }
  };

  const embedUrl = EMBED_ID ? `https://app.templated.io/editor?embed=${EMBED_ID}` : "";

  // --- STYLES FOR FULL SCREEN ---
  const containerStyles = isFullScreen ? {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999, // Sit on top of everything
      bgcolor: 'background.default',
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 2
  } : {
      // Normal Dashboard View
      height: 'calc(100vh - 140px)', // Fills remaining dashboard height
      display: 'flex', 
      flexDirection: 'column', 
      gap: 2 
  };

  return (
    <Box sx={containerStyles}>
      
      {/* HEADER BAR */}
      <Paper sx={{ p: 1, bgcolor: 'primary.lighter', flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>Design Studio</Typography>
            {!isFullScreen && (
                <Typography variant="caption" color="text.secondary">
                Copy the ID from the editor after saving.
                </Typography>
            )}
          </Box>
          
          {/* Full Screen Toggle */}
          <Button 
            startIcon={isFullScreen ? <FullscreenExitRoundedIcon /> : <FullscreenRoundedIcon />}
            onClick={() => setIsFullScreen(!isFullScreen)}
            size="small"
            sx={{ textTransform: 'none' }}
          >
            {isFullScreen ? "Exit Full Screen" : "Full Screen"}
          </Button>

          <TextField 
            size="small" 
            placeholder="Paste Template ID" 
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            sx={{ bgcolor: 'white', width: 200 }}
          />
          <Button 
            variant="contained" 
            size="small"
            onClick={handleSaveConfig}
            disabled={!templateId}
          >
            Save Link
          </Button>
        </Stack>
      </Paper>

      {/* THE EDITOR FRAME */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          border: '1px solid', 
          borderColor: 'divider', 
          borderRadius: '8px', 
          overflow: 'hidden',
          bgcolor: '#f5f5f5',
          boxShadow: isFullScreen ? 3 : 0
        }}
      >
        {embedUrl ? (
            <iframe
                src={embedUrl}
                title="Certificate Editor"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                allow="clipboard-write"
            />
        ) : (
            <Box sx={{ p: 5, textAlign: 'center' }}>Configure Embed ID in code</Box>
        )}
      </Box>

      {/* CHEATSHEET (Hidden in Full Screen to save space, or keep it small) */}
      {!isFullScreen && (
          <Alert severity="info" sx={{ py: 0, px: 2 }}>
            <Typography variant="caption">
                <b>Variables:</b> 
                {' '}<code style={{background:'#eee'}}>{"{{student_name}}"}</code>
                {' '}<code style={{background:'#eee'}}>{"{{event_title}}"}</code>
                {' '}<code style={{background:'#eee'}}>{"{{issue_date}}"}</code>
                {' '}<code style={{background:'#eee'}}>{"{{qr_image}}"}</code>
            </Typography>
          </Alert>
      )}
    </Box>
  );
}