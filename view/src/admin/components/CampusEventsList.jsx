import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';

// Define table columns
const columns = [
  { field: 'title', headerName: 'Event Name', flex: 1.5 },
  { field: 'category', headerName: 'Category', flex: 1 },
  { field: 'location', headerName: 'Location', flex: 1 },
  { field: 'date', headerName: 'Date', flex: 1 },
  { 
    field: 'status', 
    headerName: 'Status', 
    width: 120,
    renderCell: (params) => {
        const color = params.value === 'Live' ? 'success' : 'primary';
        return <Chip label={params.value} color={color} size="small" variant="outlined" />;
    }
  },
];

// Dummy Data
const rows = [
  { id: 1, title: 'Hackathon 2024', category: 'Tech', location: 'Main Auditorium', date: '2024-05-10', status: 'Upcoming' },
  { id: 2, title: 'Art Workshop', category: 'Cultural', location: 'Room 302', date: '2024-05-12', status: 'Live' },
  { id: 3, title: 'AI Seminar', category: 'Seminar', location: 'Lab 4', date: '2024-05-15', status: 'Upcoming' },
];

export default function CampusEventsList() {
  return (
    <Card variant="outlined">
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          pageSizeOptions={[5, 10]}
          disableRowSelectionOnClick
        />
      </div>
    </Card>
  );
}