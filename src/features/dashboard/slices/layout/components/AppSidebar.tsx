import { LogOut, Mail, List, LayoutGrid } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { Mailbox } from '@/types/email.types';

interface AppSidebarProps {
  mailboxes: Mailbox[];
  selectedMailboxId: string;
  onSelectMailbox: (mailboxId: string) => void;
  isLoading?: boolean;
  viewMode: 'list' | 'kanban';
  onViewModeChange: (mode: 'list' | 'kanban') => void;
}

export const AppSidebar = ({
  mailboxes,
  selectedMailboxId,
  onSelectMailbox,
  isLoading,
  viewMode,
  onViewModeChange,
}: AppSidebarProps) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <h1 className="text-lg font-bold">Email Dashboard</h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>View Mode</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex gap-2 px-2 py-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="flex-1"
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange('kanban')}
                className="flex-1"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Kanban
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Mailboxes</SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="flex-1">
              <SidebarMenu>
                {isLoading ? (
                  <div className="space-y-2 px-4 py-3">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ) : (
                  mailboxes.map((mailbox) => (
                    <SidebarMenuItem key={mailbox.id}>
                      <SidebarMenuButton
                        onClick={() => onSelectMailbox(mailbox.id)}
                        isActive={selectedMailboxId === mailbox.id}
                        className="w-full"
                      >
                        <span className="flex items-center justify-between w-full gap-2 min-w-0">
                          <span className="truncate">{mailbox.name}</span>
                          {mailbox.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground flex-shrink-0">
                              {mailbox.unreadCount}
                            </span>
                          )}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="px-4 py-3 space-y-3">
          <div className="text-sm text-muted-foreground truncate">
            {user?.email}
          </div>
          <Separator />
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};