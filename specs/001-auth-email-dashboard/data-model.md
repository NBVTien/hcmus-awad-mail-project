# Data Model: Authentication & Email Dashboard

**Feature**: Authentication & Email Dashboard
**Date**: 2025-11-19
**Purpose**: Define entities, relationships, and validation rules

---

## Entity Definitions

### 1. User

**Description**: Represents an authenticated user

**Fields**:
| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `id` | string (UUID) | Yes | Non-empty | Unique identifier |
| `email` | string | Yes | Valid email format | Primary identifier for email/password auth |
| `displayName` | string | Yes | Non-empty | User's full name |
| `profilePicture` | string (URL) \| null | No | Valid URL or null | Only populated for OAuth users |
| `authMethod` | enum | Yes | 'email' \| 'google' | How user authenticated |
| `createdAt` | ISO 8601 timestamp | Yes | Valid date | Account creation time |

**Relationships**:
- User has many Folders (implicit, via userId)
- User has many Emails (implicit, via userId)

**Sample Data**:
```typescript
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "user@example.com",
  displayName: "John Doe",
  profilePicture: null,
  authMethod: "email",
  createdAt: "2025-11-19T10:30:00Z"
}
```

---

### 2. AuthToken

**Description**: Authentication tokens for session management

**Fields**:
| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `accessToken` | string (JWT) | Yes | Valid JWT format | Short-lived (15 min), stored in-memory |
| `refreshToken` | string (JWT) | Yes | Valid JWT format | Long-lived (7 days), stored in localStorage |
| `expiresAt` | number (Unix timestamp) | Yes | Future timestamp | When access token expires |
| `tokenType` | string | Yes | Must be 'Bearer' | OAuth 2.0 token type |
| `scope` | string | No | Space-separated scopes | OAuth scopes granted |

**Lifecycle**:
1. Created on successful login/OAuth
2. Access token refreshed at 80% of lifetime (12 min)
3. Refresh token used to obtain new access token
4. Both cleared on logout or refresh failure

**Storage**:
- `accessToken`: In-memory (React context state)
- `refreshToken`: localStorage key `refresh_token`
- `expiresAt`: Calculated from JWT `exp` claim or stored timestamp

**Sample Data**:
```typescript
{
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  expiresAt: 1732019400, // Unix timestamp (15 min from issue)
  tokenType: "Bearer",
  scope: "read:emails read:profile"
}
```

---

### 3. Mailbox (Folder)

**Description**: Email folder/category

**Fields**:
| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `id` | string | Yes | Non-empty | Unique identifier |
| `name` | string | Yes | Non-empty | Display name (e.g., "Inbox") |
| `icon` | string | No | Valid icon name | Icon identifier for UI |
| `unreadCount` | number | Yes | >= 0 | Number of unread emails |
| `totalCount` | number | Yes | >= 0 | Total emails in folder |
| `order` | number | Yes | >= 0 | Display order (lower = higher) |
| `isSystem` | boolean | Yes | true/false | System folder (Inbox, Sent) vs custom |

**Predefined Folders**:
1. Inbox (order: 0)
2. Starred (order: 1)
3. Sent (order: 2)
4. Drafts (order: 3)
5. Archive (order: 4)
6. Trash (order: 5)
7. Custom folders (order: 100+)

**Relationships**:
- Mailbox has many Emails (one-to-many)

**Sample Data**:
```typescript
{
  id: "inbox",
  name: "Inbox",
  icon: "inbox",
  unreadCount: 5,
  totalCount: 12,
  order: 0,
  isSystem: true
}
```

---

### 4. Email

**Description**: Individual email message

**Fields**:
| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `id` | string (UUID) | Yes | Non-empty | Unique identifier |
| `mailboxId` | string | Yes | Valid mailbox ID | Foreign key to Mailbox |
| `from` | EmailAddress | Yes | Valid email address | Sender |
| `to` | EmailAddress[] | Yes | Non-empty array | Recipients |
| `subject` | string | Yes | - | Email subject (can be empty string) |
| `body` | string | Yes | - | Email body content (plain text or HTML) |
| `snippet` | string | Yes | Max 150 chars | Preview text for list view |
| `timestamp` | ISO 8601 timestamp | Yes | Valid date | When email was sent/received |
| `isRead` | boolean | Yes | true/false | Read status |
| `isStarred` | boolean | Yes | true/false | Starred/flagged status |
| `hasAttachments` | boolean | Yes | true/false | Whether email has attachments |
| `attachments` | Attachment[] | No | - | Optional attachment metadata |

**Nested Type: EmailAddress**:
```typescript
{
  email: string;      // Valid email format
  name?: string;      // Optional display name
}
```

**Nested Type: Attachment** (optional):
```typescript
{
  id: string;
  filename: string;
  mimeType: string;
  size: number;       // bytes
}
```

**Relationships**:
- Email belongs to one Mailbox
- Email sent by one User (sender)
- Email received by User(s) (recipients)

**State Transitions**:
- Unread → Read: User opens email
- Unstarred → Starred: User clicks star icon
- Inbox → Archive/Trash: User moves email (out of scope for demo)

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
  subject: "Project Update - Q4 2025",
  body: "Hi John,\n\nHere's the latest update on the Q4 project...",
  snippet: "Hi John, Here's the latest update on the Q4 project. We've completed the first milestone and are on track for...",
  timestamp: "2025-11-18T14:30:00Z",
  isRead: false,
  isStarred: false,
  hasAttachments: true,
  attachments: [
    {
      id: "att-001",
      filename: "Q4-Report.pdf",
      mimeType: "application/pdf",
      size: 245760
    }
  ]
}
```

---

## Mock Data Schema

### Mock Mailboxes (`src/data/mockFolders.json`)
```json
[
  { "id": "inbox", "name": "Inbox", "icon": "inbox", "unreadCount": 5, "totalCount": 12, "order": 0, "isSystem": true },
  { "id": "starred", "name": "Starred", "icon": "star", "unreadCount": 0, "totalCount": 3, "order": 1, "isSystem": true },
  { "id": "sent", "name": "Sent", "icon": "send", "unreadCount": 0, "totalCount": 2, "order": 2, "isSystem": true },
  { "id": "drafts", "name": "Drafts", "icon": "file-edit", "unreadCount": 0, "totalCount": 1, "order": 3, "isSystem": true },
  { "id": "archive", "name": "Archive", "icon": "archive", "unreadCount": 0, "totalCount": 1, "order": 4, "isSystem": true },
  { "id": "trash", "name": "Trash", "icon": "trash", "unreadCount": 0, "totalCount": 1, "order": 5, "isSystem": true }
]
```

**Total Folders**: 6 system folders

### Mock Emails (`src/data/mockEmails.json`)
```json
[
  {
    "id": "msg-001",
    "mailboxId": "inbox",
    "from": { "email": "alice@example.com", "name": "Alice Johnson" },
    "to": [{ "email": "user@example.com", "name": "John Doe" }],
    "subject": "Project Update - Q4 2025",
    "body": "...",
    "snippet": "...",
    "timestamp": "2025-11-18T14:30:00Z",
    "isRead": false,
    "isStarred": true,
    "hasAttachments": true,
    "attachments": [...]
  }
  // ... 19 more emails
]
```

**Total Emails**: 10-20 emails distributed as:
- Inbox: 12 emails (5 unread)
- Starred: 3 emails (references to emails in other folders)
- Sent: 2 emails
- Drafts: 1 email
- Archive: 1 email
- Trash: 1 email

**Data Distribution**:
- 5 unread emails total
- 3 starred emails
- 2 emails with attachments
- Timestamps within last 30 days
- Realistic sender/recipient names

---

## TypeScript Type Definitions

### `src/types/auth.types.ts`
```typescript
export type AuthMethod = 'email' | 'google';

export interface User {
  id: string;
  email: string;
  displayName: string;
  profilePicture: string | null;
  authMethod: AuthMethod;
  createdAt: string; // ISO 8601
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
  tokenType: 'Bearer';
  scope?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: AuthToken;
}
```

### `src/types/email.types.ts`
```typescript
export interface EmailAddress {
  email: string;
  name?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
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

export interface Email {
  id: string;
  mailboxId: string;
  from: EmailAddress;
  to: EmailAddress[];
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
```

---

## Validation Rules

### Email Format
- Must match regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Max length: 254 characters
- Case-insensitive for comparison

### JWT Token Format
- Must have 3 parts separated by `.` (header.payload.signature)
- Base64URL encoded
- Expiry claim (`exp`) must be present and in future

### Mailbox ID
- Lowercase alphanumeric + hyphens only
- System folders: predefined IDs (inbox, sent, etc.)
- Custom folders: UUID format

### Email Subject
- Max length: 500 characters (display truncated at 100 chars)
- Can be empty string

### Email Body
- Max length: 100KB (for demo purposes)
- Plain text or HTML (sanitized before display)

### Timestamps
- ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
- Must be valid date
- Display in user's local timezone

---

## Entity Relationships Diagram

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ (implicit)
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│  AuthToken  │    │   Mailbox   │
└─────────────┘    └──────┬──────┘
                          │ 1:N
                          ▼
                   ┌─────────────┐
                   │    Email    │
                   └─────────────┘
```

**Notes**:
- User-to-Mailbox: Implicit relationship (mailboxes belong to authenticated user)
- User-to-AuthToken: 1:1 relationship (one active token per user session)
- Mailbox-to-Email: 1:N relationship (one mailbox contains many emails)
- Email-to-Attachments: 1:N embedded relationship (attachments are part of email document)

---

## Summary

All entities align with functional requirements:
- ✅ User entity supports email/password + OAuth (FR-003, FR-004)
- ✅ AuthToken entity implements 15-min access + refresh strategy (FR-007, FR-027)
- ✅ Mailbox entity supports folder navigation with unread counts (FR-017, FR-020)
- ✅ Email entity supports three-column dashboard layout (FR-016, FR-018, FR-019)
- ✅ Mock data provides 10-20 emails across 6 folders (as clarified)
- ✅ TypeScript types ensure type safety (Constitution II)
