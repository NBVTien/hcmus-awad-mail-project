import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { KanbanBoard } from './KanbanBoard';
import { EmailDetail } from '@/features/dashboard/slices/email-detail/components';
import { useKanbanBoard } from '@/features/dashboard/hooks/useKanbanBoard';
import { useEmailDetail } from '@/features/dashboard/hooks/useEmailDetail';

interface KanbanBoardViewProps {
  mailboxId: string;
  onComposeClick: () => void;
}

export const KanbanBoardView = ({ mailboxId, onComposeClick }: KanbanBoardViewProps) => {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const kanbanBoard = useKanbanBoard(mailboxId);
  const emailDetailQuery = useEmailDetail(selectedEmailId);

  const handleCloseDetail = () => {
    setSelectedEmailId(null);
  };

  const handleDeleteSuccess = () => {
    setSelectedEmailId(null);
    kanbanBoard.refetch();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <button
            onClick={() => kanbanBoard.refetch()}
            className="px-2 py-1 rounded hover:bg-slate-100 flex items-center gap-1"
            aria-label="Refresh Kanban board"
            disabled={kanbanBoard.isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${kanbanBoard.isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <button
          onClick={onComposeClick}
          className="px-3 py-1 rounded bg-primary text-white hover:bg-primary/90"
        >
          Compose
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          columns={kanbanBoard.columns}
          selectedEmailId={selectedEmailId}
          onSelectEmail={setSelectedEmailId}
          onMoveEmail={kanbanBoard.moveEmail}
          isLoading={kanbanBoard.isLoading}
        />
      </div>

      <Sheet open={!!selectedEmailId} onOpenChange={(open) => !open && handleCloseDetail()}>
        <SheetContent side="right" className="w-full sm:w-[600px] p-0 overflow-y-auto">
          <EmailDetail
            email={emailDetailQuery.data || null}
            isLoading={emailDetailQuery.isLoading}
            onDeleteSuccess={handleDeleteSuccess}
            onReply={() => {}}
            onReplyAll={() => {}}
            onForward={() => {}}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};
