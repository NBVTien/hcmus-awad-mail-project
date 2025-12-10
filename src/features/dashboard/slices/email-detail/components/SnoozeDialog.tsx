import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, setHours, setMinutes, nextSaturday, nextMonday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { emailService } from '@/services/emailService';
import { kanbanService } from '@/services/kanbanService';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const snoozeSchema = z.object({
  snoozeUntil: z.date().refine((date) => date > new Date(), {
    message: 'Snooze time must be in the future',
  }),
  isRecurring: z.boolean().optional(),
  recurrencePattern: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
  reason: z.string().optional(),
});

type SnoozeFormValues = z.infer<typeof snoozeSchema>;

interface SnoozeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  emailId: string;
  gmailMessageId: string;
  onSnoozeSuccess: () => void;
}

export const SnoozeDialog: React.FC<SnoozeDialogProps> = ({
  isOpen,
  onClose,
  emailId,
  gmailMessageId,
  onSnoozeSuccess,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SnoozeFormValues>({
    resolver: zodResolver(snoozeSchema),
    defaultValues: {
      isRecurring: false,
      recurrencePattern: undefined,
      reason: '',
    },
  });

  const isRecurring = watch('isRecurring');

  const getQuickSnoozeDate = (option: string): Date => {
    const now = new Date();
    let date: Date;

    switch (option) {
      case 'later-today':
        date = setHours(setMinutes(now, 0), 18); // 6 PM today
        if (date <= now) {
          date = addDays(date, 1); // If past 6 PM, snooze to tomorrow 6 PM
        }
        break;
      case 'tomorrow':
        date = setHours(setMinutes(addDays(now, 1), 0), 9); // 9 AM tomorrow
        break;
      case 'this-weekend':
        date = setHours(setMinutes(nextSaturday(now), 0), 9); // Saturday 9 AM
        break;
      case 'next-week':
        date = setHours(setMinutes(nextMonday(now), 0), 9); // Next Monday 9 AM
        break;
      default:
        date = addDays(now, 1);
    }

    return date;
  };

  const handleQuickSnooze = async (option: string) => {
    const snoozeDate = getQuickSnoozeDate(option);
    await submitSnooze(snoozeDate);
  };

  const handleCustomSnooze = async (data: SnoozeFormValues) => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    // Combine selected date with selected time
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const snoozeDate = setHours(setMinutes(selectedDate, minutes), hours);

    await submitSnooze(snoozeDate, data.isRecurring, data.recurrencePattern, data.reason);
  };

  const submitSnooze = async (
    snoozeDate: Date,
    isRecurring?: boolean,
    recurrencePattern?: 'DAILY' | 'WEEKLY' | 'MONTHLY',
    reason?: string
  ) => {
    try {
      setIsSubmitting(true);

      // 1. Call snooze API
      await emailService.snoozeEmail(
        gmailMessageId,
        snoozeDate,
        isRecurring,
        recurrencePattern,
        reason
      );

      // 2. Get Kanban board to find Snoozed column
      const kanbanBoard = await kanbanService.getKanbanBoard();
      const snoozedColumn = kanbanBoard.find((col) => col.status === 'snoozed');

      if (snoozedColumn) {
        // Find current column by checking which column has this email
        let currentColumnId: string | undefined;
        for (const col of kanbanBoard) {
          if (col.cards?.some((card) => card.emailId === emailId)) {
            currentColumnId = col.id;
            break;
          }
        }

        if (currentColumnId) {
          // 3. Move card to Snoozed column
          await kanbanService.moveCard({
            emailId,
            fromColumnId: currentColumnId,
            toColumnId: snoozedColumn.id,
            order: snoozedColumn.cards?.length || 0,
          });
        }
      }

      // 4. Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['kanban-board'] });
      queryClient.invalidateQueries({ queryKey: ['emails'] });

      toast.success(`Email snoozed until ${format(snoozeDate, 'PPp')}`);
      onSnoozeSuccess();
    } catch (error) {
      console.error('Failed to snooze email:', error);
      toast.error('Failed to snooze email');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Snooze Email
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {!isCustomMode ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Choose when to be reminded about this email:
            </p>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleQuickSnooze('later-today')}
              disabled={isSubmitting}
            >
              <Clock className="h-4 w-4 mr-2" />
              Later Today (6:00 PM)
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleQuickSnooze('tomorrow')}
              disabled={isSubmitting}
            >
              <Clock className="h-4 w-4 mr-2" />
              Tomorrow (9:00 AM)
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleQuickSnooze('this-weekend')}
              disabled={isSubmitting}
            >
              <Clock className="h-4 w-4 mr-2" />
              This Weekend (Sat 9:00 AM)
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleQuickSnooze('next-week')}
              disabled={isSubmitting}
            >
              <Clock className="h-4 w-4 mr-2" />
              Next Week (Mon 9:00 AM)
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setIsCustomMode(true)}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Pick Date & Time
            </Button>

            <Button variant="ghost" className="w-full" onClick={onClose}>
              Cancel
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleCustomSnooze)} className="space-y-4">
            <div>
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      if (date) {
                        setValue('snoozeUntil', date, { shouldValidate: true });
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.snoozeUntil && (
                <p className="text-sm text-red-500 mt-1">{errors.snoozeUntil.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="time">Select Time</Label>
              <Input
                id="time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={isRecurring}
                onCheckedChange={(checked) =>
                  setValue('isRecurring', checked as boolean)
                }
              />
              <Label htmlFor="recurring" className="text-sm font-normal cursor-pointer">
                Recurring snooze
              </Label>
            </div>

            {isRecurring && (
              <div>
                <Label htmlFor="pattern">Recurrence Pattern</Label>
                <select
                  id="pattern"
                  {...register('recurrencePattern')}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                >
                  <option value="">Select pattern</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
            )}

            <div>
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Input
                id="reason"
                {...register('reason')}
                placeholder="Why are you snoozing this?"
                className="w-full"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => setIsCustomMode(false)}
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Snoozing...' : 'Snooze'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
