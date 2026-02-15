import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, Typography, TextField, Button, MenuItem, 
  Paper, Table, TableBody, TableCell, TableHead, TableRow,
  Alert, Stack, CircularProgress, Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import API from '../../../services/api';

const TAG_OPTIONS = ['Participation', 'Excellence', 'Collaboration', 'Winner', 'Runner Up', 'Special Mention'];

export default function CertificateConsole() {
  const { eventId } = useParams();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    templateId: '',
    assignedForRound: '',
    tag: 'Participation'
  });

  // 1. Load Existing Mappings
  const fetchTemplates = async () => {
    try {
      const res = await API.get(`/certificates/templates/${eventId}`);
      setTemplates(res.data);
    } catch (err) {
      console.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, [eventId]);

  // 2. Handle Create Mapping
  const handleCreate = async () => {
    if (!formData.name || !formData.templateId || !formData.assignedForRound) {
      return alert("Please fill in all fields");
    }
    try {
      await API.post(`/certificates/template/${eventId}`, formData);
      alert("Template Mapping Created!");
      setFormData({ name: '', templateId: '', assignedForRound: '', tag: 'Participation' }); // Reset
      fetchTemplates(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || "Error creating mapping");
    }
  };

  // 3. Handle Bulk Issue
  const handleIssue = async () => {
    if (!window.confirm("This will generate and email certificates to all eligible students. Continue?")) return;
    
    setIssuing(true);
    try {
      const res = await API.post(`/certificates/issue/${eventId}`);
      alert(res.data.message);
    } catch (err) {
      alert("Issuance failed. Check console for details.");
    } finally {
      setIssuing(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1000, margin: '0 auto' }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>Certificate Console</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Configure which template goes to which round, then issue them in bulk.
      </Typography>

      {/* --- FORM SECTION --- */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: '12px' }} elevation={3}>
        <Typography variant="h6" fontWeight={700} gutterBottom>Add New Template Mapping</Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <TextField 
            label="Template Name" 
            placeholder="e.g. Round 1 Participation" 
            fullWidth 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <TextField 
            label="Template ID (from Templated.io)" 
            fullWidth 
            value={formData.templateId}
            onChange={(e) => setFormData({...formData, templateId: e.target.value})}
          />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <TextField 
            label="Assign to Round #" 
            type="number"
            sx={{ width: { md: 200 } }}
            value={formData.assignedForRound}
            onChange={(e) => setFormData({...formData, assignedForRound: e.target.value})}
          />
          <TextField 
            select 
            label="Certificate Tag" 
            fullWidth
            value={formData.tag}
            onChange={(e) => setFormData({...formData, tag: e.target.value})}
          >
            {TAG_OPTIONS.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </TextField>
          <Button 
            variant="contained" 
            size="large" 
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleCreate}
            sx={{ px: 4 }}
          >
            Add
          </Button>
        </Stack>
      </Paper>

      {/* --- LIST SECTION --- */}
      <Paper sx={{ borderRadius: '12px', overflow: 'hidden', mb: 4 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell><strong>Round</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Tag</strong></TableCell>
              <TableCell><strong>Template ID</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center">No mappings configured yet.</TableCell></TableRow>
            ) : (
              templates.map((t) => (
                <TableRow key={t._id}>
                  <TableCell><Chip label={`Round ${t.assignedForRound}`} color="primary" size="small"/></TableCell>
                  <TableCell>{t.name}</TableCell>
                  <TableCell><Chip label={t.tag} variant="outlined" size="small"/></TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{t.templateId}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* --- ACTION SECTION --- */}
      <Box sx={{ textAlign: 'right' }}>
        <Button 
          variant="contained" 
          color="success" 
          size="large"
          disabled={issuing || templates.length === 0}
          startIcon={issuing ? <CircularProgress size={20} color="inherit"/> : <SendIcon />}
          onClick={handleIssue}
          sx={{ py: 2, px: 6, borderRadius: '50px', fontWeight: 'bold', fontSize: '1.1rem' }}
        >
          {issuing ? "Processing..." : "Issue All Certificates"}
        </Button>
        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
          Checks every student's attendance and assigns the highest matching round certificate.
        </Typography>
      </Box>
    </Box>
  );
}