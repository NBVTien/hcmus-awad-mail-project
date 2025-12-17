import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';
import { useEmailSummary } from '@/features/dashboard/hooks/useEmailSummary';
import type { EmailSummaryProps } from './EmailSummary.types';
import { getErrorMessage } from '@/lib/errorUtils';

export const EmailSummary = ({ emailId }: EmailSummaryProps) => {
  const [summary, setSummary] = useState<string | null>(null);
  const { generateSummary } = useEmailSummary();

  const handleGenerate = () => {
    const options = {
      length: 'medium' as const,
      tone: 'formal' as const,
      provider: 'gemini' as const,
    };

    generateSummary.mutate(
      { emailId, options },
      {
        onSuccess: (data: import('@/types/email.types').EmailSummary) => {
          setSummary(data.summary);
        },
      }
    );
  };

  // State 1: Loading
  if (generateSummary.isPending) {
    return (
      <div className="space-y-3 p-4 rounded-md border bg-muted/50">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span className="font-medium text-sm">Generating AI Summary...</span>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  // State 2: Error
  if (generateSummary.isError && !summary) {
    return (
      <div className="space-y-2 p-4 rounded-md border border-destructive/50 bg-destructive/10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span className="font-medium text-sm">Failed to generate summary</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {getErrorMessage(generateSummary.error, 'An error occurred while generating the summary.')}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          className="w-full"
        >
          Retry
        </Button>
      </div>
    );
  }

  // State 3: Success (showing summary)
  if (summary) {
    return (
      <div className="space-y-3 p-4 rounded-md border bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium text-sm">AI Summary</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerate}
            className="text-xs"
          >
            Regenerate
          </Button>
        </div>
        <p className="text-sm leading-relaxed">{summary}</p>
      </div>
    );
  }

  // State 4: Initial state (no summary generated)
  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleGenerate}
        className="w-full justify-start gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Generate AI Summary
      </Button>
    </div>
  );
};
