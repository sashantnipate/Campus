import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Stack, Alert, Card, CardContent } from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import LayersIcon from '@mui/icons-material/Layers'; // New Icon

import API from '../../../services/api'; 

export default function CertificateManager() {
  const { eventId } = useParams(); 
  const [templateId, setTemplateId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveConfig = async () => {
     setLoading(true);
     try {
        // --- FIX 1: LOGICAL ERROR RESOLVED ---
        // Instead of updating Event.config, we create a default CertificateTemplate mapping
        // We assume "Round 1" and "Participation" as defaults for this simple view
        await API.post(`/certificates/template/${eventId}`, {
            name: "Default Certificate",
            templateId: templateId,
            assignedForRound: 1, // Defaulting to Round 1
            tag: "Participation"
        });
        
        alert("Certificate linked successfully! (Mapped to Round 1)");
    } catch (err) {
        alert("Error saving configuration: " + (err.response?.data?.message || err.message));
    } finally {
        setLoading(false);
    }
  };

  const handleOpenExternalEditor = () => {
    window.open('https://app.templated.io/templates', '_blank');
  };

  return (
    <Box sx={{ maxWidth: '1000px', mx: 'auto', mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
      
      <Card variant="outlined" sx={{ borderRadius: '16px', bgcolor: 'primary.lighter', borderColor: 'primary.light' }}>
        <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
                Connect a Certificate Design
            </Typography>
            <Stack spacing={1}>
                <Typography variant="body2">1. Click <b>"Open Design Tool"</b> to go to Templated.io.</Typography>
                <Typography variant="body2">2. Create and Save your design.</Typography>
                <Typography variant="body2">3. Copy the <b>Template ID</b> and paste it below.</Typography>
            </Stack>
        </CardContent>
      </Card>

      <Paper sx={{ p: 4, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={3} alignItems="flex-start">
            <Button 
                variant="outlined" 
                size="large"
                startIcon={<OpenInNewRoundedIcon />}
                onClick={handleOpenExternalEditor}
            >
                Step 1: Open Design Tool
            </Button>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" width="100%">
                <TextField 
                    fullWidth
                    label="Step 2: Paste Template ID Here" 
                    placeholder="e.g. 83829..."
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                />
                <Button 
                    variant="contained" 
                    size="large"
                    startIcon={<SaveRoundedIcon />}
                    onClick={handleSaveConfig}
                    disabled={!templateId || loading}
                    sx={{ height: 56, px: 4 }}
                >
                    {loading ? "Saving..." : "Link Certificate"}
                </Button>
            </Stack>
        </Stack>
      </Paper>

      {/* --- FIX 2: INSTRUCTION ERROR RESOLVED --- */}
      <Alert severity="warning" icon={<LayersIcon />} sx={{ borderRadius: '12px' }}>
        <Typography variant="subtitle2" gutterBottom fontWeight={700}>
            CRITICAL: You must rename your Layers!
        </Typography>
        <Typography variant="body2" paragraph>
            Our system does not look for text like <code>{`{{name}}`}</code>. 
            It looks for the <b>Layer Name</b> in the right-hand sidebar of the editor.
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Required Layer Names:</strong>
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['student_name', 'event_title', 'issue_date', 'qr_image'].map(tag => (
                <code key={tag} style={{ 
                    backgroundColor: '#fff3e0', 
                    border: '1px solid #ffcc80',
                    color: '#e65100',
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontWeight: 'bold' 
                }}>
                    {tag}
                </code>
            ))}
        </Box>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            * Click the element in the editor, look at the "Layers" panel on the right, and rename it to match the tags above exactly.
        </Typography>
      </Alert>

    </Box>
  );
}