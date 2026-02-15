import * as React from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import { fetchOrgMembers } from '../../services/studentOrgService';

export default function OrgTeam() {
  const { orgId } = useParams();
  const [members, setMembers] = React.useState([]);

  React.useEffect(() => {
    const loadMembers = async () => {
      const data = await fetchOrgMembers(orgId);
      // Fallback mock data if backend route isn't ready yet
      setMembers(data.length > 0 ? data : [
        { id: 1, name: 'Current User', role: 'Admin', status: 'Active' }
      ]);
    };
    loadMembers();
  }, [orgId]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Team Members</Typography>
        <Button variant="contained" startIcon={<PersonAddRoundedIcon />}>Invite</Button>
      </Stack>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell>Member</TableCell><TableCell>Role</TableCell><TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, fontSize: 12 }}>{row.name[0]}</Avatar>
                    <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell><Chip label={row.status} size="small" color="success" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}