# Quickstart: Authentication & Email Dashboard

**Feature**: Authentication & Email Dashboard
**Date**: 2025-11-19
**Purpose**: Development setup and testing guide

---

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Modern browser (Chrome, Firefox, Safari, Edge)
- Git
- Text editor (VS Code recommended)

---

## Initial Setup

### 1. Install Dependencies

```bash
# From repository root
npm install

# Or with yarn
yarn install

# Or with pnpm
pnpm install
```

**Key Dependencies**:
- React 19.x
- TypeScript 5.x
- React Router v7
- @tanstack/react-query (React Query)
- axios
- react-hook-form + zod
- shadcn/ui components (via CLI)
- Tailwind CSS

### 2. Install shadcn/ui Components

```bash
# Initialize shadcn/ui (if not already done)
npx shadcn-ui@latest init

# Install required components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add scroll-area
```

### 3. Environment Variables

Create `.env.local` file in repository root:

```env
# Google OAuth Configuration (for demo - use placeholder values)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback

# API Configuration (mock service, not used in URL)
VITE_API_BASE_URL=http://localhost:5173/api

# Token Configuration
VITE_ACCESS_TOKEN_LIFETIME=900000 # 15 minutes in milliseconds
VITE_REFRESH_THRESHOLD=0.8 # Refresh at 80% of lifetime
```

**Note**: For demonstration purposes, you can use placeholder values. Real Google OAuth requires actual client ID from Google Cloud Console.

### 4. TypeScript Configuration

Ensure `tsconfig.json` has strict mode enabled:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noEmit": true,
    "skipLibCheck": true
  }
}
```

---

## Project Structure Overview

```
src/
├── features/
│   ├── auth/              # Authentication feature
│   └── dashboard/         # Email dashboard feature
├── components/            # Shared components
├── hooks/                 # Shared custom hooks
├── lib/                   # Core utilities (API client, React Query config)
├── services/              # Mock API services
├── types/                 # TypeScript type definitions
├── data/                  # Mock data (JSON files)
├── App.tsx
├── main.tsx
└── router.tsx

See plan.md for detailed directory structure.
```

---

## Development Workflow

### Running the Development Server

```bash
npm run dev
# Or: yarn dev / pnpm dev

# Application will be available at http://localhost:5173
```

### Building for Production

```bash
npm run build

# Output will be in /dist folder
# Preview production build:
npm run preview
```

### Linting and Type Checking

```bash
# Run ESLint
npm run lint

# Run TypeScript compiler (type check only)
npm run type-check
# Or: tsc --noEmit
```

---

## Testing the Application

### Manual Testing Flow

#### 1. Email/Password Authentication (P1 - MVP)

**Test Steps**:
1. Navigate to `http://localhost:5173`
2. Should redirect to `/login`
3. Enter any email (must be valid format, e.g., `test@example.com`)
4. Enter any password (min 8 characters, e.g., `password123`)
5. Click "Sign In"
6. Should see loading state (200-500ms delay)
7. Should redirect to `/inbox` with three-column dashboard

**Expected Results**:
- ✅ Form validation works (email format, password length)
- ✅ Submit button disabled during login
- ✅ Loading spinner shown during authentication
- ✅ Successful login redirects to `/inbox`
- ✅ Dashboard shows folders, email list, and detail pane
- ✅ Refresh page - should remain authenticated

**Error Cases to Test**:
- Invalid email format → Error message "Invalid email format"
- Password < 8 chars → Error message "Password must be at least 8 characters"

---

#### 2. Google OAuth Sign-In (P2)

**Test Steps**:
1. On login page, click "Sign in with Google"
2. (In demo mode) Should simulate redirect to Google
3. Mock service auto-completes OAuth flow
4. Should redirect to `/inbox` with authenticated session

**Expected Results**:
- ✅ OAuth button triggers flow
- ✅ Redirect to callback page with code
- ✅ Tokens exchanged successfully
- ✅ User lands on dashboard
- ✅ User profile picture shown (if Google auth)

**Note**: For full OAuth testing, you'll need real Google OAuth credentials. Demo mode simulates the flow.

---

#### 3. Email Dashboard UI (P2)

**Test Steps**:
1. After login, verify three-column layout:
   - **Left column**: Folder list (Inbox, Starred, Sent, Drafts, Archive, Trash)
   - **Middle column**: Email list with previews
   - **Right column**: Email detail pane
2. Click on "Inbox" folder → Email list updates
3. Click on an email in the list → Detail pane shows full email
4. Verify unread count on Inbox (should show 5)
5. Click on "Starred" folder → Shows starred emails
6. Try on different screen sizes (resize browser)

**Expected Results**:
- ✅ Three columns render correctly
- ✅ Folder selection highlights active folder
- ✅ Email list updates when folder changes
- ✅ Email detail shows full content (subject, sender, body, timestamp)
- ✅ Unread count badge on folders
- ✅ Responsive layout (mobile: stacked, desktop: three columns)
- ✅ Loading states shown during data fetch

---

#### 4. Keyboard Navigation (Accessibility)

**Test Steps**:
1. On dashboard, focus on email list
2. Press `ArrowDown` → Select next email
3. Press `ArrowUp` → Select previous email
4. Press `Enter` → Open selected email in detail pane
5. Press `Tab` → Navigate between columns
6. Press `Escape` → Clear selection

**Expected Results**:
- ✅ Keyboard shortcuts work as expected
- ✅ Visual focus indicator on selected email
- ✅ Screen reader announces email details
- ✅ All interactive elements accessible via keyboard

---

#### 5. Session Management & Token Refresh (P3)

**Test Steps**:
1. Login successfully
2. Open browser DevTools → Console
3. Wait 12 minutes (or modify token expiry to 1 min for testing)
4. Token should auto-refresh without interruption
5. Verify no logout or redirect occurred

**Expected Results**:
- ✅ Access token refreshed automatically at 12 min mark
- ✅ User activity not interrupted
- ✅ Console log shows "Token refreshed" (if logging enabled)
- ✅ New access token stored in memory

**To Test Refresh Failure**:
1. Login
2. Manually clear refresh token from localStorage: `localStorage.removeItem('refresh_token')`
3. Wait for auto-refresh (or trigger manually)
4. Should redirect to login with "Session expired" message

---

#### 6. Logout Functionality (P3)

**Test Steps**:
1. On dashboard, click "Logout" button (in header/menu)
2. Should clear tokens and redirect to `/login`
3. Try accessing `/inbox` directly → Should redirect to `/login`
4. Verify localStorage is cleared: `localStorage.getItem('refresh_token')` should be null

**Expected Results**:
- ✅ Logout clears both access and refresh tokens
- ✅ Redirect to login page
- ✅ Protected routes inaccessible after logout
- ✅ Browser back button doesn't access protected pages

---

#### 7. Error Handling & Network Failures

**Test Steps**:
1. Open browser DevTools → Network tab
2. Throttle network to "Slow 3G"
3. Try logging in → Should handle slow response gracefully
4. In DevTools Console, run: `throw new Error('Simulated network failure')`
5. Verify error message with retry button appears

**Expected Results**:
- ✅ Loading states shown for slow requests
- ✅ Network errors display: "Unable to connect. Please check your internet connection."
- ✅ Retry button allows user to retry action
- ✅ No app crashes (ErrorBoundary catches errors)

---

## Mock Data

### Editing Mock Data

Mock data is stored in:
- `src/data/mockEmails.json` - Email messages
- `src/data/mockFolders.json` - Mailbox folders

**Example: Adding a new email**:

```json
// src/data/mockEmails.json
{
  "id": "msg-021",
  "mailboxId": "inbox",
  "from": {
    "email": "newuser@example.com",
    "name": "New User"
  },
  "to": [{ "email": "user@example.com", "name": "John Doe" }],
  "subject": "New Email Subject",
  "body": "Email body content...",
  "snippet": "Email preview text...",
  "timestamp": "2025-11-19T16:00:00Z",
  "isRead": false,
  "isStarred": false,
  "hasAttachments": false
}
```

Restart dev server after changing mock data.

---

## Debugging Tips

### 1. React Query DevTools

React Query DevTools are enabled in development mode. Look for floating React Query icon in bottom-right corner.

**Features**:
- View cached queries
- Inspect query state (loading, error, success)
- Manually trigger refetch
- View query dependencies

### 2. AuthContext Debugging

Add console logs to `AuthContext`:

```typescript
// src/features/auth/context/AuthContext.tsx
useEffect(() => {
  console.log('[AuthContext] User:', user);
  console.log('[AuthContext] Access Token:', accessToken ? 'Present' : 'Missing');
  console.log('[AuthContext] Refresh Token:', refreshToken ? 'Present' : 'Missing');
}, [user, accessToken, refreshToken]);
```

### 3. Mock Service Debugging

Mock services log all calls in development:

```typescript
// src/services/mockEmailService.ts
export const mockEmailService = {
  async getEmails(mailboxId: string) {
    console.log('[MockService] Fetching emails for mailbox:', mailboxId);
    await delay(randomBetween(200, 500));
    const emails = mockEmails.filter(e => e.mailboxId === mailboxId);
    console.log('[MockService] Returning', emails.length, 'emails');
    return emails;
  }
};
```

### 4. Token Refresh Debugging

Monitor token refresh in console:

```typescript
// src/features/auth/hooks/useTokenRefresh.ts
useEffect(() => {
  console.log('[TokenRefresh] Next refresh in:', refreshTime - Date.now(), 'ms');

  const timeout = setTimeout(async () => {
    console.log('[TokenRefresh] Refreshing token now...');
    try {
      await refreshAccessToken();
      console.log('[TokenRefresh] Token refreshed successfully');
    } catch (error) {
      console.error('[TokenRefresh] Refresh failed:', error);
    }
  }, refreshTime - Date.now());

  return () => clearTimeout(timeout);
}, [refreshTime]);
```

---

## Common Issues & Solutions

### Issue: "Invalid email format" even with valid email

**Solution**: Check email validation regex in login form schema:
```typescript
// Should match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

### Issue: Tokens not persisting across page refresh

**Solution**:
1. Check localStorage: `localStorage.getItem('refresh_token')`
2. Verify AuthContext hydration logic runs on mount
3. Ensure refresh token is being set after login

### Issue: Email list not updating when clicking folders

**Solution**:
1. Check React Query cache key includes `mailboxId`: `['emails', mailboxId]`
2. Verify `mailboxId` prop changes when folder clicked
3. Check mock service filters emails by `mailboxId`

### Issue: OAuth redirect not working

**Solution**:
1. Verify redirect URI matches exactly: `http://localhost:5173/auth/callback`
2. Check state parameter in URL matches sessionStorage value
3. Ensure callback page extracts `code` and `state` from URL params

### Issue: TypeScript errors on shadcn/ui components

**Solution**:
1. Ensure `@types/node` is installed
2. Re-run `npx shadcn-ui@latest add [component]`
3. Check `tsconfig.json` paths are configured correctly

---

## Testing Checklist

Before considering the feature complete, verify:

- [ ] Email/password login works
- [ ] Google OAuth login works (or is properly mocked)
- [ ] Tokens stored correctly (access in-memory, refresh in localStorage)
- [ ] Auto-refresh triggers at 12 minutes
- [ ] Logout clears tokens and redirects
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Three-column dashboard layout renders
- [ ] Folder navigation updates email list
- [ ] Email detail pane shows full email
- [ ] Keyboard navigation works (arrow keys, Enter, Tab)
- [ ] Responsive design works (mobile + desktop)
- [ ] Error messages display with retry buttons
- [ ] Loading states show during async operations
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] Accessibility: keyboard navigation, ARIA labels, focus management

---

## Next Steps

After verifying the quickstart:

1. Run `/speckit.tasks` to generate task breakdown
2. Review `tasks.md` for implementation order
3. Start with Phase 1 (Setup) tasks
4. Follow incremental implementation by user story priority (P1 → P2 → P3)
5. Test each user story independently before moving to next

---

## Additional Resources

- **React Query Docs**: https://tanstack.com/query/latest/docs/react/overview
- **React Router v7 Docs**: https://reactrouter.com/
- **shadcn/ui Docs**: https://ui.shadcn.com/
- **Zod Validation**: https://zod.dev/
- **React Hook Form**: https://react-hook-form.com/
- **Vite Docs**: https://vitejs.dev/

---

## Token Storage Justification (README Content)

Include this in `public/README.md` or project root `README.md`:

### Token Storage Strategy

**Refresh Token in localStorage**:

This demonstration application stores refresh tokens in `localStorage` for the following reasons:

1. **User Experience**: Persists authentication across browser sessions, allowing users to remain logged in after closing the browser
2. **Demo Simplicity**: Avoids the complexity of backend cookie management and CORS configuration
3. **Cross-tab Synchronization**: Multiple tabs can share the same refresh token state

**Security Considerations**:

⚠️ **This approach is acceptable for demonstrations but NOT recommended for production applications.**

**Risks**:
- localStorage is accessible to JavaScript, making it vulnerable to XSS (Cross-Site Scripting) attacks
- Tokens can be stolen if malicious scripts execute in the application context

**Production Alternative**:
For production applications, use **httpOnly cookies with SameSite=Strict** attribute:
- Cookies are not accessible to JavaScript, preventing XSS attacks
- SameSite=Strict prevents CSRF (Cross-Site Request Forgery) attacks
- Requires backend server to set and manage cookies

**Mitigation in This Demo**:
- Access tokens stored in-memory only (cleared on tab close)
- Short access token lifetime (15 minutes)
- Tokens refreshed automatically every 12 minutes
- CSP (Content Security Policy) headers recommended for additional XSS protection

For more information on secure token storage, see: https://owasp.org/www-community/controls/Token_Binding
