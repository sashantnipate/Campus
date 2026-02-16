import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

// --- CHANGE THIS IMPORT ---
import { fetchDashboardEvents, updateEventStatus } from '../services/dashboardService';

export default function EventManagementTable() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filterCategory, setFilterCategory] = React.useState('All');

  React.useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // --- USE THE NEW FUNCTION NAME ---
      const data = await fetchDashboardEvents();
      
      const formattedData = data.map((event) => ({
        id: event._id || event.id,
        ...event
      }));
      setRows(formattedData);
    } catch (error) {
      console.error("Error fetching events table", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const previousRows = [...rows];
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, status: newStatus } : row))
    );

    try {
      // --- USE THE NEW FUNCTION NAME ---
      await updateEventStatus(id, newStatus);
      console.log(`Event ${id} updated to ${newStatus}`);
    } catch (error) {
      console.error("Update failed", error);
      setRows(previousRows);
      alert("Failed to update status.");
    }
  };

  // ... (Rest of your columns and return statement remains exactly the same)
  // ...
  
  // Define Table Columns (Briefly included for context)
  const columns = [
    { field: 'title', headerName: 'Event Title', flex: 1.5, minWidth: 200 },
    { field: 'category', headerName: 'Category', flex: 1, minWidth: 120 },
    { field: 'location', headerName: 'Location', flex: 1, minWidth: 120 },
    { 
      field: 'startDate', 
      headerName: 'Date', 
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => {
        if(!params.value) return '';
        return new Date(params.value).toLocaleDateString();
      }
    },
    {
      field: 'status',
      headerName: 'Status (Action)',
      flex: 1.2,
      minWidth: 160,
      renderCell: (params) => {
        const getColor = (status) => {
            if(status === 'Approved') return 'success.main';
            if(status === 'Pending') return 'warning.main';
            if(status === 'Rejected') return 'error.main';
            return 'text.secondary';
        }

        return (
          <FormControl variant="standard" fullWidth size="small" sx={{ mt: 1 }}>
            <Select
              value={params.value || 'Draft'}
              onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
              disableUnderline
              sx={{ 
                color: getColor(params.value),
                fontWeight: 'bold',
                fontSize: '0.875rem',
                px:1,py:0.3,
                alignItems: 'center',
               }}
            >
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
        );
      },
    },
  ];

  const filteredRows = filterCategory === 'All' 
    ? rows 
    : rows.filter((r) => (r.category || '').toString().toLowerCase() === filterCategory.toString().toLowerCase());

  return (
    <Card variant="outlined">
      <CardHeader
        sx={{ pb:0, marginBottom:2}}
        title="Event Management"
        subheader="Real-time campus event control"
        action={
          <FormControl size="small" sx={{ width: 150 }}>
            <InputLabel >Category</InputLabel>
            <Select
              value={filterCategory}
              label="Category"
              onChange={(e) => setFilterCategory(e.target.value)}
              sx={{width: 130, margin: 2}}
            >
              <MenuItem value="All">All Categories</MenuItem>
              <MenuItem value="Hackathon">Hackathon</MenuItem>
              <MenuItem value="Conference">Conference</MenuItem>
              <MenuItem value="Workshop">Workshop</MenuItem>
              <MenuItem value="Cultural">Cultural</MenuItem>
              <MenuItem value="Sports">Sports</MenuItem>
              <MenuItem value="Competition">Competition</MenuItem>
              <MenuItem value="Webinar">Webinar</MenuItem>
              <MenuItem value="Others">Others</MenuItem>
            </Select>
          </FormControl>
        }
      />
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
          pageSizeOptions={[5, 10]}
          disableRowSelectionOnClick
          sx={{ border: 0 }}
        />
      </Box>
    </Card>
  );
}