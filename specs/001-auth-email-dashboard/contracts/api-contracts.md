# API Contracts: Authentication & Email Dashboard

**Feature**: Authentication & Email Dashboard
**Date**: 2025-11-19
**Purpose**: Define mock API endpoints and request/response contracts

---

## Overview

This document specifies the mock API contracts for the email dashboard application. All endpoints will be implemented as mock services with simulated delays (200-500ms).

**Base URL**: N/A (mock implementation)
**Authentication**: Bearer token in `Authorization` header (for protected endpoints)
**Content-Type**: `application/json`

---

## Authentication Endpoints

### POST /auth/login

**Description**: Authenticate user with email and password

**Authentication**: None (public endpoint)

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Request Schema**:
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | Valid email format |
| `password` | string | Yes | Min 8 characters |

**Response (200 OK)**:
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "displayName": "John Doe",
    "profilePicture": null,
    "authMethod": "email",
    "createdAt": "2025-11-19T10:30:00Z"
  },
  "token": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": 1732019400,
    "tokenType": "Bearer",
    "scope": "read:emails read:profile"
  }
}
```

**Error Responses**:
```json
// 400 Bad Request - Invalid email format
{
  "error": "INVALID_EMAIL",
  "message": "Invalid email format"
}

// 401 Unauthorized - Invalid credentials
{
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}

// 500 Internal Server Error - Network/server error
{
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred"
}
```

**Mock Behavior**:
- Accept any email/password combination with length >= 8 for demo
- Generate mock JWT tokens
- Delay: 200-500ms

---

### POST /auth/google

**Description**: Initiate Google OAuth flow (returns authorization URL)

**Authentication**: None (public endpoint)

**Request**:
```json
{
  "redirectUri": "http://localhost:5173/auth/callback"
}
```

**Response (200 OK)**:
```json
{
  "authorizationUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&scope=...&state=...&code_challenge=...&code_challenge_method=S256",
  "state": "random-state-string",
  "codeVerifier": "random-code-verifier"
}
```

**Mock Behavior**:
- Generate mock OAuth URL
- Return state and code_verifier for PKCE flow
- Client will redirect to this URL
- Delay: 100-200ms

---

### POST /auth/google/callback

**Description**: Exchange Google OAuth code for tokens

**Authentication**: None (public endpoint)

**Request**:
```json
{
  "code": "4/0AfJohXm...",
  "state": "random-state-string",
  "codeVerifier": "random-code-verifier"
}
```

**Response (200 OK)**:
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "user@gmail.com",
    "displayName": "Jane Smith",
    "profilePicture": "https://lh3.googleusercontent.com/...",
    "authMethod": "google",
    "createdAt": "2025-11-19T10:35:00Z"
  },
  "token": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": 1732019400,
    "tokenType": "Bearer",
    "scope": "read:emails read:profile"
  }
}
```

**Error Responses**:
```json
// 400 Bad Request - Invalid state (CSRF protection)
{
  "error": "INVALID_STATE",
  "message": "Invalid state parameter"
}

// 401 Unauthorized - Invalid/expired code
{
  "error": "INVALID_CODE",
  "message": "Invalid or expired authorization code"
}
```

**Mock Behavior**:
- Accept any code/state combination for demo
- Generate mock user with Google profile picture
- Delay: 300-500ms (simulate OAuth exchange)

---

### POST /auth/refresh

**Description**: Refresh access token using refresh token

**Authentication**: None (but requires refresh token in body)

**Request**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": 1732020300,
  "tokenType": "Bearer"
}
```

**Error Responses**:
```json
// 401 Unauthorized - Invalid/expired refresh token
{
  "error": "INVALID_REFRESH_TOKEN",
  "message": "Invalid or expired refresh token"
}
```

**Mock Behavior**:
- Accept any non-empty refresh token for demo
- Generate new access token
- Delay: 100-300ms

---

### POST /auth/logout

**Description**: Invalidate refresh token (logout)

**Authentication**: Bearer token required

**Request**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (204 No Content)**:
```
(empty body)
```

**Error Responses**:
```json
// 401 Unauthorized - Missing/invalid access token
{
  "error": "UNAUTHORIZED",
  "message": "Missing or invalid access token"
}
```

**Mock Behavior**:
- Accept any request with valid bearer token
- No actual state change (stateless demo)
- Delay: 50-100ms

---

## Mailbox Endpoints

### GET /mailboxes

**Description**: Get list of all mailboxes/folders

**Authentication**: Bearer token required

**Request**: None (query parameters)

**Response (200 OK)**:
```json
{
  "mailboxes": [
    {
      "id": "inbox",
      "name": "Inbox",
      "icon": "inbox",
      "unreadCount": 5,
      "totalCount": 12,
      "order": 0,
      "isSystem": true
    },
    {
      "id": "starred",
      "name": "Starred",
      "icon": "star",
      "unreadCount": 0,
      "totalCount": 3,
      "order": 1,
      "isSystem": true
    },
    {
      "id": "sent",
      "name": "Sent",
      "icon": "send",
      "unreadCount": 0,
      "totalCount": 2,
      "order": 2,
      "isSystem": true
    }
    // ... more mailboxes
  ]
}
```

**Error Responses**:
```json
// 401 Unauthorized
{
  "error": "UNAUTHORIZED",
  "message": "Missing or invalid access token"
}
```

**Mock Behavior**:
- Return all mailboxes from `mockFolders.json`
- Delay: 200-400ms

---

### GET /mailboxes/:id/emails

**Description**: Get emails for a specific mailbox

**Authentication**: Bearer token required

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Mailbox ID (e.g., "inbox") |

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (1-indexed) |
| `limit` | number | No | 50 | Items per page (max 100) |
| `unreadOnly` | boolean | No | false | Filter unread emails only |

**Request Example**:
```
GET /mailboxes/inbox/emails?page=1&limit=50&unreadOnly=false
```

**Response (200 OK)**:
```json
{
  "emails": [
    {
      "id": "msg-001",
      "from": {
        "email": "alice@example.com",
        "name": "Alice Johnson"
      },
      "subject": "Project Update - Q4 2025",
      "snippet": "Hi John, Here's the latest update on the Q4 project...",
      "timestamp": "2025-11-18T14:30:00Z",
      "isRead": false,
      "isStarred": true,
      "hasAttachments": true
    }
    // ... more emails
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 12,
    "totalPages": 1
  }
}
```

**Error Responses**:
```json
// 401 Unauthorized
{
  "error": "UNAUTHORIZED",
  "message": "Missing or invalid access token"
}

// 404 Not Found - Invalid mailbox ID
{
  "error": "MAILBOX_NOT_FOUND",
  "message": "Mailbox not found"
}
```

**Mock Behavior**:
- Filter emails by `mailboxId` from `mockEmails.json`
- Apply `unreadOnly` filter if specified
- Return paginated results (all on page 1 for demo with 10-20 emails)
- Delay: 200-500ms

---

### GET /emails/:id

**Description**: Get full email details

**Authentication**: Bearer token required

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Email ID (e.g., "msg-001") |

**Request Example**:
```
GET /emails/msg-001
```

**Response (200 OK)**:
```json
{
  "id": "msg-001",
  "mailboxId": "inbox",
  "from": {
    "email": "alice@example.com",
    "name": "Alice Johnson"
  },
  "to": [
    {
      "email": "user@example.com",
      "name": "John Doe"
    }
  ],
  "subject": "Project Update - Q4 2025",
  "body": "Hi John,\n\nHere's the latest update on the Q4 project. We've completed the first milestone and are on track for delivery by end of December.\n\nKey highlights:\n- Feature A completed\n- Testing phase started\n- Documentation in progress\n\nLet me know if you have any questions.\n\nBest regards,\nAlice",
  "snippet": "Hi John, Here's the latest update on the Q4 project...",
  "timestamp": "2025-11-18T14:30:00Z",
  "isRead": true,
  "isStarred": true,
  "hasAttachments": true,
  "attachments": [
    {
      "id": "att-001",
      "filename": "Q4-Report.pdf",
      "mimeType": "application/pdf",
      "size": 245760
    }
  ]
}
```

**Error Responses**:
```json
// 401 Unauthorized
{
  "error": "UNAUTHORIZED",
  "message": "Missing or invalid access token"
}

// 404 Not Found - Invalid email ID
{
  "error": "EMAIL_NOT_FOUND",
  "message": "Email not found"
}
```

**Mock Behavior**:
- Find email by ID in `mockEmails.json`
- Mark as read (`isRead = true`) when fetched
- Return full email details including body and attachments
- Delay: 200-400ms

---

### PATCH /emails/:id

**Description**: Update email properties (read status, starred status)

**Authentication**: Bearer token required

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Email ID (e.g., "msg-001") |

**Request**:
```json
{
  "isRead": true,
  "isStarred": false
}
```

**Request Schema**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `isRead` | boolean | No | Mark as read/unread |
| `isStarred` | boolean | No | Star/unstar email |

**Response (200 OK)**:
```json
{
  "id": "msg-001",
  "isRead": true,
  "isStarred": false
}
```

**Error Responses**:
```json
// 401 Unauthorized
{
  "error": "UNAUTHORIZED",
  "message": "Missing or invalid access token"
}

// 404 Not Found
{
  "error": "EMAIL_NOT_FOUND",
  "message": "Email not found"
}

// 400 Bad Request - Invalid field
{
  "error": "INVALID_FIELD",
  "message": "Invalid field in request body"
}
```

**Mock Behavior**:
- Update email in mock data (in-memory only, not persisted)
- Return updated fields
- Delay: 100-200ms

---

## Error Handling

### Standard Error Response Format

All error responses follow this structure:
```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    // Optional additional context
  }
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET/PATCH/POST |
| 204 | No Content | Successful DELETE (logout) |
| 400 | Bad Request | Invalid request body/params |
| 401 | Unauthorized | Missing/invalid auth token |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Unexpected error |

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_EMAIL` | 400 | Email format validation failed |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `INVALID_STATE` | 400 | OAuth state mismatch |
| `INVALID_CODE` | 401 | OAuth code invalid/expired |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token invalid/expired |
| `UNAUTHORIZED` | 401 | Missing or invalid access token |
| `MAILBOX_NOT_FOUND` | 404 | Mailbox ID not found |
| `EMAIL_NOT_FOUND` | 404 | Email ID not found |
| `INVALID_FIELD` | 400 | Invalid field in request |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Mock Implementation Notes

### Mock Service Structure

```typescript
// src/services/mockAuthService.ts
export const mockAuthService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    await delay(randomBetween(200, 500));

    if (!isValidEmail(email)) {
      throw new ApiError('INVALID_EMAIL', 'Invalid email format', 400);
    }

    if (password.length < 8) {
      throw new ApiError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    return {
      user: generateMockUser(email, 'email'),
      token: generateMockTokens()
    };
  },

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    await delay(randomBetween(100, 300));

    if (!refreshToken) {
      throw new ApiError('INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token', 401);
    }

    return {
      accessToken: generateAccessToken(),
      expiresAt: Date.now() + 15 * 60 * 1000,
      tokenType: 'Bearer'
    };
  }
};
```

### Axios Interceptor Integration

```typescript
// src/lib/apiClient.ts
import axios from 'axios';

const apiClient = axios.create();

// Request interceptor: Attach access token
apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken(); // from AuthContext
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor: Handle 401 and auto-refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login if refresh fails
        logout();
        throw refreshError;
      }
    }

    return Promise.reject(error);
  }
);
```

---

## Summary

All API contracts align with functional requirements:
- ✅ Auth endpoints support email/password + OAuth (FR-003, FR-004)
- ✅ Token refresh endpoint supports automatic refresh (FR-007)
- ✅ Mailbox endpoint provides folder list with unread counts (FR-017)
- ✅ Email endpoints support three-column dashboard (FR-018, FR-019, FR-021)
- ✅ Error responses provide clear, actionable messages (FR-011, FR-014)
- ✅ Bearer token authentication protects resources (FR-006, FR-029)
- ✅ Mock delays (200-500ms) demonstrate loading states (FR-024)
