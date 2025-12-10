import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardLayout } from '@/features/dashboard/slices/layout/components';

export const DashboardPage = () => {
  return (
    <SidebarProvider>
      <div className="h-screen flex w-full bg-background">
        <DashboardLayout />
      </div>
    </SidebarProvider>
  );
};
