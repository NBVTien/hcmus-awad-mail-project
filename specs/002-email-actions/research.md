# Research: Email Actions & Enhanced Dashboard

**Feature**: Email Actions & Enhanced Dashboard
**Date**: 2025-11-19
**Purpose**: Technical decisions for interactive email actions, modals, bulk operations, pagination, and mobile navigation

---

## 1. Modal UX Patterns

### Decision
Use Radix UI Dialog with focus trap, Escape/click-outside to close, and unsaved changes confirmation.

**Implementation**:
```typescript
// src/components/ui/dialog.tsx
import * as DialogPrimitive from "@radix-ui/react-dialog"

// ComposeModal usage
<Dialog open={isOpen} onOpenChange={handleClose}>
  <DialogContent onEscapeKeyDown={handleEscape}>
    <DialogTitle>New Message</DialogTitle>
    <ComposeForm />
  </DialogContent>
</Dialog>

// Unsaved changes handler
const handleEscape = (e: KeyboardEvent) => {
  if (isDirty) {
    e.preventDefault();
    setShowConfirmation(true);
  }
};
```

### Rationale
- **Radix UI Dialog**: Already using Radix primitives (Slot, Label, ScrollArea), consistent with existing architecture
- **Focus Management**: Radix handles focus trap automatically, returns focus to trigger on close
- **Keyboard Accessibility**: Built-in Escape key handling, Tab navigation within modal
- **Unsaved Changes Pattern**: Intercept `onEscapeKeyDown` and `onInteractOutside` when form is dirty
- **No Additional Bundle Size**: Radix Dialog peer dep already available via existing Radix components

### Alternatives Considered
- **Headless UI Dialog**: Requires adding new dependency (~15KB), less ecosystem support
- **React Modal**: Older library, manual focus management required, accessibility gaps
- **Custom modal**: Reinventing accessible modal is error-prone, violates Constitution V (accessibility)
- **No confirmation for unsaved changes**: Poor UX, users lose work accidentally

### Implementation Notes
- Create `src/components/ui/dialog.tsx` wrapping Radix Dialog primitives
- Use `DialogPortal` to render outside React tree (prevents z-index conflicts)
- Apply Tailwind styles: `backdrop-blur-sm bg-black/50` for overlay, `max-w-2xl` for compose modal
- Confirmation dialog pattern: nested Dialog for "Discard changes?" with Cancel/Discard buttons
- Prevent rapid modal opening: track `isOpen` state, disable Compose button while open

---

## 2. Form State Management

### Decision
React Hook Form with Zod schema validation, pre-fill for reply/forward, discard drafts on close (no localStorage persistence).

**Schema**:
```typescript
// src/features/dashboard/types/email-actions.types.ts
const emailListSchema = z.string()
  .regex(/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format')
  .array()
  .min(1, 'At least one recipient required');

const composeSchema = z.object({
  to: z.string()
    .min(1, 'Required')
    .transform(val => val.split(',').map(s => s.trim()))
    .pipe(emailListSchema),
  cc: z.string().optional()
    .transform(val => val ? val.split(',').map(s => s.trim()) : [])
    .pipe(z.array(z.string().email('Invalid email in CC')).optional()),
  subject: z.string().min(1, 'Subject required'),
  body: z.string().min(1, 'Message cannot be empty')
});

// Usage in ComposeModal
const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
  resolver: zodResolver(composeSchema),
  defaultValues: getDefaultValues(mode, originalEmail) // mode: 'compose' | 'reply' | 'forward'
});
```

**Pre-fill Logic**:
```typescript
function getDefaultValues(mode: ComposeMode, email?: Email) {
  if (mode === 'reply') {
    return {
      to: email.from.email,
      cc: '',
      subject: `Re: ${email.subject}`,
      body: `\n\n---\nOn ${formatDate(email.timestamp)}, ${email.from.name || email.from.email} wrote:\n> ${email.body.split('\n').join('\n> ')}`
    };
  }
  if (mode === 'forward') {
    return {
      to: '',
      cc: '',
      subject: `Fwd: ${email.subject}`,
      body: `\n\n---\nForwarded message:\nFrom: ${email.from.name} <${email.from.email}>\nTo: ${email.to.map(r => `${r.name} <${r.email}>`).join(', ')}\nDate: ${formatFullDate(email.timestamp)}\nSubject: ${email.subject}\n\n${email.body}`
    };
  }
  return { to: '', cc: '', subject: '', body: '' }; // compose
}
```

### Rationale
- **Comma-separated Email Parsing**: Zod `.transform()` splits string into array, then validates each email
- **Pre-fill for Reply/Reply All**: Improves UX, standard email client behavior
- **No Draft Persistence**: Simplifies implementation, acceptable for demo (localStorage adds complexity)
- **React Hook Form**: Already in dependencies (7.66.1), minimal re-renders, excellent TypeScript support
- **Inline Validation**: `errors` object from `formState` displays field-specific errors

### Alternatives Considered
- **localStorage Draft Persistence**: Adds complexity (draft sync, expiration logic), not in requirements
- **Plain text To field (no comma separation)**: Poor UX, forces multiple modals for multiple recipients
- **Formik**: Heavier, more re-renders than React Hook Form
- **Manual validation**: Verbose, error-prone, duplicates logic

### Implementation Notes
- To field accepts comma-separated emails: `john@example.com, jane@example.com`
- CC/BCC optional fields, hidden by default with "Add CC/BCC" toggle button
- Cursor positioning: `textarea.setSelectionRange(0, 0)` to place cursor before quote in reply
- Error display: inline below each field, red border on invalid fields
- Reply All: populate both To and CC from original recipients, exclude current user

---

## 3. Bulk Selection Patterns

### Decision
Checkbox state managed in `DashboardLayout`, Select All toggle, selection cleared on folder navigation.

**State Management**:
```typescript
// src/features/dashboard/hooks/useBulkSelection.ts
export function useBulkSelection(emails: Email[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === emails.length) {
      setSelectedIds(new Set()); // Deselect all
    } else {
      setSelectedIds(new Set(emails.map(e => e.id))); // Select all
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  return {
    selectedIds,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    isAllSelected: selectedIds.size === emails.length && emails.length > 0
  };
}
```

**Visual Indicators**:
```typescript
// EmailList checkbox rendering
<Checkbox
  checked={selectedIds.has(email.id)}
  onCheckedChange={() => toggleSelection(email.id)}
  aria-label={`Select ${email.subject}`}
/>

// Selected row styling
className={cn(
  'email-row',
  selectedIds.has(email.id) && 'bg-accent/50 border-l-2 border-primary'
)}
```

### Rationale
- **Set for O(1) Lookup**: `Set<string>` provides fast `.has()` checks for large lists
- **Separate from View Selection**: Checkbox selection is independent from email detail view (clicking email doesn't check it)
- **Clear on Navigation**: Prevents confusion when switching folders (selection only applies to current folder)
- **Toggle Behavior**: Select All is a toggle (all → none → all), consistent with Gmail/Outlook
- **Visual Feedback**: Background color + left border distinguishes selected items

### Alternatives Considered
- **Array of IDs**: Slower `.includes()` lookup, O(n) complexity
- **Persist Selection Across Folders**: Confusing UX, cross-folder actions are rare
- **Auto-select on Click**: Conflicts with "view email" action, non-standard behavior
- **Checkbox in EmailDetail**: Redundant, email is already focused when detail is open

### Implementation Notes
- Checkbox component: Create `src/components/ui/checkbox.tsx` wrapping Radix Checkbox
- Bulk action buttons disabled when `selectedIds.size === 0`
- Keyboard navigation (`useKeyboardNav`) manages focus, not selection (arrow keys move focus, Space bar selects)
- Selection count displayed in toolbar: "3 selected"
- Clear selection after bulk action completes (e.g., after bulk delete)

---

## 4. Pagination Strategies

### Decision
Server-side pagination (mock service supports it), page state in component (not URL), client-side edge case handling.

**Implementation**:
```typescript
// src/features/dashboard/hooks/usePagination.ts
export function usePagination(totalPages: number) {
  const [page, setPage] = useState(1);

  const goToPage = (newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  const nextPage = () => goToPage(page + 1);
  const prevPage = () => goToPage(page - 1);

  // Reset to page 1 on folder change (caller responsibility)
  const reset = () => setPage(1);

  return { page, goToPage, nextPage, prevPage, reset, hasNext: page < totalPages, hasPrev: page > 1 };
}

// EmailList integration
const { page, nextPage, prevPage, hasNext, hasPrev } = usePagination(emailsQuery.data?.pagination.totalPages || 1);
const emailsQuery = useEmails(selectedMailboxId, { page, limit: 50 });

// Edge case: delete last item on page
useEffect(() => {
  if (emails.length === 0 && page > 1) {
    prevPage(); // Auto-navigate to previous page
  }
}, [emails.length, page]);
```

**Pagination Controls**:
```typescript
// src/features/dashboard/components/PaginationControls.tsx
<div className="flex items-center justify-between p-4 border-t">
  <span className="text-sm text-muted-foreground">
    Page {page} of {totalPages} ({total} emails)
  </span>
  <div className="flex gap-2">
    <Button disabled={!hasPrev} onClick={prevPage}>Previous</Button>
    <Button disabled={!hasNext} onClick={nextPage}>Next</Button>
  </div>
</div>
```

### Rationale
- **Server-Side Pagination**: Mock service already supports it, reduces client memory for large datasets
- **Component State (Not URL)**: Simpler implementation, page reset on folder change is automatic, no URL sync needed
- **Page Size 50**: Balance between too many API calls (small pages) and slow rendering (large pages)
- **Edge Case Handling**: Client-side navigation to previous page when current page becomes empty
- **Simple Controls**: Previous/Next buttons only (no page number dropdown), sufficient for demo

### Alternatives Considered
- **Client-Side Pagination**: Loads all emails, then slices array (inefficient for 1000+ emails)
- **URL State (query params)**: Adds complexity (router integration, sync issues), overkill for demo
- **Virtualization (react-window)**: More complex, 50 items per page renders fast enough (<200ms)
- **Infinite Scroll**: Non-standard for email clients, harder to navigate to specific page
- **Page Number Buttons (1, 2, 3...)**: More code, truncation logic needed for many pages

### Implementation Notes
- Only show `PaginationControls` when `totalPages > 1`
- Reset page to 1 when folder changes: `useEffect(() => reset(), [selectedMailboxId])`
- Disable Previous button on page 1, Next button on last page
- Maintain selected email across page changes (if still in view), otherwise clear selection
- Total count displayed: "Showing 1-50 of 237 emails"

---

## 5. TanStack Query Cache Invalidation

### Decision
Optimistic updates for instant feedback, cache invalidation after mutations, rollback on error.

**Mutation Pattern**:
```typescript
// src/features/dashboard/hooks/useEmailActions.ts
export function useEmailActions() {
  const queryClient = useQueryClient();

  const starMutation = useMutation({
    mutationFn: ({ emailId, isStarred }: { emailId: string; isStarred: boolean }) =>
      mockEmailService.updateEmail(emailId, { isStarred }),

    // Optimistic update
    onMutate: async ({ emailId, isStarred }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['emails'] });

      // Snapshot current state
      const previousEmails = queryClient.getQueryData(['emails', mailboxId]);

      // Optimistically update cache
      queryClient.setQueryData(['emails', mailboxId], (old: GetEmailsResponse) => ({
        ...old,
        emails: old.emails.map(e => e.id === emailId ? { ...e, isStarred } : e)
      }));

      return { previousEmails }; // Return context for rollback
    },

    // Invalidate queries on success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] }); // Update Starred folder count
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousEmails) {
        queryClient.setQueryData(['emails', mailboxId], context.previousEmails);
      }
      showErrorToast('Failed to star email. Please try again.');
    }
  });

  return { starMutation };
}
```

**Concurrent Mutation Handling**:
```typescript
// Bulk delete with sequential processing
const bulkDeleteMutation = useMutation({
  mutationFn: async (emailIds: string[]) => {
    // Process sequentially to avoid race conditions
    for (const id of emailIds) {
      await mockEmailService.deleteEmail(id);
    }
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['emails'] });
    queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
  }
});
```

### Rationale
- **Optimistic Updates**: Instant UI feedback (<100ms perceived latency), feels responsive
- **Cache Invalidation**: Ensures UI reflects server state after mutation, updates folder counts
- **Rollback on Error**: Restores previous state if mutation fails, prevents inconsistent UI
- **Cancel In-Flight Queries**: Prevents race conditions between optimistic update and background refetch
- **Invalidate Mailboxes**: Starred/Trash folder counts update when emails are starred/deleted

### Alternatives Considered
- **No Optimistic Updates**: 200-500ms delay before UI updates, feels sluggish
- **Manual State Updates**: Error-prone, duplicates cache logic, violates TanStack Query patterns
- **Polling for Updates**: Wastes bandwidth, adds latency
- **No Rollback**: Leaves UI in inconsistent state on error, poor UX

### Implementation Notes
- Star/unstar: Invalidate `['emails']` and `['mailboxes']` queries
- Delete: Invalidate `['emails', mailboxId]` and `['mailboxes']`, clear selected email if deleted
- Bulk operations: Process sequentially (not parallel) to avoid race conditions
- Error messages: Toast notification with retry button
- Send email: Invalidate `['emails', 'sent']` to show new email in Sent folder

---

## 6. Mobile Navigation State

### Decision
Single-column state managed in `DashboardLayout`, browser history integration with `pushState`, no swipe gestures (optional future enhancement).

**State Management**:
```typescript
// src/features/dashboard/components/DashboardLayout.tsx
const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
const isMobile = useMediaQuery('(max-width: 767px)'); // Tailwind md breakpoint

// When email is selected on mobile
const handleSelectEmail = (emailId: string) => {
  setSelectedEmailId(emailId);
  if (isMobile) {
    setMobileView('detail');
    window.history.pushState({ view: 'detail' }, '', ''); // For browser back button
  }
};

// Back button handler
const handleBack = () => {
  setMobileView('list');
  setSelectedEmailId(null);
  window.history.back();
};

// Browser back button listener
useEffect(() => {
  const handlePopState = () => {
    if (mobileView === 'detail') {
      setMobileView('list');
      setSelectedEmailId(null);
    }
  };
  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, [mobileView]);
```

**Rendering**:
```typescript
<div className="grid grid-cols-1 md:grid-cols-[250px_1fr] lg:grid-cols-[250px_350px_1fr]">
  {/* Folder list: hidden on mobile */}
  <div className="hidden md:block">
    <FolderList />
  </div>

  {/* Email list: show on mobile unless detail is active */}
  <div className={cn('block md:block', isMobile && mobileView === 'detail' && 'hidden')}>
    <EmailList />
  </div>

  {/* Email detail: full screen on mobile when active */}
  <div className={cn('hidden lg:block', isMobile && mobileView === 'detail' && 'block')}>
    {isMobile && <MobileBackButton onClick={handleBack} />}
    <EmailDetail />
  </div>
</div>
```

### Rationale
- **Browser History Integration**: Native back button works, standard mobile UX pattern
- **Single Column State**: Simple boolean toggle, no complex routing needed
- **pushState (Not hash)**: Cleaner URLs, no `#detail` fragments
- **No Swipe Gestures**: Adds dependency (react-swipeable), not in requirements, can be future enhancement
- **Tailwind Breakpoints**: Reuses existing `md:` (768px) breakpoint, consistent with current responsive design

### Alternatives Considered
- **React Router Nested Routes**: Overcomplicated for simple list/detail toggle
- **Hash Navigation (#detail)**: Works but pollutes URL, harder to manage
- **No History Integration**: Browser back button navigates away from dashboard, poor UX
- **react-swipeable**: Adds 5KB dependency, requires gesture tuning, not essential
- **Separate Mobile Components**: Code duplication, harder to maintain

### Implementation Notes
- MobileBackButton: Arrow icon in top-left of EmailDetail, absolute positioned
- Orientation changes: CSS grid adapts automatically via Tailwind breakpoints
- Folder list on mobile: Add hamburger menu (future enhancement), not P1 requirement
- Keyboard navigation: Disable arrow keys in detail view on mobile (no list visible)
- Animation: Optional `transition-transform` slide effect when toggling views

---

## 7. Attachment Download Simulation

### Decision
Mock download using Blob URL with `<a download>` attribute, success toast message.

**Implementation**:
```typescript
// src/features/dashboard/hooks/useAttachmentDownload.ts
export function useAttachmentDownload() {
  const downloadAttachment = async (attachment: Attachment) => {
    try {
      // Simulate download with mock data
      const content = `Mock attachment content for ${attachment.filename}`;
      const blob = new Blob([content], { type: attachment.mimeType });
      const url = URL.createObjectURL(blob);

      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      setTimeout(() => URL.revokeObjectURL(url), 100);

      // Success message
      showSuccessToast(`Downloaded ${attachment.filename}`);
    } catch (error) {
      showErrorToast(`Failed to download ${attachment.filename}`);
    }
  };

  return { downloadAttachment };
}
```

**UI Integration**:
```typescript
// EmailDetail attachment section
<button onClick={() => downloadAttachment(attachment)}>
  <Download className="w-4 h-4" />
  Download
</button>
```

### Rationale
- **Blob URL**: Creates downloadable file from mock data, demonstrates browser download API
- **`<a download>` Attribute**: Standard HTML5 download, works across browsers
- **Temporary Link**: Creates and removes link dynamically, no permanent DOM pollution
- **URL Cleanup**: `revokeObjectURL` after download prevents memory leak
- **Toast Feedback**: User confirmation that download succeeded

### Alternatives Considered
- **window.open()**: Opens new tab instead of downloading, poor UX
- **Just Show Message**: "Download would start here" - less realistic demo
- **Fetch from Mock Server**: Requires setting up server, overcomplicated
- **Base64 Data URLs**: Less efficient than Blob URLs for larger files

### Implementation Notes
- Mock content: Generate random text or JSON based on file type
- File size: Match `attachment.size` in mock content (pad with dummy data)
- Error handling: Try/catch for blob creation failures
- Mobile: Test download behavior on iOS Safari (may open in new tab)
- Multiple downloads: Allow concurrent downloads (no rate limiting needed for demo)

---

## 8. Email Quoting

### Decision
Plain text quoting with "> " prefix for replies, HTML-style headers in forward, cursor positioned before quote.

**Reply Quoting**:
```typescript
// Reply body generation
function formatReplyBody(email: Email): string {
  const timestamp = new Date(email.timestamp).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  const sender = email.from.name || email.from.email;
  const quotedBody = email.body
    .split('\n')
    .map(line => `> ${line}`)
    .join('\n');

  return `\n\n---\nOn ${timestamp}, ${sender} wrote:\n${quotedBody}`;
}
```

**Forward Quoting**:
```typescript
// Forward body generation
function formatForwardBody(email: Email): string {
  const timestamp = formatFullDate(email.timestamp);
  const from = `${email.from.name} <${email.from.email}>`;
  const to = email.to.map(r => `${r.name || ''} <${r.email}>`).join(', ');
  const cc = email.cc?.length
    ? `\nCC: ${email.cc.map(r => `${r.name || ''} <${r.email}>`).join(', ')}`
    : '';

  return `\n\n---\nForwarded message:\nFrom: ${from}\nTo: ${to}${cc}\nDate: ${timestamp}\nSubject: ${email.subject}\n\n${email.body}`;
}
```

**Cursor Positioning**:
```typescript
// After form initializes
useEffect(() => {
  if (mode !== 'compose') {
    const textarea = document.querySelector('textarea[name="body"]');
    if (textarea) {
      textarea.setSelectionRange(0, 0); // Cursor at start (before quote)
      textarea.focus();
    }
  }
}, [mode]);
```

### Rationale
- **Plain Text Quoting**: Simpler than HTML, consistent with email body format (currently plain text)
- **"> " Prefix**: Standard email convention (RFC 3676), widely recognized
- **Headers in Forward**: Provides context (who sent, when, to whom), matches email client behavior
- **Cursor Before Quote**: User types new message first, quote is reference below
- **Separator "---"**: Visual distinction between new content and quoted content

### Alternatives Considered
- **HTML `<blockquote>`**: Requires switching to HTML email body, more complex rendering
- **No Quote Formatting**: Confusing, loses context of original message
- **Cursor After Quote**: Forces user to scroll up to write new content, poor UX
- **Include CC in Reply**: Non-standard, CC is for transparency not context

### Implementation Notes
- Reply All: Include original CC recipients in new CC field, exclude current user
- Nested quotes: Preserve existing "> " prefixes (reply to a reply)
- Long emails: Truncate quote after 100 lines (optional, prevents massive quote blocks)
- Attachments in forward: List attachment names in forwarded headers (actual forwarding not implemented)
- Character encoding: Ensure proper escaping for special characters in quotes

---

## Summary

All technical decisions align with project architecture and constitution principles:

- ✅ **Modal UX**: Radix Dialog provides accessible, keyboard-friendly modals
- ✅ **Form State**: React Hook Form + Zod leverages existing dependencies
- ✅ **Bulk Selection**: Set-based state for O(1) performance
- ✅ **Pagination**: Server-side pagination reuses existing mock service patterns
- ✅ **TanStack Query**: Optimistic updates + invalidation for responsive UX
- ✅ **Mobile Navigation**: Browser history integration, no new dependencies
- ✅ **Attachment Download**: Blob API demonstrates real browser download
- ✅ **Email Quoting**: Plain text formatting, standard conventions

**No new heavy dependencies** (only Radix Dialog, already peer dep of existing Radix components).

**Performance targets met**:
- Modal opens in <100ms (Radix is lightweight)
- Optimistic updates provide instant feedback
- Pagination renders 50 emails in <200ms

**Accessibility maintained**:
- Focus trap in modals
- Keyboard navigation (Escape, Tab, Enter)
- ARIA labels on checkboxes and buttons

Ready for Phase 1 (Data Model & Contracts).
