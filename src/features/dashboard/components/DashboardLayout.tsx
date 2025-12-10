import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { ComposeModal } from './ComposeModal';
import { AppSidebar } from './AppSidebar';
import { EmailList } from './EmailList';
import { EmailDetail } from './EmailDetail';
import { BulkActionToolbar } from './BulkActionToolbar';
import { PaginationControls } from './PaginationControls';
import { KanbanBoardView } from './KanbanBoardView';
import { useMailboxes } from '../hooks/useMailboxes';
import { useEmails } from '../hooks/useEmails';
import { useEmailDetail } from '../hooks/useEmailDetail';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { useBulkSelection } from '../hooks/useBulkSelection';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import type { EmailSelection } from '@/types/email.types';

type ComposeMode = 'compose' | 'reply' | 'replyAll' | 'forward';

export const DashboardLayout = () => {
  const [selectedMailboxId, setSelectedMailboxId] = useState<string>('INBOX');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeMode, setComposeMode] = useState<ComposeMode>('compose');
  const [emailSelection, setEmailSelection] = useState<EmailSelection>({
    selectedIds: new Set(),
    selectAll: false,
    count: 0,
  });

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>(() => {
    const saved = localStorage.getItem(`view-mode-${selectedMailboxId}`);
    return (saved as 'list' | 'kanban') || 'list';
  });

  // Pagination state
  const [page, setPage] = useState(1);

  // Persist view mode to localStorage
  useEffect(() => {
    localStorage.setItem(`view-mode-${selectedMailboxId}`, viewMode);
  }, [viewMode, selectedMailboxId]);

  // Fetch data
  const mailboxesQuery = useMailboxes();
  const emailsQuery = useEmails(selectedMailboxId, page);
  const emailDetailQuery = useEmailDetail(selectedEmailId);

  // Bulk operations
  const { bulkDelete, bulkMarkRead } = useBulkSelection();

  // Get totalPages from query result
  const totalPages = emailsQuery.data?.pagination.totalPages || 1;

  // Reset page when mailbox changes
  const resetPage = () => setPage(1);

  // Keyboard navigation for email list
  useKeyboardNav({
    items: emailsQuery.data?.emails || [],
    selectedId: selectedEmailId,
    onSelect: setSelectedEmailId,
    onClear: () => setSelectedEmailId(null),
    enabled: !emailsQuery.isLoading && (emailsQuery.data?.emails.length || 0) > 0,
  });

  // Handle mailbox selection
  const handleSelectMailbox = (mailboxId: string) => {
    setSelectedMailboxId(mailboxId);
    setSelectedEmailId(null);
    setEmailSelection({ selectedIds: new Set(), selectAll: false, count: 0 });
    resetPage();

    // Load view mode preference for new mailbox
    const saved = localStorage.getItem(`view-mode-${mailboxId}`);
    setViewMode((saved as 'list' | 'kanban') || 'list');
  };

  // Toggle individual email selection
  const handleToggleSelect = (emailId: string) => {
    const newSelection = new Set(emailSelection.selectedIds);
    if (newSelection.has(emailId)) {
      newSelection.delete(emailId);
    } else {
      newSelection.add(emailId);
    }
    setEmailSelection({
      selectedIds: newSelection,
      selectAll: newSelection.size === (emailsQuery.data?.emails.length || 0),
      count: newSelection.size,
    });
  };

  // Toggle select all
  const handleToggleSelectAll = () => {
    if (emailSelection.selectAll) {
      setEmailSelection({ selectedIds: new Set(), selectAll: false, count: 0 });
    } else {
      const allIds = new Set((emailsQuery.data?.emails || []).map((e) => e.id));
      setEmailSelection({
        selectedIds: allIds,
        selectAll: true,
        count: allIds.size,
      });
    }
  };

  // Bulk actions
  const handleBulkDelete = () => {
    if (emailSelection.count === 0) return;
    const ids = Array.from(emailSelection.selectedIds);
    bulkDelete.mutate(ids, {
      onSuccess: () => {
        setEmailSelection({ selectedIds: new Set(), selectAll: false, count: 0 });
      },
    });
  };

  const handleBulkMarkRead = () => {
    if (emailSelection.count === 0) return;
    const ids = Array.from(emailSelection.selectedIds);
    bulkMarkRead.mutate(
      { emailIds: ids, isRead: true },
      {
        onSuccess: () => {
          setEmailSelection({ selectedIds: new Set(), selectAll: false, count: 0 });
        },
      }
    );
  };

  const handleBulkMarkUnread = () => {
    if (emailSelection.count === 0) return;
    const ids = Array.from(emailSelection.selectedIds);
    bulkMarkRead.mutate(
      { emailIds: ids, isRead: false },
      {
        onSuccess: () => {
          setEmailSelection({ selectedIds: new Set(), selectAll: false, count: 0 });
        },
      }
    );
  };

  // Handle errors
  if (mailboxesQuery.isError) {
    return (
      <div className="h-full flex items-center justify-center">
        <ErrorMessage
          message="Failed to load mailboxes"
          onRetry={() => mailboxesQuery.refetch()}
        />
      </div>
    );
  }

  if (emailsQuery.isError) {
    return (
      <div className="h-full flex items-center justify-center">
        <ErrorMessage
          message="Failed to load emails"
          onRetry={() => emailsQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <>
      {/* Sidebar with mailboxes and user info */}
      <AppSidebar
        mailboxes={mailboxesQuery.data?.mailboxes || []}
        selectedMailboxId={selectedMailboxId}
        onSelectMailbox={handleSelectMailbox}
        isLoading={mailboxesQuery.isLoading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main content area */}
      <SidebarInset className="flex-1 overflow-hidden">
        {viewMode === 'list' ? (
          <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Email List Column */}
          <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
            <div className="border-r h-full flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <button
                  onClick={() => emailsQuery.refetch()}
                  className="px-2 py-1 rounded hover:bg-slate-100 flex items-center gap-1"
                  aria-label="Refresh email list"
                  disabled={emailsQuery.isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${emailsQuery.isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <button
                onClick={() => {
                  setComposeMode('compose');
                  setComposeOpen(true);
                }}
                className="px-3 py-1 rounded bg-primary text-white hover:bg-primary/90"
              >
                Compose
              </button>
            </div>

            {/* Bulk Action Toolbar */}
            <ErrorBoundary>
              <BulkActionToolbar
                selectedCount={emailSelection.count}
                totalCount={emailsQuery.data?.emails.length || 0}
                selectAll={emailSelection.selectAll}
                onToggleSelectAll={handleToggleSelectAll}
                onBulkDelete={handleBulkDelete}
                onBulkMarkRead={handleBulkMarkRead}
                onBulkMarkUnread={handleBulkMarkUnread}
                selectedEmails={(emailsQuery.data?.emails || []).filter((email) =>
                  emailSelection.selectedIds.has(email.id)
                )}
              />
            </ErrorBoundary>

            {/* Email List */}
            <div className="flex-1 overflow-hidden w-full">
              <EmailList
                emails={emailsQuery.data?.emails || []}
                selectedEmailId={selectedEmailId}
                onSelectEmail={setSelectedEmailId}
                isLoading={emailsQuery.isLoading}
                selectedIds={emailSelection.selectedIds}
                onToggleSelect={handleToggleSelect}
                showCheckboxes={true}
              />
            </div>

            {/* Pagination */}
            {emailsQuery.data?.pagination && totalPages > 1 && (
              <PaginationControls
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Email Detail Column */}
          <ResizablePanel defaultSize={65} minSize={50}>
            <div className="h-full overflow-hidden">
            <EmailDetail
              email={emailDetailQuery.data || null}
              isLoading={emailDetailQuery.isLoading}
              onDeleteSuccess={() => {
                // After delete, clear selection and go back to inbox
                setSelectedEmailId(null);
                setSelectedMailboxId('INBOX');
              }}
              onReply={() => {
                setComposeMode('reply');
                setComposeOpen(true);
              }}
              onReplyAll={() => {
                setComposeMode('replyAll');
                setComposeOpen(true);
              }}
              onForward={() => {
                setComposeMode('forward');
                setComposeOpen(true);
              }}
            />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        ) : (
          <KanbanBoardView
            mailboxId={selectedMailboxId}
            onComposeClick={() => {
              setComposeMode('compose');
              setComposeOpen(true);
            }}
          />
        )}
      </SidebarInset>

      <ErrorBoundary>
        <ComposeModal
          isOpen={composeOpen}
          onClose={() => {
            setComposeOpen(false);
            setComposeMode('compose');
          }}
          mode={composeMode}
          originalEmail={composeMode !== 'compose' ? emailDetailQuery.data || null : null}
        />
      </ErrorBoundary>
    </>
  );
};
