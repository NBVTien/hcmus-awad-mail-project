import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardLayout } from './DashboardLayout';

export const DashboardPage = () => {
  return (
    <SidebarProvider>
      <div className="h-screen flex w-full bg-background">
        <DashboardLayout />
      </div>
    </SidebarProvider>
  );
};
