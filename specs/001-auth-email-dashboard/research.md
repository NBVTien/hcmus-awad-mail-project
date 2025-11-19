# Research: Authentication & Email Dashboard

**Feature**: Authentication & Email Dashboard
**Date**: 2025-11-19
**Purpose**: Technology decisions and best practices for React SPA with auth + email UI

---

## 1. Token Storage Strategy

### Decision
- **Access Token**: In-memory storage (module-scoped variable or React context state)
- **Refresh Token**: localStorage

### Rationale
**Access Token In-Memory**:
- More secure than localStorage for short-lived tokens
- Cleared automatically on tab/browser close
- Not accessible to XSS attacks via `document` API
- Acceptable trade-off for 15-minute lifetime

**Refresh Token localStorage**:
- Persists across browser sessions (better UX - user stays logged in)
- Demonstration purposes - acceptable risk for non-production app
- Enables automatic token refresh on page reload
- Will be documented in README with security considerations

**Production Alternative**: httpOnly cookies with SameSite=Strict would be ideal but requires backend cookie management.

### Alternatives Considered
- **Both in localStorage**: Less secure, vulnerable to XSS
- **Both in sessionStorage**: Loses session on tab close, poor UX
- **IndexedDB**: Overcomplicated for token storage
- **httpOnly cookies**: Requires backend support (out of scope for demo)

---

## 2. Mock API Strategy

### Decision
Mock service layer with simulated delays (200-500ms)

**Implementation**:
```typescript
// src/services/mockEmailService.ts
export const mockEmailService = {
  async getMailboxes() {
    await delay(randomBetween(200, 500));
    return mockMailboxes;
  },
  async getEmails(mailboxId: string) {
    await delay(randomBetween(200, 500));
    return mockEmails.filter(e => e.mailboxId === mailboxId);
  },
  async getEmailDetail(emailId: string) {
    await delay(randomBetween(200, 500));
    return mockEmails.find(e => e.id === emailId);
  }
};
```

### Rationale
- Demonstrates proper loading states
- Tests async error handling
- More realistic than instant responses
- Simpler than running mock API server
- Easier to modify mock data during development

### Alternatives Considered
- **JSON Server**: Requires separate process, more setup
- **MSW (Mock Service Worker)**: Powerful but overkill for simple demo
- **Static JSON files**: No delay simulation, unrealistic
- **Instant in-memory**: Doesn't test loading states properly

---

## 3. OAuth Implementation (Google Redirect Flow)

### Decision
OAuth 2.0 Authorization Code Flow with PKCE (redirect-based)

**Flow**:
1. User clicks "Sign in with Google"
2. Generate PKCE code_verifier and code_challenge
3. Redirect to Google OAuth endpoint with state parameter
4. Google redirects back to `/auth/callback?code=...&state=...`
5. Verify state, exchange code for tokens
6. Store tokens and redirect to `/inbox`

### Rationale
- More reliable than popup (no popup blockers)
- Standard OAuth 2.0 flow
- PKCE provides additional security for public clients (SPAs)
- Better mobile compatibility
- Handles session state via URL parameters

### Alternatives Considered
- **Popup flow**: Blocked by popup blockers, poor mobile UX
- **Implicit flow**: Deprecated, less secure
- **Password grant**: Not supported by Google, inappropriate for third-party auth

### Implementation Details
**Libraries**: None required - use native `window.location` and URL API

**PKCE Generation**:
```typescript
function generatePKCE() {
  const verifier = base64URLEncode(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = base64URLEncode(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  );
  return { verifier, challenge };
}
```

**State Parameter**: Random string stored in sessionStorage to prevent CSRF

---

## 4. Automatic Token Refresh Strategy

### Decision
Proactive refresh at 80% of token lifetime (12 minutes for 15-minute tokens)

**Implementation**:
```typescript
// useTokenRefresh hook
useEffect(() => {
  const expiresAt = tokenExpiry; // from token or stored timestamp
  const refreshTime = expiresAt - (EXPIRY_DURATION * 0.2); // 80% of lifetime
  const timeout = setTimeout(async () => {
    try {
      await refreshAccessToken();
    } catch (error) {
      // Redirect to login if refresh fails
      logout();
    }
  }, refreshTime - Date.now());

  return () => clearTimeout(timeout);
}, [tokenExpiry]);
```

### Rationale
- Prevents mid-request token expiration
- Non-disruptive to user experience
- Industry standard (Auth0, Firebase use similar approach)
- 20% buffer allows time for refresh to complete

### Alternatives Considered
- **On-demand refresh (401 retry)**: Disrupts in-flight requests, poor UX
- **90% lifetime**: Too aggressive, unnecessary refresh requests
- **50% lifetime**: Risk of expiry during long user sessions
- **Background interval**: Wastes resources, refreshes even when inactive

---

## 5. UI Library: shadcn/ui with Minimal Design

### Decision
shadcn/ui with Tailwind CSS, minimal card usage

**Chosen Components**:
- Button
- Input
- Label
- Separator
- ScrollArea
- Command (for potential keyboard shortcuts)
- No Card component (per requirements)

### Rationale
- Copy-paste components (not npm package) - full control
- Built on Radix UI primitives - accessible by default
- Tailwind CSS for styling - highly customizable
- Tree-shakeable - only use what's needed
- TypeScript support out of box
- WCAG AA compliant by default

**Minimal Design Approach**:
- Clean layouts with whitespace
- Subtle borders/dividers instead of cards
- Flat design, minimal shadows
- Focus on content, not decorative containers

### Alternatives Considered
- **Material UI**: Heavy bundle, opinionated design
- **Ant Design**: Asian aesthetic, card-heavy by default
- **Chakra UI**: Runtime styles, larger bundle
- **Headless UI**: Lower-level, more setup required
- **Plain Tailwind**: No accessible primitives, more work

---

## 6. Form Validation

### Decision
React Hook Form + Zod schema validation

**Example**:
```typescript
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema)
});
```

### Rationale
- React Hook Form: Minimal re-renders, great performance
- Zod: Type-safe schema validation, TypeScript inference
- Reusable schemas across client and server (future-proof)
- Built-in error handling
- Small bundle size (~10KB combined)

### Alternatives Considered
- **Formik**: Heavier, more re-renders
- **Manual validation**: Error-prone, verbose
- **Yup**: Similar to Zod but no TypeScript inference
- **HTML5 validation only**: Limited, poor UX

---

## 7. Routing Strategy

### Decision
React Router v7 with route-based code splitting

**Routes**:
```typescript
{
  path: '/',
  element: <Navigate to="/login" replace />
},
{
  path: '/login',
  element: <LoginPage />,
  lazy: () => import('./features/auth/pages/LoginPage')
},
{
  path: '/auth/callback',
  element: <OAuthCallbackPage />,
  lazy: () => import('./features/auth/pages/OAuthCallbackPage')
},
{
  path: '/inbox',
  element: <PrivateRoute><DashboardPage /></PrivateRoute>,
  lazy: () => import('./features/dashboard/pages/DashboardPage')
}
```

### Rationale
- React Router v7: Latest version, improved data loading
- Route-based code splitting: Smaller initial bundle
- PrivateRoute wrapper: Centralized auth check
- Redirect `/` to `/login`: Clear entry point

### Alternatives Considered
- **TanStack Router**: Newer, less mature ecosystem
- **Wouter**: Too minimal, missing features
- **Next.js**: SSR framework, overkill for SPA demo

---

## 8. Error Handling Pattern

### Decision
Centralized error handling with retry mechanisms

**Components**:
1. **ErrorBoundary**: Catches React errors
2. **ErrorMessage component**: Displays errors with retry button
3. **useRetry hook**: Handles retry logic with exponential backoff
4. **API interceptor**: Catches network errors, formats for UI

**Error Types**:
- **Network errors**: "Unable to connect. Please check your internet connection." + Retry
- **Auth errors (401)**: Attempt token refresh, or redirect to login
- **Validation errors (400)**: Display field-specific messages
- **Server errors (500)**: "Something went wrong. Please try again." + Retry

### Rationale
- Consistent error UX across app
- Clear, actionable error messages
- Retry capability reduces user frustration
- Aligns with FR-014 requirement

---

## 9. Keyboard Navigation

### Decision
Custom `useKeyboardNav` hook for email list navigation

**Features**:
- Arrow Up/Down: Navigate email list
- Enter: Open selected email
- Escape: Clear selection / close detail
- Tab: Navigate between columns

**Implementation**:
```typescript
function useKeyboardNav(items: Email[], onSelect: (email: Email) => void) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch(e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(i => Math.min(i + 1, items.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(i => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          onSelect(items[selectedIndex]);
          break;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, items, onSelect]);

  return selectedIndex;
}
```

### Rationale
- Meets WCAG 2.1 keyboard navigation requirements
- Improves power user productivity
- Common email client pattern (Gmail, Outlook)
- Demonstrates accessibility commitment

---

## 10. React Query Configuration

### Decision
React Query (TanStack Query) for server state management

**Configuration**:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false, // Avoid unnecessary refetches in demo
      retry: 1 // Retry once on failure
    }
  }
});
```

**Usage**:
```typescript
// Fetch emails for a mailbox
const { data: emails, isLoading, error } = useQuery({
  queryKey: ['emails', mailboxId],
  queryFn: () => mockEmailService.getEmails(mailboxId)
});
```

### Rationale
- Automatic caching and background updates
- Built-in loading/error states
- Deduplicates requests
- Optimistic updates support
- DevTools for debugging
- Separates server state from UI state (Constitution III)

### Alternatives Considered
- **SWR**: Similar, but React Query has better TypeScript support
- **Apollo Client**: GraphQL-focused, overkill
- **Manual fetch + useState**: Verbose, error-prone, no caching

---

## Summary

All technical decisions align with constitution principles:
- ✅ Component modularity through feature-based architecture
- ✅ TypeScript strict mode for clean code standards
- ✅ React Query + Context for proper state separation
- ✅ Code splitting for performance
- ✅ Keyboard nav + shadcn/ui for accessibility
- ✅ Vitest + RTL for testing (optional in demo)
- ✅ Vite build + ESLint for deployment hygiene

No additional research needed. Ready for Phase 1 (Design & Contracts).
