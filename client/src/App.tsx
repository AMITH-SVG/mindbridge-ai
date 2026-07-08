import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public pages
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { OtpPage } from './pages/auth/OtpPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { AiChatPage } from './pages/student/AiChatPage';
import { MoodTrackerPage } from './pages/student/MoodTrackerPage';
import { StudentMentoringPage } from './pages/student/StudentMentoringPage';

// Mentor Pages
import { MentorDashboard } from './pages/mentor/MentorDashboard';
import { MentorSessionsPage } from './pages/mentor/MentorSessionsPage';
import { WellnessTrends } from './pages/mentor/WellnessTrends';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminMentors } from './pages/admin/AdminMentors';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';

// Super Admin Pages
import { SuperDashboard } from './pages/super/SuperDashboard';

// Route Guard for specific roles
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect role to their own dashboard
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'mentor' || user.role === 'counsellor') return <Navigate to="/mentor/dashboard" replace />;
    if (user.role === 'university_admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'super_admin') return <Navigate to="/super/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<OtpPage />} />

            {/* Student Dashboard Shell */}
            <Route element={<DashboardLayout />}>
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/ai-chat"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <AiChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/mood-tracker"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <MoodTrackerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/mentoring"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentMentoringPage />
                  </ProtectedRoute>
                }
              />

              {/* Mentor Dashboard Shell */}
              <Route
                path="/mentor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['mentor', 'counsellor']}>
                    <MentorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mentor/sessions"
                element={
                  <ProtectedRoute allowedRoles={['mentor', 'counsellor']}>
                    <MentorSessionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mentor/trends"
                element={
                  <ProtectedRoute allowedRoles={['mentor', 'counsellor']}>
                    <WellnessTrends />
                  </ProtectedRoute>
                }
              />

              {/* University Admin Dashboard Shell */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['university_admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedRoute allowedRoles={['university_admin']}>
                    <AdminStudents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/mentors"
                element={
                  <ProtectedRoute allowedRoles={['university_admin']}>
                    <AdminMentors />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['university_admin']}>
                    <AdminReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <ProtectedRoute allowedRoles={['university_admin']}>
                    <AdminAuditLogs />
                  </ProtectedRoute>
                }
              />

              {/* Super Admin Dashboard Shell */}
              <Route
                path="/super/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <SuperDashboard />
                  </ProtectedRoute>
                }
              />
              {/* Fallback to super admin university lists */}
              <Route
                path="/super/universities"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <SuperDashboard />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
