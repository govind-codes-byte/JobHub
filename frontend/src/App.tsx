import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Public pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";

// Candidate pages
import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import CandidateProfile from "./pages/candidate/CandidateProfile";
import CandidateApplications from "./pages/candidate/CandidateApplications";

// Recruiter pages
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import RecruiterProfile from "./pages/recruiter/RecruiterProfile";
import RecruiterJobs from "./pages/recruiter/RecruiterJobs";
import JobFormPage from "./pages/recruiter/JobFormPage";
import RecruiterApplicants from "./pages/recruiter/RecruiterApplicants";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />

              <Route path="/candidate" element={<ProtectedRoute roles={["candidate"]}><CandidateDashboard /></ProtectedRoute>} />
              <Route path="/candidate/profile" element={<ProtectedRoute roles={["candidate"]}><CandidateProfile /></ProtectedRoute>} />
              <Route path="/candidate/applications" element={<ProtectedRoute roles={["candidate"]}><CandidateApplications /></ProtectedRoute>} />

              <Route path="/recruiter" element={<ProtectedRoute roles={["recruiter"]}><RecruiterDashboard /></ProtectedRoute>} />
              <Route path="/recruiter/profile" element={<ProtectedRoute roles={["recruiter"]}><RecruiterProfile /></ProtectedRoute>} />
              <Route path="/recruiter/jobs" element={<ProtectedRoute roles={["recruiter"]}><RecruiterJobs /></ProtectedRoute>} />
              <Route path="/recruiter/jobs/new" element={<ProtectedRoute roles={["recruiter"]}><JobFormPage /></ProtectedRoute>} />
              <Route path="/recruiter/jobs/:id/edit" element={<ProtectedRoute roles={["recruiter"]}><JobFormPage /></ProtectedRoute>} />
              <Route path="/recruiter/jobs/:jobId/applicants" element={<ProtectedRoute roles={["recruiter"]}><RecruiterApplicants /></ProtectedRoute>} />
              <Route path="/recruiter/applicants" element={<ProtectedRoute roles={["recruiter"]}><RecruiterJobs /></ProtectedRoute>} />

              <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/jobs" element={<ProtectedRoute roles={["admin"]}><JobsPage /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: { borderRadius: "12px", fontSize: "14px", fontWeight: "500" },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
