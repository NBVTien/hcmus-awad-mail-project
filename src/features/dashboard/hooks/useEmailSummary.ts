import { useMutation } from '@tanstack/react-query';
import { emailService } from '@/services/emailService';
import type { SummaryOptions } from '@/types/email.types';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/errorUtils';

interface GenerateSummaryParams {
  emailId: string;
  options?: SummaryOptions;
}

export const useEmailSummary = () => {
  const generateSummary = useMutation({
    mutationFn: ({ emailId, options }: GenerateSummaryParams) =>
      emailService.generateSummary(emailId, options),
    onSuccess: () => {
      showSuccess('Summary generated successfully');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, 'Failed to generate summary');
      showError(message);
    },
  });

  return { generateSummary };
};
