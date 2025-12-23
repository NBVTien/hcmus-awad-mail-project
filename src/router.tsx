import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage, RegisterPage, OAuthCallbackPage } from '@/features/auth/pages';
import { DashboardPage } from '@/features/dashboard/pages';
import { SmtpConfigPage, KanbanSettingsPage } from '@/features/settings/pages';
import { ProtectedRoute } from '@/components/ProtectedRoute';

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
    path: '/inbox',
    element: (
      <ProtectedRoute>
        <DashboardPage />
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
