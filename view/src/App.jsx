import * as React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CssBaseline from '@mui/material/CssBaseline';
import AppTheme from './theme/shared-theme/AppTheme';

// Auth
import Login from "./auth/pages/Login";
import SignUp from "./auth/pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin
import Dashboard from "./admin/Dashboard";
import MainGrid from "./admin/components/MainGrid";
import EventCalendar from "./admin/components/EventCalendar";
// Student
import StudentDashboard from "./student/StudentDashboard";
import StudentCalendar from "./student/pages/StudentCalendar";
import StudentDiscovery from "./student/pages/StudentDiscovery"; 
import MyRegistrations from "./student/pages/MyRegistrations";
import StudentEventDetails from "./student/pages/StudentEventDetails";
import StudentProfile from "./student/pages/StudentProfile";

// --- NEW IMPORTS FOR SIDECAR ARCHITECTURE ---
import MyCertificates from "./student/pages/MyCertificates"; 
import CertificateConsole from "./student/pages/organize/CertificateConsole"; 

// --- ORGANIZE IMPORTS ---
import OrganizeDashboard from "./student/pages/organize/OrganizeDashboard"; 
import OrganizationLayout from "./student/pages/organize/OrganizationLayout"; 

import OrgTeam from "./student/pages/organize/OrgTeam";
import MyEventsList from "./student/pages/organize/MyEventsList"; 
import EventManagementLayout from "./student/pages/organize/EventManagementLayout";
import EventOverview from "./student/pages/organize/EventOverview";
import EventParticipants from "./student/pages/organize/EventParticipants";
import EventRoundConsole from "./student/pages/organize/EventRoundConsole";
import AdminLogin from "./auth/pages/AdminLogin";
import AdminProfile from "./admin/components/AdminProfile";
import StudentsDataGrid from "./admin/components/StudentsDataGrid";
import VerifyCertificate from "./components/VerifyCertificate";

function App(props) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/admin-login" element={<AdminLogin/>}/>
          
          <Route path="/verify/:code" element={<VerifyCertificate/>} />

          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/student" element={<StudentDashboard />}>
              <Route index element={<Navigate to="discover" replace />} />
              <Route path="discover" element={<StudentDiscovery />} />
              <Route path="calendar" element={<StudentCalendar />} />
              <Route path="achievements" element={<MyCertificates />} />

              <Route path="organize" element={<OrganizeDashboard />} />
              <Route path="organize/org/:orgId" element={<OrganizationLayout />}>
                <Route index element={<MyEventsList />} />
                <Route path="team" element={<OrgTeam />} />
              </Route>

              <Route path="organize/event/:eventId" element={<EventManagementLayout />}>
                <Route index element={<EventOverview />} />
                <Route path="participants" element={<EventParticipants />} />
                <Route path="console" element={<EventRoundConsole />} />
                <Route path="certificates" element={<CertificateConsole />} />
              </Route>

              <Route path="registrations" element={<MyRegistrations />} />
              <Route path="event/:eventId" element={<StudentEventDetails />} />
              <Route path="profile" element={<StudentProfile />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<Dashboard />}>
               <Route index element={<Navigate to="home" replace />} />
               <Route path="home" element={<MainGrid />} /> 
               <Route path="calendar" element={<EventCalendar/>} /> 
               <Route path="profile" element={<AdminProfile />} />
               <Route path="data" element={<StudentsDataGrid />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AppTheme>
  );
}

export default App;