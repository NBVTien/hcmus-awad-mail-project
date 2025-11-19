# Feature Specification: Email Actions & Enhanced Dashboard

**Feature Branch**: `002-email-actions`
**Created**: 2025-11-19
**Status**: Draft
**Input**: User description: "Add email actions: compose, reply, forward, delete, star/unstar, mark read/unread, checkboxes, pagination, CC field display, and mobile back button navigation"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Email Viewing Actions (Priority: P1)

An authenticated user viewing an email in the detail pane wants to take action on that email. They can star/unstar the email to mark it as important, mark it as unread for later review, or delete it to remove it from the current folder. These actions update the email's state immediately and are reflected in the folder list and email list.

**Why this priority**: These are the most fundamental email actions that users expect in any email client. Without these, the dashboard is read-only and provides minimal value. Star and delete are essential for email management.

**Independent Test**: Can be fully tested by opening an email, clicking each action button (star, mark unread, delete), and verifying the email state changes in the UI (starred count updates, email marked unread, email removed from view).

**Acceptance Scenarios**:

1. **Given** a user is viewing an email in the detail pane, **When** they click the "Star" button, **Then** the email is marked as starred, the button shows filled star icon, and the Starred folder unread count increments
2. **Given** a user is viewing a starred email, **When** they click the "Star" button again, **Then** the email is unmarked, the button shows empty star icon, and the Starred folder count decrements
3. **Given** a user is viewing a read email, **When** they click "Mark as Unread", **Then** the email is marked unread, appears bold in the email list, and the folder unread count increments
4. **Given** a user is viewing an email, **When** they click "Delete", **Then** the email is moved to Trash folder, removed from current view, and the next email in the list is selected automatically
5. **Given** a user deletes the last email in a folder, **When** the delete completes, **Then** the email detail pane shows the empty state "Select an email to view details"

---

### User Story 2 - Email Composition (Priority: P1)

An authenticated user wants to compose a new email. They click the "Compose" button in the email list toolbar, which opens a modal dialog with fields for recipient (To), subject, and body. They can fill in these fields, send the email (which adds it to the Sent folder), or cancel to close the modal without sending.

**Why this priority**: Compose is a core email functionality. While the demo uses mock data, showing a functional compose flow demonstrates understanding of email client workflows and modal interactions.

**Independent Test**: Can be fully tested by clicking "Compose", filling in the form fields (To, Subject, Body), clicking "Send", and verifying a new email appears in the Sent folder with the entered data.

**Acceptance Scenarios**:

1. **Given** a user is on the email dashboard, **When** they click "Compose" in the toolbar above the email list, **Then** a modal dialog opens with empty fields for To, Subject, and Body
2. **Given** the compose modal is open with valid data entered, **When** the user clicks "Send", **Then** the email is added to the Sent folder, the modal closes, and a success message is shown briefly
3. **Given** the compose modal is open, **When** the user clicks "Cancel" or presses Escape, **Then** the modal closes without sending and no data is saved
4. **Given** the compose modal is open, **When** the user tries to send without filling required fields (To, Subject), **Then** validation errors are shown for empty required fields
5. **Given** the compose modal is open, **When** the user enters an invalid email format in the To field, **Then** a validation error indicates invalid email format

---

### User Story 3 - Email Reply Actions (Priority: P2)

An authenticated user viewing an email wants to respond to it. They can click "Reply" to respond to just the sender, or "Reply All" to respond to all recipients including CC. The compose modal opens pre-filled with the original sender(s) in the To field, the subject prefixed with "Re:", and the original email quoted in the body.

**Why this priority**: Reply is a fundamental email action, but it's secondary to viewing and basic actions. It builds on the compose functionality and requires additional logic for pre-filling fields.

**Independent Test**: Can be fully tested by opening an email, clicking "Reply", verifying the modal opens with pre-filled To field (original sender), subject with "Re:" prefix, and quoted original message in the body. Sending adds the reply to Sent folder.

**Acceptance Scenarios**:

1. **Given** a user is viewing an email from sender@example.com with subject "Meeting Tomorrow", **When** they click "Reply", **Then** the compose modal opens with To: sender@example.com, Subject: "Re: Meeting Tomorrow", and the original email quoted in the body
2. **Given** a user is viewing an email sent to multiple recipients including CC, **When** they click "Reply All", **Then** the compose modal opens with all original recipients (To and CC) in the appropriate fields, excluding the current user
3. **Given** the reply modal is open with pre-filled data, **When** the user modifies the body and clicks "Send", **Then** the reply is sent and added to the Sent folder with the modified content
4. **Given** a user clicks "Reply" on an email, **When** they send the reply, **Then** the original email remains in its current state (read status, starred status unchanged)

---

### User Story 4 - Email Forwarding (Priority: P2)

An authenticated user viewing an email wants to share it with other recipients. They click "Forward", which opens the compose modal with an empty To field, the subject prefixed with "Fwd:", and the original email's full content (including headers like From, To, Date) quoted in the body. They can add recipients and send the forwarded email.

**Why this priority**: Forwarding is a standard email action but less frequently used than reply. It's useful for demonstrating a complete email client but not critical for core functionality.

**Independent Test**: Can be fully tested by opening an email, clicking "Forward", verifying the modal opens with an empty To field, "Fwd:" prefixed subject, and the full original email (with From/To/Date headers) quoted in the body. Sending adds it to Sent folder.

**Acceptance Scenarios**:

1. **Given** a user is viewing an email with subject "Project Update", **When** they click "Forward", **Then** the compose modal opens with an empty To field, Subject: "Fwd: Project Update", and the original email fully quoted with headers (From, To, Date) in the body
2. **Given** the forward modal is open, **When** the user enters one or more recipients and clicks "Send", **Then** the forwarded email is sent and added to the Sent folder
3. **Given** a forwarded email contains attachments in the original email, **When** the forward modal opens, **Then** the attachments are listed in the compose modal (note: actual file forwarding is optional for mock demo)

---

### User Story 5 - Bulk Email Selection and Actions (Priority: P3)

An authenticated user viewing a list of emails wants to perform actions on multiple emails at once. They can check the checkbox next to each email to select it, or click "Select All" to select all visible emails. Once emails are selected, they can click toolbar actions like "Delete" or "Mark Read/Unread" to apply the action to all selected emails at once.

**Why this priority**: Bulk actions improve efficiency for power users managing many emails, but they're not essential for basic email functionality. They require additional state management for selection tracking.

**Independent Test**: Can be fully tested by checking multiple email checkboxes, clicking "Delete" in the toolbar, and verifying all selected emails are moved to Trash. Alternatively, click "Select All", then "Mark Read", and verify all emails in the list are marked read.

**Acceptance Scenarios**:

1. **Given** a user is viewing the email list, **When** they check the checkbox next to an email, **Then** the email is visually highlighted as selected and the checkbox shows checked state
2. **Given** multiple emails are selected, **When** the user clicks "Delete" in the toolbar, **Then** all selected emails are moved to Trash and removed from the current view
3. **Given** no emails are selected, **When** the user clicks "Select All" in the toolbar, **Then** all visible emails in the current folder are selected with checkboxes checked
4. **Given** all emails are selected, **When** the user clicks "Select All" again, **Then** all emails are deselected (toggle behavior)
5. **Given** multiple unread emails are selected, **When** the user clicks "Mark Read" in the toolbar, **Then** all selected emails are marked as read, no longer appear bold, and the folder unread count decreases accordingly
6. **Given** emails are selected and the user changes folders, **When** the new folder's email list loads, **Then** the selection state is cleared (no emails selected in the new folder)

---

### User Story 6 - Enhanced Email Detail Display (Priority: P3)

An authenticated user viewing an email in the detail pane sees complete email metadata including CC recipients (if any) alongside From and To fields. If the email has attachments, each attachment shows a download button that initiates a file download when clicked.

**Why this priority**: CC display and attachment downloads are polish features that make the email client feel complete, but they don't affect core functionality. CC is informational, and attachment downloads can be simulated in a mock environment.

**Independent Test**: Can be fully tested by opening an email that has CC recipients and verifying the CC field appears in the detail pane. For attachments, click a download button and verify the browser initiates a download (or shows a simulated download in mock mode).

**Acceptance Scenarios**:

1. **Given** a user is viewing an email with CC recipients, **When** the email detail loads, **Then** a "CC:" row appears below the "To:" row displaying all CC recipients in the format "Name <email@example.com>"
2. **Given** a user is viewing an email without CC recipients, **When** the email detail loads, **Then** no CC row is displayed (not shown as empty)
3. **Given** a user is viewing an email with attachments, **When** they click the download button next to an attachment, **Then** the file download is initiated (or a simulated download message is shown in mock mode)
4. **Given** an attachment is downloading, **When** the download completes, **Then** a success message is shown briefly

---

### User Story 7 - Email List Pagination (Priority: P3)

An authenticated user viewing a folder with many emails sees a paginated list showing a limited number of emails per page (e.g., 20-50 emails). They can navigate between pages using pagination controls (Previous, Next, page numbers) at the bottom of the email list.

**Why this priority**: Pagination or virtualization is important for performance with large email volumes, but the mock demo has a small dataset (10-20 emails total). This is more relevant for production readiness than demo functionality.

**Independent Test**: Can be fully tested by expanding the mock email dataset to 100+ emails, loading a folder, and verifying only the first page of emails is displayed. Click "Next" and verify the second page of emails loads.

**Acceptance Scenarios**:

1. **Given** a folder contains more emails than the page size limit, **When** the user views the folder, **Then** only the first page of emails is displayed (e.g., 20 emails)
2. **Given** the user is on page 1 of a paginated email list, **When** they click "Next", **Then** page 2 loads showing the next set of emails
3. **Given** the user is on page 2 or higher, **When** they click "Previous", **Then** the previous page of emails loads
4. **Given** the user is viewing a paginated email list, **When** they click a specific page number (e.g., "3"), **Then** that page of emails loads
5. **Given** the user selects an email on page 2, **When** they delete it and the page becomes empty, **Then** the list automatically navigates to page 1 (or the previous page if page 1 is empty)

---

### User Story 8 - Mobile Responsive Navigation (Priority: P3)

An authenticated user accessing the dashboard on a mobile device sees a responsive layout that adapts to small screens. On mobile, only one column is visible at a time: the email list by default. When they tap an email, the detail view slides in with a back button in the header. Clicking the back button returns to the email list.

**Why this priority**: Mobile responsiveness is important for real-world use but not critical for an initial desktop-focused demo. The current implementation already uses responsive CSS classes; this adds explicit navigation controls for mobile.

**Independent Test**: Can be fully tested by resizing the browser window to mobile width (e.g., 375px), verifying only the email list is visible. Tap an email, verify the detail view appears with a back button. Tap the back button and verify the list view returns.

**Acceptance Scenarios**:

1. **Given** a user accesses the dashboard on a mobile device (viewport width < 768px), **When** the page loads, **Then** only the email list is visible, folders and detail pane are hidden
2. **Given** a mobile user is viewing the email list, **When** they tap on an email, **Then** the email detail view slides in full-screen with a back button (arrow icon) in the top-left corner
3. **Given** a mobile user is viewing an email detail, **When** they tap the back button, **Then** they return to the email list view
4. **Given** a mobile user is viewing an email detail, **When** they swipe right (optional enhancement), **Then** they return to the email list view
5. **Given** a mobile user has selected an email and is viewing its detail, **When** they rotate the device to landscape, **Then** the layout adapts gracefully (email detail remains visible)

---

### User Story 9 - Email List Refresh (Priority: P4)

An authenticated user viewing the email list wants to manually refresh the list to check for new emails. They click the "Refresh" button in the toolbar above the email list, which re-fetches the email data for the current folder and updates the list.

**Why this priority**: Manual refresh is a convenience feature for users who want to check for updates without automatic polling. In a mock demo with static data, this has minimal impact but demonstrates API refetching patterns.

**Independent Test**: Can be fully tested by clicking the "Refresh" button in the toolbar and verifying the email list shows a loading state briefly, then redisplays the emails (in mock mode, the same emails reload).

**Acceptance Scenarios**:

1. **Given** a user is viewing the email list, **When** they click "Refresh" in the toolbar, **Then** the email list shows a loading spinner briefly and then redisplays the refreshed list of emails
2. **Given** new emails were added to the folder (in mock mode, simulated), **When** the user clicks "Refresh", **Then** the new emails appear at the top of the list
3. **Given** the user has selected an email and is viewing its detail, **When** they click "Refresh", **Then** the email list refreshes and the currently selected email remains selected (if it still exists in the folder)

---

### Edge Cases

- **Delete last email in folder**: When the user deletes the only email in a folder or the last email on the current page, clear the detail pane and show the empty state "Select an email to view details"
- **Delete currently viewed email**: When the user deletes the email they are currently viewing, automatically select the next email in the list (or previous if it was the last) and display its detail
- **Compose modal with unsaved changes**: If the user has typed content in the compose modal and tries to close it, show a confirmation dialog: "You have unsaved changes. Discard draft?" with "Cancel" and "Discard" buttons
- **Reply to email with no sender**: If an email has no valid sender (edge case in mock data), disable the Reply button and show a tooltip "Cannot reply to this email"
- **Forward email with large attachments**: If forwarding an email with large attachments (>10MB total), show a warning message "Large attachments may take longer to send" (simulated in mock mode)
- **Bulk action with no selection**: If the user clicks "Delete" or "Mark Read" without selecting any emails, show a brief error message "No emails selected" or disable the buttons when selection is empty
- **Pagination edge case**: If the user is on the last page with only one email and deletes it, navigate to the previous page automatically
- **Star action fails**: If starring an email fails (network error in real implementation), show an error message "Failed to star email. Please try again." and revert the UI state
- **Mobile back button on list view**: If the user taps the device/browser back button while viewing an email detail on mobile, return to the email list (not navigate away from the dashboard)
- **Keyboard navigation with checkboxes**: When emails are selected via checkboxes, ensure keyboard navigation (arrow keys) still works and visually indicates focus separately from selection
- **Selecting email updates checkbox**: When the user clicks an email to view its detail, the checkbox should NOT automatically check (selection and viewing are separate actions)
- **Rapid clicking compose button**: If the user rapidly clicks "Compose" multiple times, only one modal should open (prevent duplicate modals)
- **Attachment download on mobile**: On mobile browsers, ensure attachment downloads work or show appropriate messages if downloads are restricted

## Requirements *(mandatory)*

### Functional Requirements

#### Email Actions - Individual Email

- **FR-001**: System MUST provide a "Star" toggle button in the email detail pane that marks/unmarks an email as starred
- **FR-002**: System MUST update the Starred folder's unread count when an email is starred or unstarred
- **FR-003**: System MUST visually indicate starred status with a filled star icon when starred, empty star icon when unstarred
- **FR-004**: System MUST provide a "Mark as Unread" button in the email detail pane that marks the current email as unread
- **FR-005**: System MUST update the folder's unread count and the email's bold styling in the list when marked unread
- **FR-006**: System MUST provide a "Delete" button in the email detail pane that moves the email to the Trash folder
- **FR-007**: System MUST remove the deleted email from the current view and automatically select the next email (or show empty state if none remain)
- **FR-008**: System MUST provide "Reply" button that opens compose modal pre-filled with original sender in To field, "Re:" prefixed subject, and quoted original message
- **FR-009**: System MUST provide "Reply All" button that opens compose modal with all original recipients (excluding current user) in To/CC fields
- **FR-010**: System MUST provide "Forward" button that opens compose modal with empty To field, "Fwd:" prefixed subject, and fully quoted original email including headers
- **FR-011**: System MUST disable Reply/Reply All buttons if the email has no valid sender

#### Email Composition

- **FR-012**: System MUST provide a "Compose" button in the email list toolbar that opens a modal dialog
- **FR-013**: Compose modal MUST include input fields for To (email addresses), Subject (text), and Body (multiline text)
- **FR-014**: System MUST validate To field contains at least one valid email address format before allowing send
- **FR-015**: System MUST validate Subject field is not empty before allowing send
- **FR-016**: System MUST display inline validation errors for empty required fields or invalid email formats
- **FR-017**: System MUST provide "Send" button that adds the composed email to the Sent folder and closes the modal
- **FR-018**: System MUST provide "Cancel" button or Escape key that closes the modal without sending
- **FR-019**: System MUST show confirmation dialog if user tries to close compose modal with unsaved changes
- **FR-020**: System MUST show a brief success message after successfully sending an email

#### Bulk Selection and Actions

- **FR-021**: System MUST display a checkbox next to each email in the email list
- **FR-022**: System MUST allow users to select/deselect individual emails by clicking their checkboxes
- **FR-023**: System MUST visually highlight selected emails with distinct background color or border
- **FR-024**: System MUST provide "Select All" button in toolbar that selects all visible emails in current folder
- **FR-025**: "Select All" MUST toggle behavior: if all are selected, clicking deselects all
- **FR-026**: System MUST provide "Delete" button in toolbar that moves all selected emails to Trash
- **FR-027**: System MUST provide "Mark Read" button in toolbar that marks all selected emails as read
- **FR-028**: System MUST provide "Mark Unread" button in toolbar that marks all selected emails as unread
- **FR-029**: System MUST disable bulk action buttons (Delete, Mark Read/Unread) when no emails are selected
- **FR-030**: System MUST clear selection state when user navigates to a different folder
- **FR-031**: System MUST show error message "No emails selected" if user clicks bulk action with empty selection

#### Email List Enhancements

- **FR-032**: System MUST display a star/important indicator icon in each email row in the email list (showing starred status)
- **FR-033**: System MUST provide "Refresh" button in toolbar that re-fetches email list for current folder
- **FR-034**: System MUST show loading spinner during refresh operation
- **FR-035**: System MUST maintain currently selected email after refresh (if it still exists in folder)
- **FR-036**: System MUST implement pagination when a folder contains more than 50 emails (page size: 20-50 emails)
- **FR-037**: System MUST provide pagination controls (Previous, Next, page numbers) at the bottom of email list
- **FR-038**: System MUST navigate to previous page automatically if current page becomes empty after deletion

#### Email Detail Enhancements

- **FR-039**: System MUST display "CC:" row in email detail pane when the email has CC recipients
- **FR-040**: System MUST NOT display CC row when email has no CC recipients (hide empty field)
- **FR-041**: System MUST format CC recipients as "Name <email@example.com>" consistently with From/To formatting
- **FR-042**: System MUST provide download button for each attachment in the email detail pane
- **FR-043**: System MUST initiate file download when user clicks attachment download button (or simulate in mock mode)
- **FR-044**: System MUST show brief success message after attachment download completes

#### Mobile Responsive Navigation

- **FR-045**: System MUST hide folder list and email detail pane on mobile viewports (width < 768px)
- **FR-046**: System MUST display only email list by default on mobile viewports
- **FR-047**: System MUST show email detail in full-screen view when user taps an email on mobile
- **FR-048**: System MUST display back button (arrow icon) in header of email detail on mobile
- **FR-049**: System MUST return to email list when user taps back button in mobile detail view
- **FR-050**: System MUST handle browser/device back button to return from detail to list on mobile

#### Error Handling and Edge Cases

- **FR-051**: System MUST show empty state "Select an email to view details" when no email is selected after deletion
- **FR-052**: System MUST prevent opening multiple compose modals from rapid clicking
- **FR-053**: System MUST show error message and revert UI if star/delete/mark action fails
- **FR-054**: System MUST maintain keyboard navigation focus separately from checkbox selection state
- **FR-055**: System MUST NOT automatically check email's checkbox when user clicks email to view detail

### Key Entities

- **Email**: Represents an email message with properties including id, from (sender), to (recipients), cc (optional CC recipients), subject, body, timestamp, read status (boolean), starred status (boolean), folder/mailbox (e.g., inbox, sent, trash), attachments (optional list), and snippet (preview text)
- **EmailDraft**: Represents a composed email with properties including to (list of email addresses), subject, body, and optionally cc, bcc, attachments. Created when user composes, replies, or forwards an email.
- **EmailSelection**: Represents the set of currently selected emails for bulk actions, tracked by a list of email IDs and a selection count
- **Attachment**: Represents a file attached to an email with properties including id, filename, file size (bytes), MIME type, and download URL (or mock URL in demo)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can star an email and see the Starred folder count update in under 1 second
- **SC-002**: Users can compose and send a new email in under 30 seconds (assuming pre-filled content)
- **SC-003**: Users can reply to an email with the compose modal opening and pre-filled in under 2 seconds
- **SC-004**: Users can delete a single email and see it removed from view in under 1 second
- **SC-005**: Users can select multiple emails and perform bulk delete in under 3 seconds for up to 20 emails
- **SC-006**: Users can navigate between pages of emails (when pagination is active) in under 1 second per page transition
- **SC-007**: Mobile users can view an email detail and return to the list using the back button with no navigation errors
- **SC-008**: 100% of action buttons (star, delete, reply, forward, mark unread) respond to clicks with visible feedback (loading state or immediate result)
- **SC-009**: 100% of compose modal validation errors display inline and clearly indicate which field needs correction
- **SC-010**: Users can refresh the email list and see updated content in under 2 seconds (including mock API delay)
- **SC-011**: Attachment download buttons are functional and either initiate downloads or show appropriate messages in 100% of cases
- **SC-012**: CC field displays correctly for all emails that have CC recipients, and does not display for emails without CC recipients
