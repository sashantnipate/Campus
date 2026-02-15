import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Grid, Box, 
  CircularProgress, Alert, Stack 
} from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import StudentCertificateCard from '../components/StudentCertificateCard';
import API from '../../services/api'; // Your axios instance

export default function MyCertificates() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        // Calls your backend controller: certificateController.getMyCertificates
        const res = await API.get('/certificates/my-certificates');
        console.log("Fetched Achievements:", res.data); // Debug log
        setAchievements(res.data);
      } catch (err) {
        console.error("Error fetching achievements:", err);
        setError("Failed to load your achievements. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header Section */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 5 }}>
        <WorkspacePremiumIcon color="primary" sx={{ fontSize: 45 }} />
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
            My Achievements
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Verified certificates from your event participations.
          </Typography>
        </Box>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }}>{error}</Alert>
      )}

      {achievements.length > 0 ? (
        <Grid container spacing={3}>
          {achievements.map((cert) => (
            <Grid item xs={12} sm={6} lg={4} key={cert._id}>
              {/* Reuse your existing Card component */}
              <StudentCertificateCard certificate={cert} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 8, p: 5, bgcolor: 'action.hover', borderRadius: '24px' }}>
          <WorkspacePremiumIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            No Achievements Yet
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Once an organizer issues a certificate for your participation, it will appear here.
          </Typography>
        </Box>
      )}
    </Container>
  );
}