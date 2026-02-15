// src/student/components/StudentCertificateCard.jsx
import React from 'react';
import { Card, CardContent, Typography, Button, Stack, Chip, Avatar, Divider } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export default function StudentCertificateCard({ certificate }) {
  // Destructure the populated fields from your backend response
  const { event, templateConfig, pdfUrl, issuedAt } = certificate;

  return (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: '20px', 
        border: '1px solid', borderColor: 'divider',
        transition: 'all 0.3s',
        '&:hover': { transform: 'translateY(-5px)', boxShadow: 3, borderColor: 'primary.main' }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
          <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main' }}>
            <EmojiEventsIcon />
          </Avatar>
          <Chip 
            label={templateConfig?.tag || 'Achievement'} 
            color="success" size="small" variant="filled"
            sx={{ fontWeight: 700 }}
          />
        </Stack>

        <Typography variant="h6" fontWeight={700} sx={{ mb: 1, lineHeight: 1.3 }}>
          {event?.title || 'Event Title Unavailable'}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {templateConfig?.name || 'Certificate of Completion'}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3, color: 'text.secondary' }}>
          <CalendarTodayIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption" fontWeight={500}>
            Issued: {new Date(issuedAt).toLocaleDateString()}
          </Typography>
        </Stack>

        <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

        <Button 
          fullWidth 
          variant="contained" 
          startIcon={<DownloadIcon />}
          onClick={() => window.open(pdfUrl, '_blank')}
          sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
        >
          Download PDF
        </Button>
      </CardContent>
    </Card>
  );
}