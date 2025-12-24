import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage, RegisterPage, OAuthCallbackPage, WelcomePage } from '@/features/auth/pages';
import { DashboardPage } from '@/features/dashboard/pages';
import { SmtpConfigPage, KanbanSettingsPage } from '@/features/settings/pages';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RequireEmailConfig } from '@/components/RequireEmailConfig';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/inbox" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/auth/callback',
    element: <OAuthCallbackPage />,
  },
  {
    path: '/welcome',
    element: (
      <ProtectedRoute>
        <WelcomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/inbox',
    element: (
      <ProtectedRoute>
        <RequireEmailConfig>
          <DashboardPage />
        </RequireEmailConfig>
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings/smtp',
    element: (
      <ProtectedRoute>
        <SmtpConfigPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings/kanban',
    element: (
      <ProtectedRoute>
        <KanbanSettingsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/inbox" replace />,
  },
]);
