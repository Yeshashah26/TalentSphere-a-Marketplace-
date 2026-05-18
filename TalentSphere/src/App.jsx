import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CandidateRegister from './pages/CandidateRegister';
import CompanyRegister from './pages/CompanyRegister';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateJobs from './pages/candidate/CandidateJobs';
import CandidateProfile from './pages/candidate/CandidateProfile';
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanyPostJob from './pages/company/CompanyPostJob';
import CompanyManageJobs from './pages/company/CompanyManageJobs';
import CompanySaved from './pages/company/CompanySaved';
import CompanyTalent from './pages/company/CompanyTalent';
import CompanyProfile from './pages/company/CompanyProfile';
import CompanyRecommendations from './pages/company/CompanyRecommendations';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminJobs from './pages/admin/AdminJobs';
import AdminUsers from './pages/admin/AdminUsers';
import Messages from './pages/Messages';
import DashboardLayout, { CandidateNav, CompanyNav, AdminNav } from './components/DashboardLayout';
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/candidate" element={<CandidateRegister />} />
          <Route path="/register/company" element={<CompanyRegister />} />

          <Route path="/candidate/dashboard" element={<ProtectedRoute roles={['candidate']}><CandidateDashboard /></ProtectedRoute>} />
          <Route path="/candidate/jobs" element={<ProtectedRoute roles={['candidate']}><CandidateJobs /></ProtectedRoute>} />
          <Route path="/candidate/profile" element={<ProtectedRoute roles={['candidate']}><CandidateProfile /></ProtectedRoute>} />
          <Route path="/candidate/messages" element={<ProtectedRoute roles={['candidate']}><Messages layout={DashboardLayout} topNav={<CandidateNav />} /></ProtectedRoute>} />

          <Route path="/company/dashboard" element={<ProtectedRoute roles={['company']}><CompanyDashboard /></ProtectedRoute>} />
          <Route path="/company/post-job" element={<ProtectedRoute roles={['company']}><CompanyPostJob /></ProtectedRoute>} />
          <Route path="/company/jobs" element={<ProtectedRoute roles={['company']}><CompanyManageJobs /></ProtectedRoute>} />
          <Route path="/company/saved" element={<ProtectedRoute roles={['company']}><CompanySaved /></ProtectedRoute>} />
          <Route path="/company/talent" element={<ProtectedRoute roles={['company']}><CompanyTalent /></ProtectedRoute>} />
          <Route path="/company/recommendations" element={<ProtectedRoute roles={['company']}><CompanyRecommendations /></ProtectedRoute>} />
          <Route path="/company/messages" element={<ProtectedRoute roles={['company']}><Messages layout={DashboardLayout} topNav={<CompanyNav />} /></ProtectedRoute>} />
          <Route path="/company/profile" element={<ProtectedRoute roles={['company']}><CompanyProfile /></ProtectedRoute>} />

          <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/jobs" element={<ProtectedRoute roles={['admin']}><AdminJobs /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
