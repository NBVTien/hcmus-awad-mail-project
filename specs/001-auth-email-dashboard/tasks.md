---

description: "Task list for Authentication & Email Dashboard feature"
---

# Tasks: Authentication & Email Dashboard

**Input**: Design documents from `/specs/001-auth-email-dashboard/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/, research.md, quickstart.md

**Tests**: Testing is OPTIONAL for this demonstration project (per Constitution VI - deferred to implementation). Test tasks are NOT included in this breakdown.

**Organization**: Tasks are grouped by user story (P1, P2, P3) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- **SPA structure**: `src/` at repository root
- **Feature-based**: `src/features/auth/`, `src/features/dashboard/`
- **Shared**: `src/components/`, `src/hooks/`, `src/lib/`, `src/types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install core dependencies (React 19, TypeScript 5, Vite, React Router v7, TanStack Query, Axios, React Hook Form, Zod)
- [x] T002 Install shadcn/ui and initialize with Tailwind CSS configuration
- [x] T003 [P] Add shadcn/ui components (button, input, label, separator, scroll-area)
- [x] T004 [P] Configure TypeScript with strict mode in tsconfig.json
- [x] T005 [P] Configure ESLint and Prettier with React/TypeScript rules
- [x] T006 [P] Create environment variables template file .env.example with VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_REDIRECT_URI
- [x] T007 Create src/ directory structure (features/, components/, hooks/, lib/, services/, types/, data/)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Create shared TypeScript type definitions in src/types/auth.types.ts (User, AuthToken, AuthMethod, LoginRequest, LoginResponse)
- [x] T009 [P] Create shared TypeScript type definitions in src/types/email.types.ts (EmailAddress, Attachment, Mailbox, Email, EmailListItem)
- [x] T010 [P] Create shared TypeScript type definitions in src/types/api.types.ts (ApiError, ApiResponse)
- [x] T011 Create mock data file src/data/mockFolders.json with 6 mailboxes (Inbox, Starred, Sent, Drafts, Archive, Trash)
- [x] T012 Create mock data file src/data/mockEmails.json with 10-20 emails distributed across folders
- [x] T013 Create React Query client configuration in src/lib/queryClient.ts
- [x] T014 Create Axios API client with interceptors in src/lib/apiClient.ts (token attachment, auto-refresh on 401)
- [x] T015 Create mock authentication service in src/services/mockAuthService.ts (login, googleCallback, refresh, logout methods with delays)
- [x] T016 [P] Create mock email service in src/services/mockEmailService.ts (getMailboxes, getEmails, getEmailDetail methods with delays)
- [x] T017 Create shared ErrorBoundary component in src/components/ErrorBoundary.tsx
- [x] T018 [P] Create shared LoadingSpinner component in src/components/LoadingSpinner.tsx
- [x] T019 [P] Create shared ErrorMessage component in src/components/ErrorMessage.tsx with retry button support
- [x] T020 Create shared useRetry hook in src/hooks/useRetry.ts for error handling with retry logic
- [x] T021 Create React Router configuration in src/router.tsx with route definitions (/, /login, /auth/callback, /inbox)
- [x] T022 Update src/App.tsx to include ErrorBoundary, React Query Provider, and Router
- [x] T023 Update src/main.tsx to render App component

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Email/Password Authentication (Priority: P1) 🎯 MVP

**Goal**: Users can sign in with email/password and access the email dashboard

**Independent Test**: Provide valid email/password credentials, submit login form, verify tokens received and redirected to /inbox dashboard

### Implementation for User Story 1

- [x] T024 Create AuthContext in src/features/auth/context/AuthContext.tsx (user state, tokens, login/logout methods)
- [x] T025 Create token storage service in src/features/auth/services/tokenStorage.ts (save/get/clear refresh token from localStorage, manage access token in-memory)
- [x] T026 Create authentication service wrapper in src/features/auth/services/authService.ts (wraps mockAuthService with token storage logic)
- [x] T027 Create useAuth hook in src/features/auth/hooks/useAuth.ts (exports AuthContext methods and state)
- [x] T028 Create login form validation schema using Zod in src/features/auth/components/LoginForm.types.ts
- [x] T029 Create LoginForm component in src/features/auth/components/LoginForm.tsx (email/password inputs with React Hook Form validation, submit button with loading state)
- [x] T030 Create LoginPage component in src/features/auth/pages/LoginPage.tsx (renders LoginForm, handles login submission, redirects to /inbox on success)
- [x] T031 Create PrivateRoute component in src/components/PrivateRoute.tsx (checks auth state, redirects to /login if unauthenticated)
- [x] T032 Create basic placeholder dashboard page in src/features/dashboard/pages/DashboardPage.tsx (temporary content showing "Dashboard - Logged in successfully")
- [x] T033 Update src/router.tsx to protect /inbox route with PrivateRoute and add lazy loading for LoginPage and DashboardPage
- [x] T034 Add README.md to public/ directory with token storage justification (localStorage for refresh token - demo purposes, security considerations, production alternatives)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can login with email/password and see a basic dashboard

---

## Phase 4: User Story 5 - Email Dashboard UI (Three-Column Layout) (Priority: P2)

**Goal**: Authenticated users see a polished three-column email dashboard with folder navigation, email list, and detail pane

**Independent Test**: After login, verify three columns render, click folders to update email list, click emails to show detail pane

### Implementation for User Story 5

- [x] T035 [P] Create FolderList component types in src/features/dashboard/components/FolderList.types.ts
- [x] T036 [P] Create EmailList component types in src/features/dashboard/components/EmailList.types.ts
- [x] T037 [P] Create EmailDetail component types in src/features/dashboard/components/EmailDetail.types.ts
- [x] T038 Create FolderList component in src/features/dashboard/components/FolderList.tsx (displays mailboxes with unread counts, handles folder selection, highlights active folder)
- [x] T039 Create EmailList component in src/features/dashboard/components/EmailList.tsx (displays email previews with sender/subject/snippet, handles email selection, shows loading/empty states)
- [x] T040 Create EmailDetail component in src/features/dashboard/components/EmailDetail.tsx (displays full email content with sender/subject/body/timestamp, shows attachments metadata, handles no-selection state)
- [x] T041 Create useKeyboardNav hook in src/features/dashboard/hooks/useKeyboardNav.ts (handles arrow up/down, Enter, Escape for email list navigation)
- [x] T042 Create DashboardLayout component in src/features/dashboard/components/DashboardLayout.tsx (three-column responsive layout, integrates FolderList/EmailList/EmailDetail, manages selected folder and email state)
- [x] T043 Update DashboardPage in src/features/dashboard/pages/DashboardPage.tsx (replace placeholder with DashboardLayout, integrate React Query for fetching mailboxes and emails, add logout button in header)

**Checkpoint**: At this point, User Stories 1 AND 5 should work independently - complete auth flow + functional dashboard UI

---

## Phase 5: User Story 2 - Google OAuth Sign-In (Priority: P2)

**Goal**: Users can sign in using Google OAuth redirect flow as an alternative to email/password

**Independent Test**: Click "Sign in with Google", complete OAuth redirect flow, verify landing on dashboard with active session

### Implementation for User Story 2

- [x] T044 Create OAuth utility functions in src/features/auth/services/oauthUtils.ts (generatePKCE, generateState, buildAuthorizationUrl)
- [x] T045 Create OAuthButton component types in src/features/auth/components/OAuthButton.types.ts
- [x] T046 Create OAuthButton component in src/features/auth/components/OAuthButton.tsx (triggers OAuth flow, handles state storage in sessionStorage, redirects to Google)
- [x] T047 Create OAuthCallbackPage component in src/features/auth/pages/OAuthCallbackPage.tsx (extracts code/state from URL, validates state, exchanges code for tokens, redirects to /inbox or shows error)
- [x] T048 Update AuthContext in src/features/auth/context/AuthContext.tsx to add googleLogin method
- [x] T049 Update authService in src/features/auth/services/authService.ts to add googleCallback wrapper (calls mockAuthService.googleCallback)
- [x] T050 Update LoginPage in src/features/auth/pages/LoginPage.tsx to add OAuthButton component below LoginForm with divider
- [x] T051 Update src/router.tsx to add /auth/callback route pointing to OAuthCallbackPage

**Checkpoint**: All authentication methods (email/password + OAuth) should work independently

---

## Phase 6: User Story 3 - Session Management (Token Handling & Refresh) (Priority: P3)

**Goal**: Automatic token refresh at 80% of access token lifetime (12 minutes) without user interruption

**Independent Test**: Login, wait for 12 minutes (or modify token expiry for faster testing), verify token refreshes automatically without logout

### Implementation for User Story 3

- [x] T052 Create useTokenRefresh hook in src/features/auth/hooks/useTokenRefresh.ts (calculates refresh time at 80% of 15-min lifetime, sets timeout, calls refresh endpoint, handles refresh failure)
- [x] T053 Update AuthContext in src/features/auth/context/AuthContext.tsx to integrate useTokenRefresh hook (triggers on token expiry time change)
- [x] T054 Update apiClient in src/lib/apiClient.ts to enhance 401 interceptor (attempt token refresh before logout, retry original request with new token)
- [x] T055 Add error handling in useTokenRefresh for expired refresh tokens (redirect to /login with "Session expired" message)

**Checkpoint**: Token refresh should work seamlessly - users stay logged in without manual re-login

---

## Phase 7: User Story 4 - Logout Functionality (Priority: P3)

**Goal**: Users can securely logout, clearing all tokens and redirecting to login page

**Independent Test**: Click logout button, verify tokens cleared from storage, redirected to /login, cannot access /inbox without re-authentication

### Implementation for User Story 4

- [x] T056 Update AuthContext in src/features/auth/context/AuthContext.tsx to enhance logout method (clear access token, clear refresh token from localStorage, call mockAuthService.logout, reset user state, navigate to /login)
- [x] T057 Add logout button to DashboardLayout header in src/features/dashboard/components/DashboardLayout.tsx
- [x] T058 Update PrivateRoute in src/components/PrivateRoute.tsx to ensure browser back navigation after logout redirects to /login

**Checkpoint**: All user stories (1, 2, 3, 4, 5) should now be complete and working together

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements that affect multiple user stories

- [x] T059 [P] Add responsive design CSS for mobile screens (collapse folders into menu, stack columns on small screens) in DashboardLayout
- [x] T060 [P] Add accessibility attributes to all interactive elements (ARIA labels, roles, semantic HTML verification)
- [x] T061 [P] Add keyboard focus indicators and focus management for modals/route changes
- [x] T062 [P] Verify WCAG AA color contrast in shadcn/ui theme
- [x] T063 Add loading skeleton components for email list and detail pane
- [x] T064 [P] Add error state handling for network failures throughout application (retry buttons on all ErrorMessage instances)
- [x] T065 [P] Disable submit buttons during async operations (login form, OAuth button) to prevent duplicate requests
- [x] T066 Add form submission button disable logic to prevent rapid clicking in LoginForm
- [x] T067 [P] Optimize bundle size by verifying code splitting for Login and Dashboard routes
- [x] T068 Run TypeScript compilation check (tsc --noEmit) and fix any errors
- [x] T069 Run ESLint and fix warnings
- [x] T070 Test application across different browsers (Chrome, Firefox, Safari, Edge)
- [x] T071 Verify quickstart.md testing scenarios all pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 5 (P2): Can start after Foundational + US1 (needs auth to access dashboard)
  - User Story 2 (P2): Can start after Foundational + US1 (adds to existing login page)
  - User Story 3 (P3): Can start after Foundational + US1 (enhances existing auth)
  - User Story 4 (P3): Can start after Foundational + US1 + US5 (adds logout to dashboard)
- **Polish (Phase 8)**: Depends on all user stories being implemented

### User Story Dependencies

```
Phase 2 (Foundational)
       │
       └──> Phase 3 (US1 - Email/Password Auth) [P1] 🎯 MVP
              │
              ├──> Phase 4 (US5 - Dashboard UI) [P2]
              │      │
              │      └──> Phase 7 (US4 - Logout) [P3]
              │
              ├──> Phase 5 (US2 - Google OAuth) [P2]
              │
              └──> Phase 6 (US3 - Token Refresh) [P3]
                     │
                     └──> Phase 8 (Polish)
```

**Critical Path**: Setup → Foundational → US1 → US5 → Polish

### Within Each User Story

- **US1**: AuthContext → tokenStorage → authService → LoginForm → LoginPage → PrivateRoute → router updates
- **US5**: Component types (parallel) → FolderList → EmailList → EmailDetail → DashboardLayout → update DashboardPage
- **US2**: oauthUtils → OAuthButton → OAuthCallbackPage → update AuthContext/authService → update LoginPage
- **US3**: useTokenRefresh hook → integrate into AuthContext → enhance apiClient
- **US4**: enhance logout method → add logout button → verify route protection

### Parallel Opportunities

- **Setup phase**: T003, T004, T005, T006 can run in parallel
- **Foundational phase**: T008-T010 (type definitions), T017-T019 (shared components), T015-T016 (mock services) can run in parallel
- **US5**: T035-T037 (component types) can run in parallel
- **Polish phase**: T059-T062, T064-T065, T067 can run in parallel

---

## Parallel Example: User Story 5 (Dashboard UI)

```bash
# Launch component type definitions in parallel:
Task T035: Create FolderList.types.ts
Task T036: Create EmailList.types.ts
Task T037: Create EmailDetail.types.ts

# Then implement components sequentially (they share data):
Task T038: Create FolderList component
Task T039: Create EmailList component
Task T040: Create EmailDetail component
Task T041: Create useKeyboardNav hook
Task T042: Create DashboardLayout (integrates all components)
Task T043: Update DashboardPage with DashboardLayout
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Email/Password Auth)
4. **STOP and VALIDATE**: Test email/password login independently
5. Deploy/demo if ready

**Deliverable**: Working authentication with email/password, basic dashboard placeholder

### Recommended Incremental Delivery

1. **Sprint 1**: Setup + Foundational + US1 (Email/Password) → Working auth MVP
2. **Sprint 2**: US5 (Dashboard UI) → Full dashboard with mock data
3. **Sprint 3**: US2 (Google OAuth) → Alternative login method
4. **Sprint 4**: US3 + US4 (Session management + Logout) → Complete auth lifecycle
5. **Sprint 5**: Polish → Production-ready

Each sprint delivers an independently testable increment.

### Parallel Team Strategy

With multiple developers:

1. **Week 1**: Team completes Setup + Foundational together
2. **Week 2**: Once Foundational is done:
   - Developer A: User Story 1 (Auth)
   - Developer B: Prepare User Story 5 components (parallel, ready for integration)
3. **Week 3**:
   - Developer A: User Story 2 (OAuth) + User Story 4 (Logout)
   - Developer B: User Story 5 (Dashboard) + User Story 3 (Token Refresh)
4. **Week 4**: Both work on Polish together

---

## Task Statistics

**Total Tasks**: 71

### By Phase:
- Phase 1 (Setup): 7 tasks
- Phase 2 (Foundational): 16 tasks ⚠️ BLOCKING
- Phase 3 (US1 - Email/Password Auth - P1): 11 tasks 🎯 MVP
- Phase 4 (US5 - Dashboard UI - P2): 9 tasks
- Phase 5 (US2 - Google OAuth - P2): 8 tasks
- Phase 6 (US3 - Session Management - P3): 4 tasks
- Phase 7 (US4 - Logout - P3): 3 tasks
- Phase 8 (Polish): 13 tasks

### By User Story:
- US1 (Email/Password Auth - P1): 11 tasks 🎯
- US2 (Google OAuth - P2): 8 tasks
- US3 (Session Management - P3): 4 tasks
- US4 (Logout - P3): 3 tasks
- US5 (Dashboard UI - P2): 9 tasks
- Infrastructure (Setup + Foundational + Polish): 36 tasks

### Parallel Opportunities:
- Setup: 4 tasks can run in parallel
- Foundational: 8 tasks can run in parallel
- US5: 3 tasks (component types) can run in parallel
- Polish: 7 tasks can run in parallel

**Total parallelizable tasks**: 22 out of 71 (31%)

---

## Independent Test Criteria

### User Story 1 (Email/Password Auth)
✅ Login with valid email/password → redirected to /inbox
✅ Invalid email format → validation error shown
✅ Incorrect credentials → authentication error shown
✅ Page refresh after login → remains authenticated

### User Story 2 (Google OAuth)
✅ Click "Sign in with Google" → redirected to OAuth flow
✅ Complete OAuth → redirected to /inbox with session
✅ Cancel OAuth → remain on /login with cancellation message

### User Story 3 (Session Management)
✅ Login → wait 12 min → token refreshes automatically
✅ Refresh failure → redirect to /login with session expired message

### User Story 4 (Logout)
✅ Click logout → tokens cleared, redirect to /login
✅ Access /inbox after logout → redirect to /login

### User Story 5 (Dashboard UI)
✅ Three columns render (folders, email list, detail)
✅ Click folder → email list updates
✅ Click email → detail pane shows full content
✅ Responsive layout works on mobile and desktop
✅ Keyboard navigation works (arrow keys, Enter)

---

## Notes

- All tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
- [P] tasks can run in parallel (different files, no dependencies)
- [Story] labels (US1, US2, US3, US4, US5) map to user stories from spec.md
- Setup and Foundational phases have NO story labels (infrastructure)
- Polish phase has NO story labels (cross-cutting)
- User Story phases MUST have story labels
- Each user story is independently completable and testable
- Stop at any checkpoint to validate story independently
- Commit after each task or logical group
- Testing is OPTIONAL per constitution - no test tasks included
