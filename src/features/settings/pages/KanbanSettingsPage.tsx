import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, Save, Tag, ArrowLeft } from 'lucide-react';
import { kanbanService } from '@/services/kanbanService';
import { emailService } from '@/services/emailService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { KanbanColumn, CreateColumnDto } from '@/types/kanban.types';
import type { Mailbox } from '@/types/email.types';

const PRESET_COLORS = [
  { label: 'Blue', value: '#3B82F6' },
  { label: 'Purple', value: '#8B5CF6' },
  { label: 'Green', value: '#10B981' },
  { label: 'Amber', value: '#F59E0B' },
  { label: 'Red', value: '#EF4444' },
  { label: 'Pink', value: '#EC4899' },
  { label: 'Teal', value: '#14B8A6' },
  { label: 'Gray', value: '#6B7280' },
];

export const KanbanSettingsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null);
  const [deleteColumnId, setDeleteColumnId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateColumnDto>({
    name: '',
    order: 0,
    color: '#3B82F6',
    status: '',
    labelId: '',
    isActive: true,
  });

  // Fetch Kanban board (columns)
  const { data: columns, isLoading, isError, error, refetch } = useQuery<KanbanColumn[]>({
    queryKey: ['kanban-board'],
    queryFn: () => kanbanService.getKanbanBoard(),
    select: (data) => data.sort((a, b) => a.order - b.order),
  });

  // Fetch mailboxes (for label mapping)
  const { data: mailboxes } = useQuery<{ mailboxes: Mailbox[] }>({
    queryKey: ['mailboxes'],
    queryFn: () => emailService.getMailboxes(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateColumnDto) => kanbanService.createColumn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-board'] });
      setIsCreateDialogOpen(false);
      resetForm();
      showSuccess('Column created successfully');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateColumnDto> }) =>
      kanbanService.updateColumn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-board'] });
      setEditingColumn(null);
      resetForm();
      showSuccess('Column updated successfully');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => kanbanService.deleteColumn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-board'] });
      setDeleteColumnId(null);
      showSuccess('Column deleted successfully');
    },
  });

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      order: columns?.length || 0,
      color: '#3B82F6',
      status: '',
      labelId: '',
      isActive: true,
    });
  };

  const handleCreate = () => {
    setFormData({
      ...formData,
      order: columns?.length || 0,
    });
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (column: KanbanColumn) => {
    setEditingColumn(column);
    setFormData({
      name: column.name,
      order: column.order,
      color: column.color || '#3B82F6',
      status: column.status || '',
      labelId: column.labelId || '',
      isActive: column.isActive !== undefined ? column.isActive : true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingColumn) {
      await updateMutation.mutateAsync({
        id: editingColumn.id,
        data: formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleDelete = async () => {
    if (!deleteColumnId) return;
    await deleteMutation.mutateAsync(deleteColumnId);
  };

  const handleClose = () => {
    setIsCreateDialogOpen(false);
    setEditingColumn(null);
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading Kanban settings..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Failed to load Kanban settings'}
          onRetry={refetch}
        />
      </div>
    );
  }

  const isInbox = editingColumn?.status === 'inbox';

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/inbox')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Inbox
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Kanban Board Settings</h1>
              <p className="text-muted-foreground mt-1">
                Customize your Kanban columns and Gmail label mappings
              </p>
            </div>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Column
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert>
            <Save className="h-4 w-4 text-green-600" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Info Alert */}
        <Alert>
          <Tag className="h-4 w-4" />
          <AlertDescription>
            <strong>Label Mapping:</strong> When you map a column to a Gmail label, moving emails
            to that column will automatically apply the label in Gmail.
          </AlertDescription>
        </Alert>

        {/* Columns List */}
        <div className="space-y-4">
          {columns && columns.map((column) => (
            <Card key={column.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Color Preview */}
                    <div
                      className="w-12 h-12 rounded-md flex-shrink-0"
                      style={{ backgroundColor: column.color || '#6B7280' }}
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        {column.name}
                        {column.status === 'inbox' && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                        {!column.isActive && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                            Hidden
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Order: {column.order}
                        {column.labelId && (
                          <> • Mapped to label: <code className="text-xs">{column.labelId}</code></>
                        )}
                        {column.cards && <> • {column.cards.length} cards</>}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(column)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    {column.status !== 'inbox' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteColumnId(column.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateDialogOpen || !!editingColumn} onOpenChange={(open: boolean) => !open && handleClose()}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingColumn ? 'Edit Column' : 'Create New Column'}
              </DialogTitle>
              <DialogDescription>
                {isInbox
                  ? 'The Inbox column is required and cannot be renamed or deleted.'
                  : 'Configure your Kanban column and optionally map it to a Gmail label.'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Column Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Column Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Urgent, Follow Up"
                  required
                  disabled={isInbox}
                />
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: preset.value })}
                      className={`w-10 h-10 rounded-md border-2 transition-all ${
                        formData.color === preset.value
                          ? 'border-primary scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: preset.value }}
                      title={preset.label}
                    />
                  ))}
                </div>
              </div>

              {/* Gmail Label Mapping */}
              <div className="space-y-2">
                <Label htmlFor="labelId">Gmail Label (Optional)</Label>
                <Select
                  value={formData.labelId || 'none'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, labelId: value === 'none' ? '' : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No label mapping" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No label mapping</SelectItem>
                    {mailboxes?.mailboxes
                      .filter((m) => m.isSystem)
                      .map((mailbox) => (
                        <SelectItem key={mailbox.id} value={mailbox.id}>
                          {mailbox.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  When mapped, moving emails to this column will apply the label in Gmail
                </p>
              </div>

              {/* Status (auto-generated from name) */}
              {!editingColumn && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status Key (auto-generated)</Label>
                  <Input
                    id="status"
                    value={formData.name.toLowerCase().replace(/\s+/g, '-')}
                    disabled
                    className="text-muted-foreground"
                  />
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!formData.name.trim() || createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Saving...
                    </>
                  ) : (
                    <>{editingColumn ? 'Update' : 'Create'} Column</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteColumnId} onOpenChange={(open: boolean) => !open && setDeleteColumnId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Column?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete the column and move all its cards to the Inbox. This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
