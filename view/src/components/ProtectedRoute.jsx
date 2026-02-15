import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  
  // FIX: Get the role and force it to lowercase immediately
  // This converts "Student" -> "student"
  const rawRole = localStorage.getItem('role');
  const userRole = rawRole ? rawRole.toLowerCase() : null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Now we compare "student" with ["student"] -> It will match!
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    
    // Redirect logic if the role doesn't match
    if (userRole === 'student') return <Navigate to="/dashboard" replace />;
    if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
    
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;