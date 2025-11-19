import { useState } from 'react';
import { FolderList } from './FolderList';
import { EmailList } from './EmailList';
import { EmailDetail } from './EmailDetail';
import { useMailboxes } from '../hooks/useMailboxes';
import { useEmails } from '../hooks/useEmails';
import { useEmailDetail } from '../hooks/useEmailDetail';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { ErrorMessage } from '@/components/ErrorMessage';

export const DashboardLayout = () => {
  const [selectedMailboxId, setSelectedMailboxId] = useState<string>('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  // Fetch data
  const mailboxesQuery = useMailboxes();
  const emailsQuery = useEmails(selectedMailboxId);
  const emailDetailQuery = useEmailDetail(selectedEmailId);

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
    setSelectedEmailId(null); // Clear email selection when changing folders
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
    <div className="h-full grid grid-cols-1 md:grid-cols-[250px_1fr] lg:grid-cols-[250px_350px_1fr]">
      {/* Left Column: Folder List */}
      <div className="border-r h-full hidden md:block">
        <FolderList
          mailboxes={mailboxesQuery.data?.mailboxes || []}
          selectedMailboxId={selectedMailboxId}
          onSelectMailbox={handleSelectMailbox}
          isLoading={mailboxesQuery.isLoading}
        />
      </div>

      {/* Middle Column: Email List */}
      <div className="border-r h-full">
        <EmailList
          emails={emailsQuery.data?.emails || []}
          selectedEmailId={selectedEmailId}
          onSelectEmail={setSelectedEmailId}
          isLoading={emailsQuery.isLoading}
        />
      </div>

      {/* Right Column: Email Detail */}
      <div className="h-full hidden lg:block">
        <EmailDetail
          email={emailDetailQuery.data || null}
          isLoading={emailDetailQuery.isLoading}
        />
      </div>
    </div>
  );
};
