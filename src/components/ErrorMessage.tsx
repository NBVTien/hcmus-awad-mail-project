import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage = ({ message, onRetry, className }: ErrorMessageProps) => {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-4 p-6', className)}
      role="alert"
    >
      <div className="text-center space-y-2">
        <p className="text-destructive font-medium">{message}</p>
        <p className="text-sm text-muted-foreground">
          Please check your connection and try again
        </p>
      </div>

      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Retry
        </Button>
      )}
    </div>
  );
};
