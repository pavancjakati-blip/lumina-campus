import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/pages/LoginPage";
import AppLayout from "@/components/AppLayout";
import FacultyHome from "@/pages/faculty/FacultyHome";
import ApplyLeave from "@/pages/faculty/ApplyLeave";
import MyLeaves from "@/pages/faculty/MyLeaves";
import FacultyAttendance from "@/pages/faculty/FacultyAttendance";
import FacultyProfile from "@/pages/faculty/FacultyProfile";
import HODDashboard from "@/pages/hod/HODDashboard";
import HODLeaveRequests from "@/pages/hod/HODLeaveRequests";
import HODFacultyAttendance from "@/pages/hod/HODFacultyAttendance";
import HODReports from "@/pages/hod/HODReports";
import HODProfile from "@/pages/hod/HODProfile";
import SignupPage from "@/pages/SignupPage";
import SplashScreen from "@/components/SplashScreen";
import { AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) => {
  const token = localStorage.getItem('lumina_token');
  const facultyStr = localStorage.getItem('lumina_faculty');
  
  if (!token || !facultyStr) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    const faculty = JSON.parse(facultyStr);
    if (requiredRole && faculty.role?.toLowerCase() !== requiredRole.toLowerCase()) {
      // Redirect to correct dashboard based on actual role
      if (faculty.role?.toLowerCase() === 'hod') {
        return <Navigate to="/hod" replace />;
      } else {
        return <Navigate to="/faculty" replace />;
      }
    }
    return <>{children}</>;
  } catch {
    localStorage.removeItem('lumina_token');
    localStorage.removeItem('lumina_faculty');
    return <Navigate to="/login" replace />;
  }
};

function AppRoutes() {
  // We're no longer strictly gatekeeping by `isAuthenticated` alone to prevent 
  // flash-of-logout on Vercel SPA mobile refreshes. ProtectedRoute handles it securely.

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/register" element={<SignupPage />} />
      
      {/* Faculty Routes */}
      <Route path="/faculty/*" element={
        <ProtectedRoute requiredRole="faculty">
          <AppLayout>
            <Routes>
              <Route path="/" element={<FacultyHome />} />
              <Route path="dashboard" element={<Navigate to="/faculty" replace />} />
              <Route path="apply" element={<ApplyLeave />} />
              <Route path="leaves" element={<MyLeaves />} />
              <Route path="attendance" element={<FacultyAttendance />} />
              <Route path="profile" element={<FacultyProfile />} />
              <Route path="*" element={<Navigate to="/faculty" replace />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* HOD Routes */}
      <Route path="/hod/*" element={
        <ProtectedRoute requiredRole="hod">
          <AppLayout>
            <Routes>
              <Route path="/" element={<HODDashboard />} />
              <Route path="dashboard" element={<Navigate to="/hod" replace />} />
              <Route path="requests" element={<HODLeaveRequests />} />
              <Route path="attendance" element={<HODFacultyAttendance />} />
              <Route path="reports" element={<HODReports />} />
              <Route path="profile" element={<HODProfile />} />
              <Route path="*" element={<Navigate to="/hod" replace />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AnimatePresence>
          {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
        </AnimatePresence>
        
        {!showSplash && (
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
