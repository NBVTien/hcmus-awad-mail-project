import { useState, useEffect } from 'react';
import { ComposeModal } from '@/features/dashboard/slices/compose/components';

import { AppSidebar } from './AppSidebar';
import { EmailList } from '@/features/dashboard/slices/email-list/components';
import { EmailDetail } from '@/features/dashboard/slices/email-detail/components';
import { BulkActionToolbar } from '@/features/dashboard/slices/email-list/components';
import { PaginationControls } from '@/features/dashboard/slices/email-list/components';
import { KanbanBoardView } from '@/features/dashboard/slices/kanban/components';
import { SearchBar, SearchResults } from '@/features/dashboard/slices/search/components';
import { SmtpSetupPrompt } from '@/features/settings/components';
import { NoEmailConfigured } from '@/features/dashboard/components/NoEmailConfigured';
import { useMailboxes } from '@/features/dashboard/hooks/useMailboxes';
import { useEmails } from '@/features/dashboard/hooks/useEmails';
import { useEmailDetail } from '@/features/dashboard/hooks/useEmailDetail';
import { useKeyboardNav } from '@/features/dashboard/hooks/useKeyboardNav';
import { useBulkSelection } from '@/features/dashboard/hooks/useBulkSelection';
import { useSearch } from '@/features/dashboard/slices/search/hooks/useSearch';
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

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Persist view mode to localStorage
  useEffect(() => {
    localStorage.setItem(`view-mode-${selectedMailboxId}`, viewMode);
  }, [viewMode, selectedMailboxId]);

  // Fetch data
  const mailboxesQuery = useMailboxes();
  const emailsQuery = useEmails(selectedMailboxId, page);
  const emailDetailQuery = useEmailDetail(selectedEmailId);
  const searchResultsQuery = useSearch(searchQuery, isSearchMode);

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

  // Search handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchMode(true);
    setSelectedEmailId(null);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearchMode(false);
    setSelectedEmailId(null);
  };

  // Handle errors
  // Check if error is due to missing Gmail tokens
  const isGmailTokensError = (error: unknown) => {
    return error instanceof Error && error.message.includes('Gmail tokens not found');
  };

  if (mailboxesQuery.isError && isGmailTokensError(mailboxesQuery.error)) {
    return (
      <>
        <AppSidebar
          mailboxes={[]}
          selectedMailboxId=""
          onSelectMailbox={() => {}}
          isLoading={false}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCompose={() => {}}
          onSync={() => {}}
        />
        <SidebarInset>
          <NoEmailConfigured />
        </SidebarInset>
      </>
    );
  }

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

  if (emailsQuery.isError && !isGmailTokensError(emailsQuery.error)) {
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
      {/* SMTP Setup Prompt */}
      <SmtpSetupPrompt />

      {/* Sidebar with mailboxes and user info */}
      {/* Sidebar with mailboxes and user info */}
      <AppSidebar
        mailboxes={mailboxesQuery.data?.mailboxes || []}
        selectedMailboxId={selectedMailboxId}
        onSelectMailbox={handleSelectMailbox}
        isLoading={mailboxesQuery.isLoading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCompose={() => {
          setComposeMode('compose');
          setComposeOpen(true);
        }}
        onSync={() => emailsQuery.refetch()}
        isSyncing={emailsQuery.isFetching}
      />

      {/* Main content area */}
      <SidebarInset className="flex-1 overflow-hidden">
        {viewMode === 'list' ? (
          <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Email List Column */}
          <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
            <div className="border-r h-full flex flex-col overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-3 px-4 py-2 border-b">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                </div>

                <SearchBar
                  onSearch={handleSearch}
                  onClear={handleClearSearch}
                />
              </div>

              {isSearchMode ? (
                /* Search Results View */
                <div className="flex-1 overflow-hidden">
                  <SearchResults
                    query={searchQuery}
                    results={searchResultsQuery.data}
                    isLoading={searchResultsQuery.isLoading}
                    isError={searchResultsQuery.isError}
                    error={searchResultsQuery.error}
                    onEmailSelect={setSelectedEmailId}
                    selectedEmailId={selectedEmailId}
                    onBack={handleClearSearch}
                    onRetry={() => searchResultsQuery.refetch()}
                  />
                </div>
              ) : (
                <>
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
                </>
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
