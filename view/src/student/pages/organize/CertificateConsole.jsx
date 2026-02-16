import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, Typography, TextField, Button, MenuItem, 
  Paper, Table, TableBody, TableCell, TableHead, TableRow,
  Alert, Stack, CircularProgress, Chip, IconButton, Tooltip, Dialog, DialogContent
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import API from '../../../services/api';

const TAG_OPTIONS = ['Participation', 'Excellence', 'Collaboration', 'Winner', 'Runner Up', 'Special Mention'];

export default function CertificateConsole() {
  const { eventId } = useParams();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  
  // Preview State
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '', templateId: '', assignedForRound: '', tag: 'Participation'
  });

  const fetchTemplates = async () => {
    try {
      const res = await API.get(`/certificates/templates/${eventId}`);
      setTemplates(res.data);
    } catch (err) { console.error("Failed to load templates"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTemplates(); }, [eventId]);

  const handleCreate = async () => {
    if (!formData.name || !formData.templateId || !formData.assignedForRound) return alert("Fill all fields");
    try {
      await API.post(`/certificates/template/${eventId}`, formData);
      setFormData({ name: '', templateId: '', assignedForRound: '', tag: 'Participation' });
      fetchTemplates();
    } catch (err) { alert("Error creating mapping"); }
  };

  // --- NEW: DELETE FUNCTION ---
  const handleDelete = async (id) => {
    if(!window.confirm("Delete this template mapping?")) return;
    try {
        await API.delete(`/certificates/template/${id}`);
        fetchTemplates();
    } catch (err) { alert("Delete failed"); }
  };

  // --- NEW: PREVIEW FUNCTION ---
  const handlePreview = async (templateId) => {
    setPreviewLoading(true);
    try {
        const res = await API.post('/certificates/preview', { templateId });
        setPreviewUrl(res.data.url); // Open Modal with image
    } catch (err) {
        alert("Preview failed. Is the Template ID correct?");
    } finally {
        setPreviewLoading(false);
    }
  };

  const handleIssue = async () => {
    if (!window.confirm("This will upgrade certificates for students who moved to higher rounds. Continue?")) return;
    setIssuing(true);
    try {
      const res = await API.post(`/certificates/issue/${eventId}`);
      alert(res.data.message);
    } catch (err) { alert("Issuance failed."); } 
    finally { setIssuing(false); }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1000, margin: '0 auto' }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>Certificate Console</Typography>
      
      {/* FORM SECTION (Same as before) */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: '12px' }} elevation={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
           {/* ... Inputs for Name and Template ID ... */}
           <TextField label="Template Name" fullWidth value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
           <TextField label="Template ID" fullWidth value={formData.templateId} onChange={(e) => setFormData({...formData, templateId: e.target.value})} />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <TextField label="Round #" type="number" sx={{ width: { md: 200 } }} value={formData.assignedForRound} onChange={(e) => setFormData({...formData, assignedForRound: e.target.value})} />
            <TextField select label="Tag" fullWidth value={formData.tag} onChange={(e) => setFormData({...formData, tag: e.target.value})} >
                {TAG_OPTIONS.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
            <Button variant="contained" onClick={handleCreate} startIcon={<AddCircleOutlineIcon />}>Add</Button>
        </Stack>
      </Paper>

      {/* LIST SECTION WITH ACTIONS */}
      <Paper sx={{ borderRadius: '12px', overflow: 'hidden', mb: 4 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell><strong>Round</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Tag</strong></TableCell>
              <TableCell><strong>Template ID</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map((t) => (
              <TableRow key={t._id}>
                <TableCell><Chip label={`Round ${t.assignedForRound}`} color="primary" size="small"/></TableCell>
                <TableCell>{t.name}</TableCell>
                <TableCell><Chip label={t.tag} variant="outlined" size="small"/></TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{t.templateId}</TableCell>
                <TableCell align="right">
                    <Tooltip title="Preview Design">
                        <IconButton onClick={() => handlePreview(t.templateId)} disabled={previewLoading} color="info">
                            <VisibilityRoundedIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Mapping">
                        <IconButton onClick={() => handleDelete(t._id)} color="error">
                            <DeleteOutlineRoundedIcon />
                        </IconButton>
                    </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Box sx={{ textAlign: 'right' }}>
        <Button 
          variant="contained" color="success" size="large"
          disabled={issuing || templates.length === 0}
          startIcon={issuing ? <CircularProgress size={20} color="inherit"/> : <SendIcon />}
          onClick={handleIssue}
          sx={{ py: 2, px: 6, borderRadius: '50px' }}
        >
          {issuing ? "Processing..." : "Sync & Issue Certificates"}
        </Button>
      </Box>

      {/* PREVIEW MODAL */}
      <Dialog open={!!previewUrl} onClose={() => setPreviewUrl(null)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0, overflow: 'hidden', bgcolor: '#e0e0e0', display: 'flex', justifyContent: 'center' }}>
            {previewUrl && <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '80vh' }} />}
        </DialogContent>
      </Dialog>
    </Box>
  );
}