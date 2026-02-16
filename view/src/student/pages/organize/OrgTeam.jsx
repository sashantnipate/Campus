import * as React from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
import { fetchOrgMembers } from '../../services/studentOrgService';

export default function OrgTeam() {
  const { orgId } = useParams();
  const [members, setMembers] = React.useState([]);

  React.useEffect(() => {
    const loadMembers = async () => {
      const data = await fetchOrgMembers(orgId);
      setMembers(data || []);
    };
    loadMembers();
  }, [orgId]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Team Members</Typography>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell>Member</TableCell><TableCell>Role</TableCell><TableCell>Status</TableCell><TableCell>Joined</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>No members found</Typography>
                </TableCell>
              </TableRow>
            ) : members.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={row.profileImage} sx={{ width: 32, height: 32, fontSize: 12 }}>{row.name?.[0] || '?'}</Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.email}</Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell><Chip label={row.status} size="small" color="success" /></TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {row.joinedAt ? new Date(row.joinedAt).toLocaleDateString() : '—'}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}