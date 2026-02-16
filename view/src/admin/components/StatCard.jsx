import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { areaElementClasses } from '@mui/x-charts/LineChart';
import Grow from '@mui/material/Grow';

function AreaGradient({ color, id }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

export default function StatCard({ title, value, interval, trend, data, delay = 0 }) {
  const theme = useTheme();
  const daysInWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const trendColors = {
    up: theme.palette.success.main,
    down: theme.palette.error.main,
    neutral: theme.palette.grey[400],
  };

  const labelColor = trend === 'up' ? 'success' : trend === 'down' ? 'error' : 'default';

  return (
    <Grow in={true} timeout={1000} style={{ transitionDelay: `${delay}ms` }}>
      <Card variant="outlined" sx={{ height: '100%', flexGrow: 1 }}>
        <CardContent>
          <Typography component="h2" variant="subtitle2" gutterBottom sx={{color: 'text.secondary'}}>
            {title}
          </Typography>
          <Stack
            direction="column"
            justifyContent="space-between"
            sx={{ flexGrow: 1, gap: 1 }}
          >
            <Stack sx={{ justifyContent: 'space-between' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" component="p">
                  {value}
                </Typography>
                <Chip size="small" color={labelColor} label={trend === 'up' ? '+25%' : '-5%'} />
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {interval}
              </Typography>
            </Stack>
            <Box sx={{ width: '100%', height: 50 }}>
              <SparkLineChart
                colors={[trendColors[trend]]}
                data={data}
                area
                showHighlight
                showTooltip
                xAxis={{
                  scaleType: 'point',
                  data: daysInWeek,
                }}
                sx={{
                  [`& .${areaElementClasses.root}`]: {
                    fill: `url(#area-gradient-${value})`,
                  },
                }}
              >
                <AreaGradient color={trendColors[trend]} id={`area-gradient-${value}`} />
              </SparkLineChart>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
}