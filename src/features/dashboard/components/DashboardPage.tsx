import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from './DashboardLayout';

export const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Email Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <DashboardLayout />
      </main>
    </div>
  );
};
