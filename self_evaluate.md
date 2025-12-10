## Information
- Hoàng Tiến Huy - 22120134
- Phan Thanh Tiến - 22120368
- Nguyễn Bùi Vương Tiễn - 22120370

## Deploy

Link FE: https://hcmus-awad-mail-project.netlify.app
Link BE: https://csc13114-backend.onrender.com/

## Self Evaluate

| Feature | Grading Criteria | Max Score | Our Score | Completeness |
|---------|-----------------|-----------|-----------|--------------|
| **I. Kanban Board Interface** | • The interface renders the board with distinct columns (flexible configuration allowed, e.g., Inbox, To Do, Done).<br>• Cards display real email data fetched from the backend (must include Sender, Subject, and Content snippet).<br>• The layout is organized and visually readable (Kanban style). | 25 | 25 | 100% |
| **II. Drag & Drop Functionality** | • Users can successfully drag a Card from one column to another.<br>• Dropping a Card triggers a Backend update to change the email's status.<br>• The UI updates the Card's position immediately without requiring a full page refresh. | 25 | 25 | 100% |
| **III. Snooze Feature** | • Selecting "Snooze" correctly removes/hides the Card from the active column (e.g., Inbox).<br>• The Card is successfully moved to a "Snoozed" state or column.<br>• Logic is implemented to "wake up" (restore) the email to the active view after the simulation/time passes. | 25 | 25 | 100% |
| **IV. AI Summary Generation** | • The backend successfully sends real email text to a processing API (LLM or library).<br>• The system returns a dynamically generated summary (no hardcoded/mock text allowed).<br>• The summary is clearly displayed on the Card or in a detailed view. | 25 | TBD | TBD% |
| **Total** | | **100** | **75+** | **75%+** |

## Feature Implementation Details

### I. Kanban Board Interface (25/25)
- ✅ **Distinct Columns**: Implemented 5 configurable columns - Inbox, To Do, In Progress, Done, Snoozed
- ✅ **Real Email Data**: Cards display:
  - Sender name/email (from Gmail API)
  - Subject line
  - Content preview snippet (first 150 characters)
- ✅ **Kanban Layout**:
  - Clean, modern UI with shadcn components
  - Horizontal scrolling for multiple columns
  - Vertical scrolling within each column
  - Color-coded column headers
  - Card count badges

**Implementation Files:**
- `frontend/src/features/dashboard/slices/kanban/components/KanbanBoardView.tsx`
- `frontend/src/features/dashboard/slices/kanban/components/KanbanBoard.tsx`
- `frontend/src/features/dashboard/slices/kanban/components/KanbanColumn.tsx`
- `frontend/src/features/dashboard/slices/kanban/components/KanbanCardItem.tsx`

### II. Drag & Drop Functionality (25/25)
- ✅ **Drag & Drop**: Implemented with @dnd-kit library
  - Smooth drag animations
  - Visual feedback during drag (opacity, rotation)
  - Drop zone highlighting
- ✅ **Backend Update**:
  - API call to `/kanban/cards/move` endpoint on drop
  - Updates email status in database
  - Persists changes across sessions
- ✅ **Optimistic UI Updates**:
  - Immediate card movement (no page refresh)
  - Rollback on error
  - Toast notifications for success/failure

**Implementation Files:**
- `frontend/src/features/dashboard/hooks/useKanbanBoard.ts` (mutation logic)
- `frontend/src/services/kanbanService.ts` (API calls)

### III. Snooze Feature (25/25)
- ✅ **Snooze Dialog**:
  - Quick presets (Later Today, Tomorrow, This Weekend, Next Week)
  - Custom date & time picker
  - Recurring snooze options (Daily, Weekly, Monthly)
  - Optional reason/note field
- ✅ **Card Movement**:
  - Snoozed emails move to dedicated "Snoozed" column
  - Backend creates snooze record with `snoozeUntil` timestamp
  - Original column/status preserved for restoration
- ✅ **Auto-Resume Logic**:
  - Backend cron job checks for expired snoozes
  - Automatically moves emails back to Inbox when time expires
  - Frontend polls every 60 seconds to reflect changes
  - Manual resume option available

**Implementation Files:**
- `frontend/src/features/dashboard/slices/email-detail/components/SnoozeDialog.tsx`
- `frontend/src/services/emailService.ts` (snooze API)
- `frontend/src/types/snooze.types.ts`

### IV. AI Summary Generation (TBD/25)
- ⏳ **Status**: To Be Determined
- **Expected Implementation**:
  - Backend integration with LLM API (e.g., OpenAI, Anthropic)
  - Real email content processing
  - Summary display in card preview or detail view

**Note**: This feature is pending implementation. Once completed, it should:
1. Send full email body to LLM API via backend
2. Generate concise summary (3-5 sentences)
3. Cache summaries to reduce API costs
4. Display summary in EmailDetail component

---

## Additional Features Implemented

### Previous Assignment Features
| Evaluation Criteria | Weight | Completeness |
|---------------------|--------|--------------|
| Gmail / IMAP correctness & security | 30% | 100% |
| Backend proxy & API correctness (mailbox and email endpoints) | 15% | 100% |
| Token handling & refresh logic (including concurrency handling) | 25% | 100% |
| Frontend UI: 3-column dashboard fidelity, accessibility | 15% | 100% |
| Deployment + README + demo | 10% | 100% |
| Code quality & error handling | 15% | 50% |

### Bonus Features
- 🎨 **Theme Support**: Light/Dark mode toggle
- 📧 **Email Actions**: Star, Delete, Mark Read/Unread
- 🔍 **Search**: Full-text search across emails
- ♿ **Accessibility**: ARIA labels, keyboard navigation
- 📱 **Responsive Design**: Mobile-friendly layout
- ⚡ **Performance**: Optimistic updates, caching, pagination

## Testing Instructions

### Test Kanban Board (Feature I)
1. Navigate to Kanban view
2. Verify 5 columns are displayed
3. Check that each card shows sender, subject, and preview

### Test Drag & Drop (Feature II)
1. Drag any card to a different column
2. Verify card moves immediately
3. Refresh page to confirm persistence

### Test Snooze (Feature III)
1. Click on any email card
2. Click the clock icon (⏰) in action bar
3. Select "Later Today" or custom time
4. Verify card moves to Snoozed column
5. Wait for snooze time to expire (or refresh after 60s)
6. Verify card returns to Inbox

### Test AI Summary (Feature IV)
- ⏳ Pending implementation

## Known Issues & Limitations
- Drag & drop may have minor visual glitches on some browsers
- Snooze auto-resume has up to 60-second delay due to polling interval
- AI summary feature not yet implemented

## Future Improvements
- WebSocket for real-time updates instead of polling
- Email threading/conversation view
- Attachment preview in cards
- Keyboard shortcuts for power users
- Bulk actions (select multiple cards)
