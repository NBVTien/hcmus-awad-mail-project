import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage, RegisterPage, OAuthCallbackPage, WelcomePage } from '@/features/auth/pages';
import { DashboardPage } from '@/features/dashboard/pages';
import { SettingsPage } from '@/features/settings/pages';
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
    path: '/settings',
    element: (
      <ProtectedRoute>
        <SettingsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings/smtp',
    element: <Navigate to="/settings" replace />,
  },
  {
    path: '/settings/kanban',
    element: <Navigate to="/settings" replace />,
  },
  {
    path: '/settings/search',
    element: <Navigate to="/settings" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/inbox" replace />,
  },
]);
