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

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/register" element={<SignupPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  if (user?.role === 'faculty') {
    return (
      <AppLayout>
        <Routes>
          <Route path="/faculty" element={<FacultyHome />} />
          <Route path="/faculty/apply" element={<ApplyLeave />} />
          <Route path="/faculty/leaves" element={<MyLeaves />} />
          <Route path="/faculty/attendance" element={<FacultyAttendance />} />
          <Route path="/faculty/profile" element={<FacultyProfile />} />
          <Route path="/" element={<Navigate to="/faculty" replace />} />
          <Route path="*" element={<Navigate to="/faculty" replace />} />
        </Routes>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/hod" element={<HODDashboard />} />
        <Route path="/hod/requests" element={<HODLeaveRequests />} />
        <Route path="/hod/attendance" element={<HODFacultyAttendance />} />
        <Route path="/hod/reports" element={<HODReports />} />
        <Route path="/hod/profile" element={<HODProfile />} />
        <Route path="/" element={<Navigate to="/hod" replace />} />
        <Route path="*" element={<Navigate to="/hod" replace />} />
      </Routes>
    </AppLayout>
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
