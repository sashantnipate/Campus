import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import logoo from '../../assets/logoo.png';

// Icons
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import DashboardCustomizeRoundedIcon from '@mui/icons-material/DashboardCustomizeRounded';

// --- Custom Event Flow Logo ---
// Don't forget to ensure 'logoo' is imported at the top of this file!
// import logoo from '../../../assets/logoo.png';

function EventFlowLogo() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0}}>
      <img
        src={logoo}
        alt="EventFlow Logo"
        style={{
          height: '130px',     // Adjusted for better sidebar proportions  
          width: '80px',      
          objectFit: 'cover', 
          objectPosition: 'center', 
          display: 'block',
          borderRadius: '8px' 
        }}
      />
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          fontSize: '1.3rem',
          color: '#1b129cff',
          whiteSpace: 'nowrap',
        }}
      >
        Event Flow
      </Typography>
    </Box>
  );
}

const items = [
  {
    icon: <DashboardCustomizeRoundedIcon sx={{ color: 'text.secondary' }} />,
    title: 'Your Event Dashboard',
    description:
      'Manage everything in one place. Whether you are hosting a hackathon or attending a workshop, keep your schedule organized effortlessly.',
  },
  {
    icon: <GroupsRoundedIcon sx={{ color: 'text.secondary' }} />,
    title: 'Organize & Lead',
    description:
      'Step up as a student organizer. Create events, manage registrations, and track participant attendance with powerful admin tools.',
  },
  {
    icon: <EventAvailableRoundedIcon sx={{ color: 'text.secondary' }} />,
    title: 'Seamless Participation',
    description:
      'Never miss an update. Register for college events instantly, get live notifications, and access your entry tickets digitally.',
  },
  {
    icon: <EmojiEventsRoundedIcon sx={{ color: 'text.secondary' }} />,
    title: 'Earn & Showcase',
    description:
      'Build your portfolio. Earn digital certificates for every event you attend or organize and showcase your achievements to the world.',
  },
];

export default function Content() {
  return (
    <Stack
      sx={{ flexDirection: 'column', alignSelf: 'center', gap: 4, maxWidth: 450 }}
    >
      <Box sx={{ display: { xs: 'none', md: 'flex' }, mb: 1 }}>
        <EventFlowLogo />
      </Box>
      
      {items.map((item, index) => (
        <Stack key={index} direction="row" sx={{ gap: 2 }}>
          {item.icon}
          <div>
            <Typography gutterBottom sx={{ fontWeight: 600 }}>
              {item.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {item.description}
            </Typography>
          </div>
        </Stack>
      ))}
    </Stack>
  );
}