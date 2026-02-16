import * as React from 'react';
import { 
  Box, Card, CardHeader, IconButton, Chip, Tooltip, Switch, 
  Avatar, LinearProgress 
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Import Service
import { fetchAllStudents, toggleStudentVerify, deleteStudent } from '../services/userService';

export default function StudentsDataGrid() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // --- 1. Fetch Data ---
  React.useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await fetchAllStudents();
      // Map data to flat structure for DataGrid
      const formattedData = data.map((s) => ({
        id: s._id,
        name: s.name,
        email: s.email,
        rollNumber: s.studentProfile?.rollNumber || 'N/A',
        department: s.studentProfile?.department || 'N/A',
        year: s.studentProfile?.yearOfStudy || 'N/A',
        course: s.studentProfile?.course || 'N/A',
        isVerified: s.isVerified,
        profileImage: s.profileImage
      }));
      setRows(formattedData);
    } catch (error) {
      console.error("Failed to fetch students", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Handlers ---
  const handleToggleVerify = async (id) => {
    // Optimistic Update
    setRows((prev) => prev.map(row => 
      row.id === id ? { ...row, isVerified: !row.isVerified } : row
    ));

    try {
      await toggleStudentVerify(id);
    } catch (error) {
      console.error("Verify toggle failed", error);
      loadStudents(); // Revert on error
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this student?")) {
      try {
        await deleteStudent(id);
        setRows((prev) => prev.filter((row) => row.id !== id));
      } catch (error) {
        alert("Failed to delete student");
      }
    }
  };

  // --- 3. Columns Definition ---
  const columns = [
    { 
      field: 'avatar', 
      headerName: '', 
      width: 60, 
      sortable: false, 
      filterable: false,
      align: 'center', // Horizontally centers the Avatar column
      renderCell: (params) => (
        // Wrapper ensures absolute vertical & horizontal centering
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Avatar src={params.row.profileImage} sx={{ width: 30, height: 30, fontSize: '0.8rem' }}>
              {params.row.name?.charAt(0)} 
          </Avatar>
        </Box>
      )
    },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 200 },
    { field: 'rollNumber', headerName: 'Roll No', width: 120 },
    { field: 'department', headerName: 'Dept', width: 120 },
    { field: 'year', headerName: 'Year', width: 80, type: 'singleSelect', valueOptions: ['1', '2', '3', '4'] },
    { 
      field: 'isVerified', 
      headerName: 'Verified', 
      width: 120, 
      type: 'boolean',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Tooltip title="Toggle Verification">
              <Switch 
                  checked={params.value} 
                  onChange={() => handleToggleVerify(params.row.id)}
                  color="success"
                  size="small"
              />
          </Tooltip>
        </Box>
      )
    },
    { 
      field: 'statusDisplay',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.row.isVerified ? 
            <Chip icon={<CheckCircleIcon/>} label="Verified" size="small" color="success" variant="outlined" /> :
            <Chip icon={<CancelIcon/>} label="Unverified" size="small" color="default" variant="outlined" />
          }
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      align: 'center', // Horizontally centers the delete button
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Tooltip title="Delete Student">
            <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];
  return (
    <Card variant="outlined">
      <CardHeader 
        title="Student Directory" 
        subheader="Manage student verification and accounts" 
      />
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          slots={{ toolbar: GridToolbar }} // Adds Search, Filter, Export buttons automatically
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{ border: 0 }}
        />
      </Box>
    </Card>
  );
}