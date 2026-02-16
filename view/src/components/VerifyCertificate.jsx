import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Box, Card, CardContent, Typography, CircularProgress, 
  Stack, Divider, Button, Chip, Container 
} from '@mui/material';

// Icons
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';

// Import your API service
import API from '../services/api'; // Adjust path if necessary

export default function VerifyCertificate() {
  const { code } = useParams();
  const [loading, setLoading] = useState(true);
  const [certData, setCertData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchVerificationData = async () => {
      try {
        const res = await API.get(`/certificates/verify/${code}`);
        if (res.data.success) {
          setCertData(res.data.data);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (code) fetchVerificationData();
  }, [code]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: '#f4f6f8' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error || !certData) {
    return (
      <Container maxWidth="sm" sx={{ pt: 10 }}>
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 4, boxShadow: 3 }}>
          <CancelRoundedIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" fontWeight={800} gutterBottom>Invalid Certificate</Typography>
          <Typography color="text.secondary" paragraph>
            We could not verify this certificate. The link might be broken, or the certificate may not exist in our system.
          </Typography>
          <Button variant="contained" component={Link} to="/" sx={{ mt: 2, borderRadius: 2 }}>
            Return to Home
          </Button>
        </Card>
      </Container>
    );
  }

  const { user, event, templateConfig, pdfUrl, issuedAt } = certData;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
        <Card sx={{ borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          
          {/* TOP BANNER */}
          <Box sx={{ bgcolor: 'success.main', color: 'white', py: 4, textAlign: 'center' }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 64, mb: 1 }} />
            <Typography variant="h4" fontWeight={800} letterSpacing={1}>VERIFIED AUTHENTIC</Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Official Document Issued by Event Flow
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 3, md: 6 } }}>
            
            {/* AWARD DETAILS */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Chip 
                label={templateConfig.tag.toUpperCase()} 
                color="primary" 
                sx={{ fontWeight: 'bold', mb: 2, px: 2, py: 2.5, fontSize: '1rem', borderRadius: 2 }} 
              />
              <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
                {event.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Issued on {new Date(issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* TWO COLUMN DETAILS */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
              
              {/* Left Column: Student Details */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700}>Recipient Details</Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <PersonRoundedIcon color="action" />
                    <Typography variant="body1" fontWeight={600}>{user.name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <EmailRoundedIcon color="action" />
                    <Typography variant="body1">{user.email}</Typography>
                  </Box>
                  
                  {/* Show academic details if available */}
                  {user.studentProfile && (
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <SchoolRoundedIcon color="action" sx={{ mt: 0.5 }} />
                      <Box>
                        {user.studentProfile.rollNumber && (
                          <Typography variant="body2"><strong>Roll No:</strong> {user.studentProfile.rollNumber}</Typography>
                        )}
                        {user.studentProfile.department && (
                          <Typography variant="body2"><strong>Dept:</strong> {user.studentProfile.department}</Typography>
                        )}
                        {user.studentProfile.course && (
                          <Typography variant="body2"><strong>Course:</strong> {user.studentProfile.course}</Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                </Stack>
              </Box>

              {/* Right Column: Event Details */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700}>Event Information</Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <EventRoundedIcon color="action" />
                    <Typography variant="body1">{new Date(event.startDate).toLocaleDateString()}</Typography>
                  </Box>
                  {event.location && (
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Location:</Typography>
                      <Typography variant="body1">{event.location}</Typography>
                    </Box>
                  )}
                  {event.department && (
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Organized By:</Typography>
                      <Typography variant="body1">{event.department}</Typography>
                    </Box>
                  )}
                </Stack>
              </Box>

            </Stack>

            {/* ACTION BUTTON */}
            <Box sx={{ mt: 6, textAlign: 'center' }}>
              <Button 
                variant="outlined" 
                size="large" 
                startIcon={<PictureAsPdfRoundedIcon />}
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ borderRadius: 3, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
              >
                View Original Certificate PDF
              </Button>
            </Box>

          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}