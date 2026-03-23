import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Auth Protection
import { RoleProtectedRoute } from './components/auth/RoleProtectedRoute';

// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Dashboard Pages
import { EntrepreneurDashboard } from './pages/dashboard/EntrepreneurDashboard';
import { InvestorDashboard } from './pages/dashboard/InvestorDashboard';

// Profile Pages
import { EntrepreneurProfile } from './pages/profile/EntrepreneurProfile';
import { InvestorProfile } from './pages/profile/InvestorProfile';

// Feature Pages
import { InvestorsPage } from './pages/investors/InvestorsPage';
import { EntrepreneursPage } from './pages/entrepreneurs/EntrepreneursPage';
import { MessagesPage } from './pages/messages/MessagesPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { DocumentsPage } from './pages/documents/DocumentsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { MeetingsPage } from './pages/meetings/MeetingsPage';
import { HelpPage } from './pages/help/HelpPage';
import { DealsPage } from './pages/deals/DealsPage';
import { PaymentsPage } from './pages/payments/PaymentsPage';

// Chat Pages
import { ChatPage } from './pages/chat/ChatPage';

// Video Call Page
import { VideoCallPage } from './pages/videocall/VideoCallPage';
// Audio Call Page
import { AudioCallPage } from './pages/audiocall/AudioCallPage';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Dashboard Routes - Protected by Role */}
          <Route path="/dashboard" element={
            <RoleProtectedRoute allowedRoles={['entrepreneur', 'investor']}>
              <DashboardLayout />
            </RoleProtectedRoute>
          }>
            <Route path="entrepreneur" element={
              <RoleProtectedRoute allowedRoles={['entrepreneur']}>
                <EntrepreneurDashboard />
              </RoleProtectedRoute>
            } />
            <Route path="investor" element={
              <RoleProtectedRoute allowedRoles={['investor']}>
                <InvestorDashboard />
              </RoleProtectedRoute>
            } />
          </Route>

          {/* Profile Routes - Protected by Role */}
          <Route path="/profile" element={
            <RoleProtectedRoute allowedRoles={['entrepreneur', 'investor']}>
              <DashboardLayout />
            </RoleProtectedRoute>
          }>
            <Route path="entrepreneur/:id" element={
              <RoleProtectedRoute allowedRoles={['entrepreneur']}>
                <EntrepreneurProfile />
              </RoleProtectedRoute>
            } />
            <Route path="investor/:id" element={
              <RoleProtectedRoute allowedRoles={['investor']}>
                <InvestorProfile />
              </RoleProtectedRoute>
            } />
          </Route>

          {/* Feature Routes */}
          <Route path="/investors" element={<DashboardLayout />}>
            <Route index element={<InvestorsPage />} />
          </Route>

          <Route path="/entrepreneurs" element={<DashboardLayout />}>
            <Route index element={<EntrepreneursPage />} />
          </Route>

          <Route path="/messages" element={<DashboardLayout />}>
            <Route index element={<MessagesPage />} />
          </Route>

          <Route path="/meetings" element={<DashboardLayout />}>
            <Route index element={<MeetingsPage />} />
          </Route>

          <Route path="/notifications" element={<DashboardLayout />}>
            <Route index element={<NotificationsPage />} />
          </Route>

          <Route path="/documents" element={<DashboardLayout />}>
            <Route index element={<DocumentsPage />} />
          </Route>

          <Route path="/settings" element={<DashboardLayout />}>
            <Route index element={<SettingsPage />} />
          </Route>

          <Route path="/help" element={<DashboardLayout />}>
            <Route index element={<HelpPage />} />
          </Route>

          <Route path="/deals" element={<DashboardLayout />}>
            <Route index element={<DealsPage />} />
          </Route>

          {/* Payments Routes */}
          <Route path="/payments" element={<DashboardLayout />}>
            <Route index element={<PaymentsPage />} />
          </Route>

          {/* Chat Routes */}
          <Route path="/chat" element={<DashboardLayout />}>
            <Route index element={<ChatPage />} />
            <Route path=":userId" element={<ChatPage />} />
          </Route>

          {/* Video Call Routes */}
          <Route path="/video-call" element={<DashboardLayout />}>
            <Route index element={<VideoCallPage />} />
          </Route>

          {/* Audio Call Routes */}
          <Route path="/audio-call" element={<DashboardLayout />}>
            <Route index element={<AudioCallPage />} />
          </Route>

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Catch all other routes and redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;