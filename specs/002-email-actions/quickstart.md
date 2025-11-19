# Quickstart Guide: Email Actions & Enhanced Dashboard

**Feature**: Email Actions & Enhanced Dashboard
**Date**: 2025-11-19
**Purpose**: Quick setup and testing guide for developers

---

## Table of Contents

1. [Development Setup](#development-setup)
2. [Running Locally](#running-locally)
3. [Testing Email Actions](#testing-email-actions)
4. [Mock Data Expansion](#mock-data-expansion)
5. [Testing Mobile Navigation](#testing-mobile-navigation)
6. [Troubleshooting](#troubleshooting)

---

## Development Setup

### Prerequisites

- Node.js 18+ and npm 9+
- Git
- Modern browser (Chrome, Firefox, Safari, or Edge)

### Installation Steps

1. **Clone and checkout the feature branch**:
   ```bash
   git clone <repository-url>
   cd hcmus-awad-g03
   git checkout 002-email-actions
   ```

2. **Install dependencies** (no new dependencies required):
   ```bash
   npm install
   ```

   Existing dependencies that support this feature:
   - React 19.2.0 (functional components + hooks)
   - TanStack Query 5.90.10 (server state management)
   - React Hook Form 7.66.1 (form validation)
   - Zod 4.1.12 (schema validation)
   - Radix UI (Dialog, Checkbox components)
   - Tailwind CSS 4.1.17 (styling)
   - Lucide React 0.554.0 (icons)

3. **Verify setup**:
   ```bash
   npm run dev
   ```

   Expected output:
   ```
   VITE v5.x.x  ready in xxx ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

---

## Running Locally

### Starting the Development Server

```bash
npm run dev
```

The application will be available at: `http://localhost:5173/`

### Login to Dashboard

1. Navigate to `http://localhost:5173/`
2. You'll be redirected to the login page: `/auth/login`
3. **Email/Password Login**:
   - Email: Any valid email format (e.g., `user@example.com`)
   - Password: Any string 8+ characters (e.g., `password123`)
4. **Google OAuth** (mock):
   - Click "Sign in with Google"
   - Mock OAuth flow will simulate login
5. After login, you'll be redirected to: `/inbox`

### Dashboard Layout

Once logged in, you'll see the three-column layout:

```
┌──────────────┬─────────────────────┬────────────────────┐
│  Folder List │    Email List       │   Email Detail     │
│              │                     │                    │
│  Inbox (5)   │  □ ⭐ Alice Johnson │  From: Alice       │
│  Starred     │  □    Bob Smith     │  To: John Doe      │
│  Sent        │  □    Carol White   │  CC: Bob, Carol    │
│  Drafts      │  [Compose] [⟳]     │                    │
│  Archive     │                     │  Subject: Project  │
│  Trash       │  Pagination: < 1 >  │                    │
│              │                     │  Body: ...         │
│              │                     │                    │
│              │                     │  [⭐] [↩️] [↪️] [⌫]  │
└──────────────┴─────────────────────┴────────────────────┘
```

---

## Testing Email Actions

### 1. Star/Unstar Email

**Test Steps**:
1. Navigate to `/inbox` (default after login)
2. Click any email in the list to view it
3. Click the **Star** button (⭐) in the email detail toolbar
4. **Expected**:
   - Star button shows filled star icon
   - Starred folder count increments (e.g., "Starred (4)")
   - Email list shows star indicator next to the email
5. Click the **Star** button again
6. **Expected**:
   - Star button shows outline star icon
   - Starred folder count decrements
   - Star indicator removed from email list

**Edge Case**: Star an email from the Trash folder
- **Expected**: Email is starred but remains in Trash

---

### 2. Mark as Unread

**Test Steps**:
1. Open a read email (not bold in list)
2. Click **Mark as Unread** button in email detail toolbar
3. **Expected**:
   - Email appears bold in the email list
   - Folder unread count increments (e.g., "Inbox (6)")
   - Email detail pane still shows the email (doesn't close)

**Edge Case**: Mark an already unread email as unread
- **Expected**: No change (button may be disabled)

---

### 3. Delete Email

**Test Steps**:
1. Open any email
2. Click **Delete** button (trash icon) in email detail toolbar
3. **Expected**:
   - Email is removed from current folder view
   - Email appears in Trash folder
   - Next email in list is automatically selected
   - If it was the last email, detail pane shows "Select an email to view details"

**Edge Case**: Delete the last email in a folder
- **Expected**: Detail pane shows empty state

**Edge Case**: Delete an email from Trash
- **Expected**: Email is permanently deleted (not moved again)

---

### 4. Compose New Email

**Test Steps**:
1. Click **Compose** button in the email list toolbar (top-right area)
2. **Expected**: Modal dialog opens with empty form
3. Fill in the form:
   - **To**: `test@example.com` (required)
   - **Subject**: `Test Email` (required)
   - **Body**: `This is a test email.` (optional)
4. Click **Send**
5. **Expected**:
   - Modal closes
   - Success message appears briefly: "Email sent successfully"
   - New email appears in **Sent** folder
   - Sent folder count increments

**Validation Test**:
1. Click **Compose**
2. Leave **To** field empty
3. Click **Send**
4. **Expected**: Validation error: "At least one recipient is required"

**Cancel Test**:
1. Click **Compose**
2. Fill in some fields
3. Click **Cancel** or press **Escape**
4. **Expected**: Confirmation dialog: "You have unsaved changes. Discard draft?"
5. Click **Discard**
6. **Expected**: Modal closes without sending

---

### 5. Reply to Email

**Test Steps**:
1. Open any email (e.g., from Alice Johnson)
2. Click **Reply** button
3. **Expected**: Compose modal opens pre-filled:
   - **To**: Original sender email (e.g., `alice@example.com`)
   - **Subject**: `Re: [original subject]`
   - **Body**: Quoted original message:
     ```

     On 2025-11-18, Alice Johnson wrote:
     > Original message body...
     ```
4. Add your reply text at the top of the body
5. Click **Send**
6. **Expected**: Reply added to Sent folder

**Reply All Test**:
1. Open an email with multiple recipients and CC
2. Click **Reply All**
3. **Expected**:
   - **To** field includes original sender + all To recipients (excluding yourself)
   - **CC** field includes all original CC recipients (excluding yourself)

---

### 6. Forward Email

**Test Steps**:
1. Open any email
2. Click **Forward** button
3. **Expected**: Compose modal opens pre-filled:
   - **To**: Empty (user must specify)
   - **Subject**: `Fwd: [original subject]`
   - **Body**: Full quoted original email with headers:
     ```
     ---------- Forwarded message ---------
     From: Alice Johnson <alice@example.com>
     Date: 2025-11-18 14:30
     Subject: Project Update - Q4 2025
     To: John Doe <user@example.com>

     Original message body...
     ```
4. Add recipient: `forward@example.com`
5. Click **Send**
6. **Expected**: Forwarded email added to Sent folder

**With Attachments**:
- If original email has attachments, they appear in the compose modal
- **Mock behavior**: Attachments are referenced by ID (not actually uploaded)

---

### 7. Bulk Selection and Actions

**Select Multiple Emails**:
1. Check the checkbox next to 3 emails in the list
2. **Expected**:
   - Checkboxes show checked state
   - Selected emails have highlighted background
   - Bulk action toolbar appears or is enabled

**Bulk Delete**:
1. Select 3 emails using checkboxes
2. Click **Delete** button in the bulk action toolbar
3. **Expected**:
   - All 3 emails are removed from view
   - All 3 emails appear in Trash folder
   - Selection is cleared (checkboxes unchecked)

**Bulk Mark Read**:
1. Select 2 unread emails (bold in list)
2. Click **Mark Read** in bulk action toolbar
3. **Expected**:
   - Both emails no longer bold
   - Folder unread count decreases by 2

**Select All**:
1. Click **Select All** button in toolbar
2. **Expected**: All visible emails in current folder are checked
3. Click **Select All** again
4. **Expected**: All emails are unchecked (toggle behavior)

**Clear Selection on Folder Change**:
1. Select 2 emails in Inbox
2. Click **Sent** folder
3. **Expected**: Selection is cleared (no emails checked in Sent folder)

---

### 8. Pagination

**Requires Mock Data Expansion** (see [Mock Data Expansion](#mock-data-expansion))

**Test Steps**:
1. Expand mock data to 100+ emails (see section below)
2. Navigate to Inbox (should have 65+ emails)
3. **Expected**: Only first 50 emails are displayed (page 1)
4. Pagination controls appear at bottom: `< 1 2 > `
5. Click **Next** or **2**
6. **Expected**: Page 2 loads with next 15 emails (or 50 if dataset is larger)
7. Click **Previous**
8. **Expected**: Return to page 1

**Delete Last Email on Page**:
1. Navigate to last page (e.g., page 2 with only 1 email)
2. Select and delete that email
3. **Expected**: Automatically navigate to previous page (page 1)

---

### 9. Email Detail with CC Field

**Test Steps**:
1. Open an email with CC recipients (e.g., `msg-001` from mock data)
2. **Expected**:
   - **From**: Alice Johnson <alice@example.com>
   - **To**: John Doe <user@example.com>
   - **CC**: Bob Smith <bob@example.com>, Carol White <carol@example.com>
3. Open an email without CC recipients
4. **Expected**: No CC row is displayed (field is hidden)

---

### 10. Attachment Download

**Test Steps**:
1. Open an email with attachments (e.g., `msg-001`)
2. **Expected**: Attachment list appears:
   - Icon (based on MIME type)
   - Filename: `Q4-Report.pdf`
   - Size: `240 KB`
   - Download button (⬇️)
3. Click **Download** button
4. **Expected** (mock mode):
   - Success message: "Downloading Q4-Report.pdf..."
   - Browser may show a mock download or alert message

**Real Download** (if implemented):
- Browser initiates actual file download
- File saves to user's Downloads folder

---

## Mock Data Expansion

The default mock dataset has only 10-20 emails, which doesn't require pagination. To test pagination and bulk actions with larger datasets:

### Expand `src/data/mockEmails.json`

**Script to Generate 100+ Emails**:

Create a temporary script `scripts/generateMockEmails.js`:

```javascript
const fs = require('fs');

const baseEmail = {
  from: { email: "sender@example.com", name: "Test Sender" },
  to: [{ email: "user@example.com", name: "John Doe" }],
  body: "This is a test email body for pagination testing.",
  snippet: "This is a test email body for pagination testing.",
  isRead: false,
  isStarred: false,
  hasAttachments: false
};

const emails = [];
const folders = ['inbox', 'sent', 'starred', 'drafts', 'archive', 'trash'];
const distribution = {
  inbox: 65,
  sent: 30,
  starred: 0,  // Starred is a virtual folder (references emails in other folders)
  drafts: 5,
  archive: 10,
  trash: 5
};

let emailId = 1;

for (const [folder, count] of Object.entries(distribution)) {
  if (folder === 'starred') continue;  // Skip starred (virtual folder)

  for (let i = 0; i < count; i++) {
    const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);  // Last 30 days
    const hasCC = Math.random() > 0.7;  // 30% have CC
    const isUnread = folder === 'inbox' && Math.random() > 0.7;  // 30% unread in Inbox

    const email = {
      id: `msg-${String(emailId).padStart(3, '0')}`,
      mailboxId: folder,
      from: {
        email: `sender${emailId % 20}@example.com`,
        name: `Sender ${emailId % 20}`
      },
      to: [{ email: "user@example.com", name: "John Doe" }],
      ...(hasCC && {
        cc: [
          { email: `cc1@example.com`, name: `CC User 1` },
          { email: `cc2@example.com`, name: `CC User 2` }
        ]
      }),
      subject: `Email ${emailId} - Test Subject`,
      body: `This is the body of email ${emailId} for testing pagination and bulk actions.`,
      snippet: `This is the body of email ${emailId} for testing pagination...`,
      timestamp: date.toISOString(),
      isRead: !isUnread,
      isStarred: Math.random() > 0.85,  // 15% starred
      hasAttachments: Math.random() > 0.9  // 10% with attachments
    };

    if (email.hasAttachments) {
      email.attachments = [
        {
          id: `att-${emailId}`,
          filename: `Document-${emailId}.pdf`,
          size: Math.floor(Math.random() * 1000000) + 100000,  // 100KB - 1MB
          mimeType: "application/pdf",
          url: `/api/emails/${email.id}/attachments/att-${emailId}`
        }
      ];
    }

    emails.push(email);
    emailId++;
  }
}

// Sort by timestamp descending (newest first)
emails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

fs.writeFileSync('src/data/mockEmails.json', JSON.stringify(emails, null, 2));
console.log(`Generated ${emails.length} emails`);
```

**Run the Script**:
```bash
node scripts/generateMockEmails.js
```

**Expected Output**:
```
Generated 115 emails
```

**Verify**:
1. Restart dev server: `npm run dev`
2. Navigate to Inbox
3. **Expected**: Inbox shows "Inbox (65)" and pagination controls appear

---

## Testing Mobile Navigation

### Mobile Viewport Setup

**Option 1: Browser DevTools**:
1. Open Chrome DevTools (F12)
2. Click **Toggle Device Toolbar** (Ctrl+Shift+M)
3. Select a mobile device (e.g., iPhone 12 Pro - 390x844)

**Option 2: Responsive Design Mode** (Firefox):
1. Open Developer Tools (F12)
2. Click **Responsive Design Mode** (Ctrl+Shift+M)
3. Set viewport to 375x667 (iPhone SE)

### Mobile Test Steps

1. **Initial View** (mobile width < 768px):
   - **Expected**: Only email list is visible
   - Folders and email detail are hidden
   - Email list takes full width

2. **Tap an Email**:
   - **Expected**: Email detail view slides in full-screen
   - Back button (←) appears in top-left corner
   - Email list is hidden

3. **Tap Back Button**:
   - **Expected**: Return to email list view
   - Email detail is hidden

4. **Compose on Mobile**:
   - Click **Compose** button
   - **Expected**: Modal opens in mobile-optimized view
   - Form fields stack vertically
   - Keyboard interactions work correctly

5. **Bulk Selection on Mobile**:
   - Check multiple emails
   - **Expected**: Checkboxes and selection highlight work
   - Bulk action toolbar appears (may be at top or bottom)

6. **Pagination on Mobile**:
   - Navigate to a folder with multiple pages
   - **Expected**: Pagination controls are touch-friendly
   - Page navigation works correctly

---

## Troubleshooting

### Issue: Compose Modal Not Opening

**Symptoms**: Clicking "Compose" button does nothing

**Solutions**:
1. Check browser console for JavaScript errors
2. Verify Radix UI Dialog is properly installed:
   ```bash
   npm list @radix-ui/react-dialog
   ```
3. Check that modal component is properly imported in `EmailList.tsx`
4. Clear browser cache and hard reload (Ctrl+Shift+R)

---

### Issue: Checkboxes Not Appearing

**Symptoms**: No checkboxes visible next to emails in the list

**Solutions**:
1. Verify Radix UI Checkbox is installed:
   ```bash
   npm list @radix-ui/react-checkbox
   ```
2. Check that `EmailList.tsx` renders checkbox components
3. Inspect CSS: Ensure checkboxes aren't hidden by `display: none` or `visibility: hidden`
4. Check Tailwind classes: `hidden` class may be applied by mistake

---

### Issue: Pagination Not Showing

**Symptoms**: No pagination controls at bottom of email list

**Solutions**:
1. Verify mock data has more than 50 emails (see [Mock Data Expansion](#mock-data-expansion))
2. Check `GetEmailsResponse.pagination.totalPages` in browser DevTools Network tab
3. Ensure `PaginationControls.tsx` component is rendered conditionally:
   ```typescript
   {pagination.totalPages > 1 && <PaginationControls {...props} />}
   ```
4. Inspect CSS: Pagination controls may be off-screen or hidden

---

### Issue: Star Button Not Working

**Symptoms**: Clicking star button does nothing or shows error

**Solutions**:
1. Check browser console for errors (e.g., "Cannot read property 'id' of undefined")
2. Verify `useEmailActions` hook is properly implemented
3. Check TanStack Query mutation:
   ```bash
   # Open React Query DevTools (should be at bottom of page)
   # Look for mutation status: success, error, or loading
   ```
4. Verify `mockEmailService.updateEmail()` function exists and works
5. Check that email ID is valid and exists in mock data

---

### Issue: Bulk Delete Not Working

**Symptoms**: Clicking "Delete" with emails selected does nothing

**Solutions**:
1. Verify emails are actually selected (check `emailSelection.count > 0`)
2. Check that bulk delete handler is attached to the button
3. Verify `mockEmailService.bulkDelete()` function exists
4. Check browser console for errors
5. Ensure TanStack Query mutation is properly configured with cache invalidation

---

### Issue: Reply Modal Not Pre-Filling Data

**Symptoms**: Clicking "Reply" opens empty compose modal

**Solutions**:
1. Verify `replyToEmailId` prop is passed to `ComposeModal`
2. Check that `useCompose` hook properly fetches original email:
   ```typescript
   const originalEmail = useEmailDetail(replyToEmailId);
   ```
3. Verify pre-fill logic sets `to`, `subject`, and `body` fields
4. Check React Hook Form `defaultValues` or `setValue()` calls

---

### Issue: Mobile Back Button Not Showing

**Symptoms**: No back button visible on mobile when viewing email detail

**Solutions**:
1. Verify viewport width is < 768px (check DevTools)
2. Check that `MobileBackButton` component is rendered conditionally:
   ```typescript
   {isMobile && <MobileBackButton onClick={handleBack} />}
   ```
3. Ensure `isMobile` state is properly managed with `window.innerWidth` or `matchMedia`
4. Inspect CSS: Button may have `display: none` on mobile

---

### Issue: Attachment Download Not Working

**Symptoms**: Clicking download button does nothing

**Solutions**:
1. Verify attachment has valid `url` field in mock data
2. Check browser console for network errors (404)
3. For mock mode, ensure download handler shows success message:
   ```typescript
   alert(`Downloading ${attachment.filename}...`);
   ```
4. For real downloads, verify `<a download href={url}>` element is rendered
5. Check browser pop-up blocker (may block downloads)

---

### Issue: CC Field Not Displaying

**Symptoms**: Email with CC recipients doesn't show CC row

**Solutions**:
1. Verify email has `cc` field in mock data:
   ```json
   {
     "cc": [
       { "email": "bob@example.com", "name": "Bob Smith" }
     ]
   }
   ```
2. Check conditional rendering in `EmailDetail.tsx`:
   ```typescript
   {email.cc && email.cc.length > 0 && (
     <div>CC: {email.cc.map(c => c.name || c.email).join(', ')}</div>
   )}
   ```
3. Inspect CSS: CC row may be hidden or off-screen

---

### Issue: Validation Errors Not Showing

**Symptoms**: Can submit compose form with empty fields, no error messages

**Solutions**:
1. Verify Zod schema is defined and applied:
   ```typescript
   const schema = z.object({
     to: z.array(z.string().email()).min(1),
     subject: z.string().min(1)
   });
   ```
2. Check React Hook Form integration:
   ```typescript
   const { handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
   ```
3. Verify error messages are rendered:
   ```typescript
   {errors.to && <span>{errors.to.message}</span>}
   ```
4. Check browser console for validation errors

---

### General Debugging Tips

1. **Check Browser Console**: Most issues show JavaScript errors in console (F12)
2. **Use React DevTools**: Inspect component props and state
3. **Use React Query DevTools**: Check query/mutation status and cached data
4. **Network Tab**: Verify mock API calls are working (should show simulated delays)
5. **Clear State**: Logout and login again to reset in-memory state
6. **Hard Reload**: Clear cache with Ctrl+Shift+R (Chrome) or Cmd+Shift+R (Mac)
7. **Check TypeScript Errors**: Run `npm run type-check` (if configured)
8. **Check Linter**: Run `npm run lint` to catch common issues

---

## Next Steps

Once you've tested all the features:

1. **Run Tests** (if test framework is set up):
   ```bash
   npm test
   ```

2. **Build for Production**:
   ```bash
   npm run build
   ```

3. **Preview Production Build**:
   ```bash
   npm run preview
   ```

4. **Create Pull Request**:
   - Use `/speckit.taskstoissues` to generate GitHub issues (optional)
   - Create PR from `002-email-actions` to `main`
   - Reference functional requirements and acceptance scenarios in PR description

---

## Additional Resources

- **Spec Document**: `/specs/002-email-actions/spec.md` (user scenarios and requirements)
- **Implementation Plan**: `/specs/002-email-actions/plan.md` (technical approach)
- **Data Model**: `/specs/002-email-actions/data-model.md` (entity definitions)
- **API Contracts**: `/specs/002-email-actions/contracts/email-actions-api.yaml` (OpenAPI spec)
- **Project Constitution**: `/constitution.md` (coding standards and principles)

---

## Contact

For questions or issues, contact the development team or open an issue in the repository.

Happy coding!
