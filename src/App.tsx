import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RequireRole } from './components/auth/RequireRole';

// Investigator Shell & Pages
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { CommandCenterPage } from './pages/CommandCenterPage';
import { DistributePage } from './pages/DistributePage';
import { DocumentsPage } from './pages/DocumentsPage';
import { RecipientsPage } from './pages/RecipientsPage';
import { LedgerPage } from './pages/LedgerPage';
import { InvestigationsPage } from './pages/InvestigationsPage';
import { InvestigationDetailPage } from './pages/InvestigationDetailPage';
import { NewInvestigationPage } from './pages/NewInvestigationPage';
import { AuthorizationPage } from './pages/AuthorizationPage';
import { EmconPage } from './pages/EmconPage';
import { ActivityPage } from './pages/ActivityPage';
import { NotAuthorizedPage } from './pages/NotAuthorizedPage';
import { DocumentFullScreenPreviewPage } from './pages/DocumentFullScreenPreviewPage';

// Recipient Shell & Pages
import { RecipientAppShell } from './components/layout/RecipientAppShell';
import { MyDashboardPage } from './pages/recipient/MyDashboardPage';
import { MyDocumentsPage } from './pages/recipient/MyDocumentsPage';
import { SecureDocumentViewerPage } from './pages/recipient/SecureDocumentViewerPage';
import { MyAccessRequestsPage } from './pages/recipient/MyAccessRequestsPage';
import { MyActivityPage } from './pages/recipient/MyActivityPage';
import { MyKeysPage } from './pages/recipient/MyKeysPage';
import { SecurityGuidelinesPage } from './pages/recipient/SecurityGuidelinesPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 30000,
      gcTime: 300000,
    },
  },
});

/**
 * Dynamic Root Redirector based on Active Officer Role
 */
const RootRedirector: React.FC = () => {
  const { isAuthenticated, isNormalUser } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return isNormalUser ? <Navigate to="/my/dashboard" replace /> : <Navigate to="/command-center" replace />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              {/* Public / Login Route */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/not-authorized" element={<NotAuthorizedPage />} />

              {/* ════════════════════════════════════════════════════════
                  RECIPIENT / NORMAL USER SHELL (/my/*)
                  Protected by <RequireRole roles={['normal_user', 'recipient']}>
                  ════════════════════════════════════════════════════════ */}
              <Route element={<RequireRole roles={['normal_user', 'recipient']} />}>
                <Route element={<RecipientAppShell />}>
                  <Route path="/my" element={<Navigate to="/my/dashboard" replace />} />
                  <Route path="/my/dashboard" element={<MyDashboardPage />} />
                  <Route path="/my/documents" element={<MyDocumentsPage />} />
                  <Route path="/my/documents/:id/view" element={<SecureDocumentViewerPage />} />
                  <Route path="/my/requests" element={<MyAccessRequestsPage />} />
                  <Route path="/my/activity" element={<MyActivityPage />} />
                  <Route path="/my/keys" element={<MyKeysPage />} />
                  <Route path="/my/guidelines" element={<SecurityGuidelinesPage />} />
                </Route>
              </Route>

              {/* ════════════════════════════════════════════════════════
                  INVESTIGATOR COMMAND CENTER SHELL
                  Protected by <RequireRole roles={['investigator']}>
                  ════════════════════════════════════════════════════════ */}
              <Route element={<RequireRole roles={['investigator']} />}>
                <Route element={<AppShell />}>
                  <Route path="/command-center" element={<CommandCenterPage />} />
                  <Route path="/distribute" element={<DistributePage />} />
                  <Route path="/documents" element={<DocumentsPage />} />
                  <Route path="/documents/:docId" element={<DocumentsPage />} />
                  <Route path="/documents/:id/preview" element={<DocumentFullScreenPreviewPage />} />
                  <Route path="/documents/preview" element={<DocumentFullScreenPreviewPage />} />
                  <Route path="/recipients" element={<RecipientsPage />} />
                  <Route path="/ledger" element={<LedgerPage />} />
                  <Route path="/ledger/:blockId" element={<LedgerPage />} />
                  <Route path="/investigations" element={<InvestigationsPage />} />
                  <Route path="/investigations/new" element={<NewInvestigationPage />} />
                  <Route path="/investigations/:caseId" element={<InvestigationDetailPage />} />
                  <Route path="/authorization" element={<AuthorizationPage />} />
                  <Route path="/emcon" element={<EmconPage />} />
                  <Route path="/activity" element={<ActivityPage />} />
                </Route>
              </Route>

              {/* Dynamic Fallbacks */}
              <Route path="/" element={<RootRedirector />} />
              <Route path="*" element={<RootRedirector />} />
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
