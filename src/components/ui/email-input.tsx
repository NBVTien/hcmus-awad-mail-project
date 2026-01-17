import React, { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter email addresses',
  className,
}) => {
  const [inputValue, setInputValue] = useState('');
  const emails = value ? value.split(',').map(e => e.trim()).filter(Boolean) : [];

  const addEmail = (email: string) => {
    const trimmedEmail = email.trim();
    if (trimmedEmail && !emails.includes(trimmedEmail)) {
      const newEmails = [...emails, trimmedEmail];
      onChange(newEmails.join(', '));
    }
    setInputValue('');
  };

  const removeEmail = (emailToRemove: string) => {
    const newEmails = emails.filter(e => e !== emailToRemove);
    onChange(newEmails.join(', '));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      if (inputValue.trim()) {
        addEmail(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && emails.length > 0) {
      removeEmail(emails[emails.length - 1]);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addEmail(inputValue);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const pastedEmails = pastedText.split(/[,;\s]+/).filter(Boolean);

    const newEmails = [...emails];
    pastedEmails.forEach(email => {
      const trimmedEmail = email.trim();
      if (trimmedEmail && !newEmails.includes(trimmedEmail)) {
        newEmails.push(trimmedEmail);
      }
    });

    onChange(newEmails.join(', '));
  };

  return (
    <div
      className={cn(
        'flex flex-wrap gap-1.5 min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
        'focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className
      )}
    >
      {emails.map((email, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-sm"
        >
          {email}
          <button
            type="button"
            onClick={() => removeEmail(email)}
            className="hover:bg-primary/20 rounded-sm p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onPaste={handlePaste}
        placeholder={emails.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
};
