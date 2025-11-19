# Data Model: Email Actions & Enhanced Dashboard

**Feature**: Email Actions & Enhanced Dashboard
**Date**: 2025-11-19
**Purpose**: Define entities, relationships, and validation rules for email actions

---

## Entity Definitions

### 1. Email (Extended)

**Description**: Individual email message with extended fields for CC recipients

**Fields**:
| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `id` | string (UUID) | Yes | Non-empty | Unique identifier |
| `mailboxId` | string | Yes | Valid mailbox ID | Foreign key to Mailbox |
| `from` | EmailAddress | Yes | Valid email address | Sender |
| `to` | EmailAddress[] | Yes | Non-empty array | Recipients |
| `cc` | EmailAddress[] | No | Array (can be empty) | CC recipients (NEW) |
| `subject` | string | Yes | - | Email subject (can be empty string) |
| `body` | string | Yes | - | Email body content (plain text or HTML) |
| `snippet` | string | Yes | Max 150 chars | Preview text for list view |
| `timestamp` | ISO 8601 timestamp | Yes | Valid date | When email was sent/received |
| `isRead` | boolean | Yes | true/false | Read status (mutable) |
| `isStarred` | boolean | Yes | true/false | Starred/flagged status (mutable) |
| `hasAttachments` | boolean | Yes | true/false | Whether email has attachments |
| `attachments` | Attachment[] | No | - | Optional attachment metadata |

**Changes from 001**:
- Added `cc` field: Array of EmailAddress objects (optional, can be empty)
- Explicitly marked `isRead` and `isStarred` as mutable for action operations

**Nested Type: EmailAddress**:
```typescript
{
  email: string;      // Valid email format
  name?: string;      // Optional display name
}
```

**State Transitions**:
- `isRead`: `false → true` (when email is opened or marked read via action)
- `isRead`: `true → false` (when user clicks "Mark as Unread" action)
- `isStarred`: `false → true` (when user clicks star button)
- `isStarred`: `true → false` (when user clicks star button again)
- `mailboxId`: `'inbox' → 'trash'` (when email is deleted)
- `mailboxId`: `'sent' → 'trash'` (when sent email is deleted)
- Note: Moving to trash is final in demo (no undo or permanent delete)

**Display Rules**:
- CC field: Show only when `cc` array is non-empty (length > 0)
- CC format: Display as "Name <email@example.com>" or just "email@example.com" if name is missing
- Star indicator: Show filled star icon when `isStarred = true`, outline star when `false`
- Unread indicator: Bold text in list view when `isRead = false`

**Sample Data**:
```typescript
{
  id: "msg-001",
  mailboxId: "inbox",
  from: {
    email: "alice@example.com",
    name: "Alice Johnson"
  },
  to: [
    {
      email: "user@example.com",
      name: "John Doe"
    }
  ],
  cc: [
    {
      email: "bob@example.com",
      name: "Bob Smith"
    },
    {
      email: "carol@example.com",
      name: "Carol White"
    }
  ],
  subject: "Project Update - Q4 2025",
  body: "Hi John,\n\nHere's the latest update...",
  snippet: "Hi John, Here's the latest update on the Q4 project...",
  timestamp: "2025-11-18T14:30:00Z",
  isRead: false,
  isStarred: true,
  hasAttachments: true,
  attachments: [
    {
      id: "att-001",
      filename: "Q4-Report.pdf",
      size: 245760,
      mimeType: "application/pdf",
      url: "/api/emails/msg-001/attachments/att-001"
    }
  ]
}
```

---

### 2. EmailDraft (New)

**Description**: Represents a composed email (new, reply, or forward) before sending

**Fields**:
| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `to` | string[] | Yes | At least 1 valid email | Recipients (comma-separated in UI) |
| `cc` | string[] | No | Valid emails or empty | CC recipients |
| `bcc` | string[] | No | Valid emails or empty | BCC recipients (hidden from other recipients) |
| `subject` | string | Yes | Non-empty | Email subject |
| `body` | string | No | Max 100KB | Email body (can be empty for replies) |
| `attachments` | File[] \| string[] | No | Max 10 files, 25MB total | Files to attach (or IDs for forwarding) |
| `replyToEmailId` | string (UUID) | No | Valid email ID | Set when replying to an email |
| `forwardEmailId` | string (UUID) | No | Valid email ID | Set when forwarding an email |

**Validation Rules**:
- `to` field: Must contain at least one valid email address
- Email format: Must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- `subject`: Cannot be empty string (frontend validation)
- `body`: Optional for replies (can be just quoted text)
- Mutually exclusive: `replyToEmailId` and `forwardEmailId` cannot both be set
- Attachment size: Individual files max 10MB, total max 25MB (frontend validation)
- Attachment count: Max 10 attachments

**Draft Types**:
1. **New Email**: All fields empty except user input
   ```typescript
   {
     to: [],
     cc: [],
     bcc: [],
     subject: "",
     body: "",
     attachments: []
   }
   ```

2. **Reply**: Pre-filled with original sender and quoted text
   ```typescript
   {
     to: ["alice@example.com"],  // Original sender
     cc: [],                      // Empty for Reply, populated for Reply All
     bcc: [],
     subject: "Re: Project Update - Q4 2025",
     body: "\n\nOn 2025-11-18, Alice Johnson wrote:\n> Original message...",
     attachments: [],             // Attachments not copied
     replyToEmailId: "msg-001"
   }
   ```

3. **Reply All**: Pre-filled with all original recipients (excluding current user)
   ```typescript
   {
     to: ["alice@example.com", "bob@example.com"],  // Original sender + To recipients
     cc: ["carol@example.com"],                      // Original CC recipients
     bcc: [],
     subject: "Re: Project Update - Q4 2025",
     body: "\n\nOn 2025-11-18, Alice Johnson wrote:\n> Original message...",
     attachments: [],
     replyToEmailId: "msg-001"
   }
   ```

4. **Forward**: Pre-filled with subject and full quoted email
   ```typescript
   {
     to: [],                      // User must specify recipients
     cc: [],
     bcc: [],
     subject: "Fwd: Project Update - Q4 2025",
     body: "---------- Forwarded message ---------\nFrom: Alice Johnson <alice@example.com>\nDate: 2025-11-18 14:30\nSubject: Project Update - Q4 2025\nTo: John Doe <user@example.com>\n\nOriginal message...",
     attachments: ["att-001"],    // Reference original attachments
     forwardEmailId: "msg-001"
   }
   ```

**Sample Data** (new compose):
```typescript
{
  to: ["bob@example.com"],
  cc: ["alice@example.com"],
  bcc: [],
  subject: "Meeting Agenda for Tomorrow",
  body: "Hi Bob,\n\nHere's the agenda for tomorrow's meeting:\n1. Project status\n2. Budget review\n3. Next steps\n\nSee you then!",
  attachments: []
}
```

---

### 3. EmailSelection (New)

**Description**: Tracks selected emails for bulk operations

**Fields**:
| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `selectedIds` | Set<string> | Yes | Valid email IDs | Set of selected email IDs |
| `selectAll` | boolean | Yes | true/false | Whether "Select All" is active |
| `count` | number | Yes | >= 0 | Number of selected emails |

**State Transitions**:
1. **Initial state**: Empty selection
   ```typescript
   {
     selectedIds: new Set(),
     selectAll: false,
     count: 0
   }
   ```

2. **User selects individual emails**: Add to set
   ```typescript
   // User clicks checkbox for msg-001
   {
     selectedIds: new Set(["msg-001"]),
     selectAll: false,
     count: 1
   }

   // User clicks checkbox for msg-002
   {
     selectedIds: new Set(["msg-001", "msg-002"]),
     selectAll: false,
     count: 2
   }
   ```

3. **User clicks "Select All"**: Select all visible emails
   ```typescript
   {
     selectedIds: new Set(["msg-001", "msg-002", "msg-003", ...]),  // All visible email IDs
     selectAll: true,
     count: 12  // Total emails in current view
   }
   ```

4. **User clicks "Select All" again**: Deselect all (toggle)
   ```typescript
   {
     selectedIds: new Set(),
     selectAll: false,
     count: 0
   }
   ```

5. **User changes folders**: Clear selection
   ```typescript
   // User navigates from Inbox to Sent folder
   {
     selectedIds: new Set(),
     selectAll: false,
     count: 0
   }
   ```

**Validation Rules**:
- `selectedIds` must contain only valid email IDs from current folder
- `count` must match `selectedIds.size`
- `selectAll` must be `true` only when all visible emails are selected

**Usage in Bulk Actions**:
```typescript
// Delete selected emails
if (emailSelection.count > 0) {
  await bulkDelete(Array.from(emailSelection.selectedIds));
  // Clear selection after action
  setEmailSelection({ selectedIds: new Set(), selectAll: false, count: 0 });
}

// Mark selected emails as read
if (emailSelection.count > 0) {
  await bulkMarkRead(Array.from(emailSelection.selectedIds));
}
```

**Sample Data**:
```typescript
{
  selectedIds: new Set(["msg-001", "msg-003", "msg-007"]),
  selectAll: false,
  count: 3
}
```

---

### 4. Attachment (Clarified)

**Description**: File attached to an email with metadata and download URL

**Fields**:
| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `id` | string | Yes | Non-empty | Unique identifier |
| `filename` | string | Yes | Non-empty, valid filename | Display name with extension |
| `size` | number | Yes | > 0 | File size in bytes |
| `mimeType` | string | Yes | Valid MIME type | e.g., "application/pdf", "image/png" |
| `url` | string | Yes | Valid URL or path | Download URL or mock path |

**Common MIME Types**:
- PDF: `application/pdf`
- Word: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Excel: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Images: `image/jpeg`, `image/png`, `image/gif`
- Text: `text/plain`, `text/csv`
- ZIP: `application/zip`

**Size Display**:
- < 1 KB: Display in bytes (e.g., "512 bytes")
- < 1 MB: Display in KB (e.g., "245 KB")
- >= 1 MB: Display in MB (e.g., "2.4 MB")

**Mock Download Behavior**:
- Generate blob URL from mock data or show download message
- Browser download API: `<a download href={url}>{filename}</a>`
- Success message after download starts: "Downloading {filename}..."

**Sample Data**:
```typescript
{
  id: "att-001",
  filename: "Q4-Report.pdf",
  size: 245760,  // 240 KB
  mimeType: "application/pdf",
  url: "/api/emails/msg-001/attachments/att-001"
}
```

**Multiple Attachments Example**:
```typescript
[
  {
    id: "att-001",
    filename: "Q4-Report.pdf",
    size: 245760,
    mimeType: "application/pdf",
    url: "/api/emails/msg-001/attachments/att-001"
  },
  {
    id: "att-002",
    filename: "Budget-2025.xlsx",
    size: 87654,
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    url: "/api/emails/msg-001/attachments/att-002"
  },
  {
    id: "att-003",
    filename: "Team-Photo.jpg",
    size: 1245789,
    mimeType: "image/jpeg",
    url: "/api/emails/msg-001/attachments/att-003"
  }
]
```

---

### 5. Pagination (Existing)

**Description**: Pagination metadata for email list (already exists in GetEmailsResponse)

**Fields**:
| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `page` | number | Yes | >= 1 | Current page number (1-indexed) |
| `limit` | number | Yes | 1-100 | Items per page |
| `total` | number | Yes | >= 0 | Total number of emails in folder |
| `totalPages` | number | Yes | >= 1 | Total number of pages |

**Calculation**:
```typescript
totalPages = Math.ceil(total / limit);
```

**Example Scenarios**:

1. **Small dataset** (no pagination needed):
   ```typescript
   {
     page: 1,
     limit: 50,
     total: 12,
     totalPages: 1
   }
   ```

2. **Large dataset** (pagination active):
   ```typescript
   // Page 1 of 3
   {
     page: 1,
     limit: 50,
     total: 123,
     totalPages: 3
   }

   // Page 2 of 3
   {
     page: 2,
     limit: 50,
     total: 123,
     totalPages: 3
   }

   // Page 3 of 3 (partial page)
   {
     page: 3,
     limit: 50,
     total: 123,
     totalPages: 3
   }
   // Page 3 would show 23 emails (123 - 100)
   ```

**Edge Cases**:
- Empty folder: `{ page: 1, limit: 50, total: 0, totalPages: 1 }`
- Delete last email on page: Navigate to previous page automatically
- Invalid page number: Clamp to `[1, totalPages]` range

**Pagination Controls**:
- Previous button: Disabled when `page === 1`
- Next button: Disabled when `page === totalPages`
- Page numbers: Show up to 5 page buttons with ellipsis for large ranges
  - Example: `1 ... 5 6 [7] 8 9 ... 15` (current page 7 of 15)

---

## Entity Relationships Diagram

```
┌─────────────┐
│   Mailbox   │
└──────┬──────┘
       │ 1:N
       ▼
┌─────────────┐
│    Email    │──────────┐
└──────┬──────┘          │
       │ 1:N             │ 1:1 (optional)
       ▼                 ▼
┌─────────────┐    ┌─────────────┐
│ Attachment  │    │ EmailDraft  │
└─────────────┘    └─────────────┘

┌─────────────────┐
│ EmailSelection  │ (UI state only, not persisted)
└─────────────────┘

┌─────────────┐
│ Pagination  │ (metadata in API response)
└─────────────┘
```

**Relationship Details**:
- **Mailbox → Email**: One-to-many (one mailbox contains many emails)
- **Email → Attachment**: One-to-many embedded (attachments are part of email document)
- **Email → EmailDraft**: One-to-one optional (draft can reference original email for reply/forward)
- **EmailSelection**: Independent UI state (tracks selected emails by ID)
- **Pagination**: Computed metadata (not a persistent entity)

---

## Validation Rules Summary

### Email Address Format
- **Regex**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Max length**: 254 characters
- **Case-insensitive**: `User@Example.com` === `user@example.com`

### Email Draft Validation
1. **Required fields**:
   - `to`: Must have at least one valid email address
   - `subject`: Cannot be empty string

2. **Optional fields**:
   - `cc`, `bcc`: Can be empty arrays
   - `body`: Can be empty (especially for forwards with attachments)
   - `attachments`: Can be empty array

3. **Attachment validation**:
   - Max 10 files per email
   - Max 25MB total size
   - Max 10MB per file
   - Supported types: Any MIME type (frontend may restrict)

4. **Mutual exclusivity**:
   - Cannot set both `replyToEmailId` and `forwardEmailId`
   - If `replyToEmailId` is set, `to` must contain original sender

### Email Selection Validation
- `selectedIds` must contain only IDs from current folder
- `count` must equal `selectedIds.size`
- Selection cleared when folder changes

### Pagination Validation
- `page` must be in range `[1, totalPages]`
- `limit` must be in range `[1, 100]`
- `totalPages` must equal `Math.ceil(total / limit)`

---

## State Management

### Email State Transitions

```
Email Life Cycle:
┌─────────┐
│ Compose │
└────┬────┘
     │ Send
     ▼
┌─────────┐     Star      ┌─────────┐
│  Unread ├──────────────>│ Starred │
│ Unstar  │<──────────────┤ Unread  │
└────┬────┘               └────┬────┘
     │ Read                    │ Read
     ▼                         ▼
┌─────────┐     Star      ┌─────────┐
│  Read   ├──────────────>│ Starred │
│ Unstar  │<──────────────┤  Read   │
└────┬────┘               └────┬────┘
     │                         │
     │ Delete                  │ Delete
     ▼                         ▼
┌─────────┐               ┌─────────┐
│ Trash   │               │ Trash   │
└─────────┘               └─────────┘
```

### Selection State Management

```typescript
// Component state (DashboardLayout)
const [emailSelection, setEmailSelection] = useState<EmailSelection>({
  selectedIds: new Set(),
  selectAll: false,
  count: 0
});

// Select single email
const toggleEmailSelection = (emailId: string) => {
  const newSelection = new Set(emailSelection.selectedIds);

  if (newSelection.has(emailId)) {
    newSelection.delete(emailId);
  } else {
    newSelection.add(emailId);
  }

  setEmailSelection({
    selectedIds: newSelection,
    selectAll: false,  // Disable selectAll when manually toggling
    count: newSelection.size
  });
};

// Select all emails
const toggleSelectAll = (allEmailIds: string[]) => {
  if (emailSelection.selectAll) {
    // Deselect all
    setEmailSelection({
      selectedIds: new Set(),
      selectAll: false,
      count: 0
    });
  } else {
    // Select all
    setEmailSelection({
      selectedIds: new Set(allEmailIds),
      selectAll: true,
      count: allEmailIds.length
    });
  }
};

// Clear selection on folder change
useEffect(() => {
  setEmailSelection({
    selectedIds: new Set(),
    selectAll: false,
    count: 0
  });
}, [currentMailboxId]);
```

---

## TypeScript Type Definitions

### Extended `src/types/email.types.ts`

```typescript
// Existing types (from 001)
export interface EmailAddress {
  email: string;
  name?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;  // Added for download
}

export interface Mailbox {
  id: string;
  name: string;
  icon?: string;
  unreadCount: number;
  totalCount: number;
  order: number;
  isSystem: boolean;
}

// Extended Email interface (added cc field)
export interface Email {
  id: string;
  mailboxId: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];  // NEW: Optional CC recipients
  subject: string;
  body: string;
  snippet: string;
  timestamp: string; // ISO 8601
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  attachments?: Attachment[];
}

export interface EmailListItem {
  id: string;
  from: EmailAddress;
  subject: string;
  snippet: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
}

export interface GetEmailsResponse {
  emails: Email[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetMailboxesResponse {
  mailboxes: Mailbox[];
}

export interface UpdateEmailRequest {
  isRead?: boolean;
  isStarred?: boolean;
}

// NEW types for email actions

export interface EmailDraft {
  to: string[];  // Email addresses as strings
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: File[] | string[];  // Files or attachment IDs
  replyToEmailId?: string;
  forwardEmailId?: string;
}

export interface EmailSelection {
  selectedIds: Set<string>;
  selectAll: boolean;
  count: number;
}

export interface BulkActionRequest {
  emailIds: string[];
  action: 'delete' | 'markRead' | 'markUnread';
}

export interface BulkActionResponse {
  updatedEmails: Email[];
  count: number;
}

export interface SendEmailResponse {
  email: Email;  // Email added to Sent folder
  success: boolean;
}
```

---

## Mock Data Expansion

### Extended `src/data/mockEmails.json`

Expand dataset to 100+ emails for pagination testing:

**Distribution**:
- Inbox: 65 emails (20 unread)
- Starred: 15 emails (references across folders)
- Sent: 30 emails
- Drafts: 5 emails
- Archive: 10 emails
- Trash: 5 emails

**Sample emails with CC field**:
```json
[
  {
    "id": "msg-001",
    "mailboxId": "inbox",
    "from": { "email": "alice@example.com", "name": "Alice Johnson" },
    "to": [{ "email": "user@example.com", "name": "John Doe" }],
    "cc": [
      { "email": "bob@example.com", "name": "Bob Smith" },
      { "email": "carol@example.com", "name": "Carol White" }
    ],
    "subject": "Project Update - Q4 2025",
    "body": "...",
    "snippet": "...",
    "timestamp": "2025-11-18T14:30:00Z",
    "isRead": false,
    "isStarred": true,
    "hasAttachments": true,
    "attachments": [
      {
        "id": "att-001",
        "filename": "Q4-Report.pdf",
        "size": 245760,
        "mimeType": "application/pdf",
        "url": "/api/emails/msg-001/attachments/att-001"
      }
    ]
  },
  {
    "id": "msg-002",
    "mailboxId": "inbox",
    "from": { "email": "dave@example.com", "name": "Dave Wilson" },
    "to": [{ "email": "user@example.com", "name": "John Doe" }],
    "subject": "Quick question",
    "body": "...",
    "snippet": "...",
    "timestamp": "2025-11-18T13:15:00Z",
    "isRead": true,
    "isStarred": false,
    "hasAttachments": false
  }
  // ... 98 more emails
]
```

---

## Summary

All entities align with functional requirements:
- Extended Email entity with `cc` field (FR-039, FR-040, FR-041)
- New EmailDraft entity for compose/reply/forward (FR-012 to FR-020)
- New EmailSelection entity for bulk operations (FR-021 to FR-031)
- Clarified Attachment entity with download URL (FR-042, FR-043, FR-044)
- Existing Pagination entity for email list (FR-036, FR-037, FR-038)
- All validation rules enforce data integrity
- State transitions define email lifecycle
- TypeScript types ensure type safety (Constitution II)
