# Implementation Plan: Authentication & Email Dashboard

**Branch**: `001-auth-email-dashboard` | **Date**: 2025-11-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-auth-email-dashboard/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a React SPA demonstrating secure authentication (email/password + Google OAuth redirect flow) with a three-column email dashboard UI. Features include automatic token refresh (15-min access tokens), route protection, mock service layer with realistic delays (200-500ms), and keyboard-accessible navigation. UI built with shadcn/ui following minimal design principles.

## Technical Context

**Language/Version**: TypeScript 5.x with React 19.x
**Primary Dependencies**:
- UI: shadcn/ui (minimal design, minimal card usage)
- Routing: React Router v7
- State Management: React Query (TanStack Query) for server state
- Auth: Custom implementation with localStorage (refresh token) + in-memory (access token)
- Styling: Tailwind CSS (via shadcn/ui)
- Forms: React Hook Form with Zod validation
- HTTP Client: Axios with interceptors for token attachment and auto-refresh

**Storage**:
- localStorage for refresh tokens (with README justification for demo purposes)
- In-memory storage for access tokens (session-scoped)
- Mock data: 10-20 emails stored in JSON files or in-memory mock service

**Testing**: Vitest + React Testing Library (component/integration tests), optional E2E with Playwright
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge - ES2020+)
**Project Type**: Single-page web application (SPA)
**Performance Goals**:
- Initial page load < 3 seconds
- Route transitions < 500ms
- Mock API responses 200-500ms
- Token refresh < 1 second

**Constraints**:
- Accessibility: WCAG AA compliance mandatory
- Responsive: 320px - 2560px screen widths
- Token refresh must not interrupt user activity
- Network error handling with retry mechanisms

**Scale/Scope**:
- Demonstration SPA for ~5-10 screens (Login, OAuth Callback, Dashboard with 3-column layout)
- ~10-20 mock emails across 6-8 folders
- Single user session (no multi-user support)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Component Modularity ✅
- **Status**: PASS
- **Compliance**: Feature will be built with reusable, self-contained components:
  - Login form, OAuth button (auth feature)
  - Folder list, email list, email detail (dashboard feature)
  - PrivateRoute, ErrorBoundary (shared components)
  - Each component with single responsibility, typed props

### II. Clean Code Standards ✅
- **Status**: PASS
- **Compliance**:
  - TypeScript strict mode enabled
  - Functional components with hooks
  - Custom hooks: useAuth, useTokenRefresh, useKeyboardNav
  - All props typed with TypeScript interfaces
  - ESLint + Prettier configured

### III. State Management Discipline ✅
- **Status**: PASS
- **Compliance**:
  - React Query for server state (emails, mailboxes)
  - Context API for auth state (user, tokens)
  - Local useState for UI state (selected folder, email)
  - No prop drilling (max 2 levels)

### IV. Performance Optimization ✅
- **Status**: PASS
- **Compliance**:
  - React Router lazy loading for routes
  - Code splitting: Login and Dashboard routes
  - Minimal dependencies (shadcn/ui is tree-shakeable)
  - React Query caching for email data
  - Small mock dataset (10-20 emails) - no virtualization needed

### V. Accessibility First (NON-NEGOTIABLE) ✅
- **Status**: PASS
- **Compliance**:
  - Semantic HTML (nav, main, button, article)
  - ARIA labels for interactive elements
  - Keyboard navigation for email list (arrow keys, Enter)
  - Focus management on route changes
  - WCAG AA color contrast (shadcn/ui default themes)
  - Skip links for main content

### VI. Testing Strategy ⚠️
- **Status**: PARTIAL (deferred to implementation)
- **Compliance**:
  - Unit tests for custom hooks (useAuth, useTokenRefresh)
  - Component tests for Login, EmailList, EmailDetail
  - Integration tests for auth flow
  - E2E optional for demonstration purposes

### VII. Build and Deployment Hygiene ✅
- **Status**: PASS
- **Compliance**:
  - Vite build with TypeScript compilation
  - ESLint pre-commit checks
  - Environment variables for OAuth client ID
  - Production build optimizations (minification, tree-shaking)

**Overall Status**: ✅ PASS (testing partial but acceptable for demonstration scope)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── LoginForm.types.ts
│   │   │   ├── OAuthButton.tsx
│   │   │   └── OAuthButton.types.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useTokenRefresh.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   └── tokenStorage.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   └── pages/
│   │       ├── LoginPage.tsx
│   │       └── OAuthCallbackPage.tsx
│   └── dashboard/
│       ├── components/
│       │   ├── FolderList.tsx
│       │   ├── EmailList.tsx
│       │   ├── EmailDetail.tsx
│       │   └── DashboardLayout.tsx
│       ├── hooks/
│       │   └── useKeyboardNav.ts
│       └── pages/
│           └── DashboardPage.tsx
├── components/           # Shared components
│   ├── PrivateRoute.tsx
│   ├── ErrorBoundary.tsx
│   ├── ErrorMessage.tsx
│   └── LoadingSpinner.tsx
├── hooks/               # Shared hooks
│   └── useRetry.ts
├── lib/                # Core utilities
│   ├── apiClient.ts    # Axios instance with interceptors
│   └── queryClient.ts  # React Query configuration
├── services/           # Mock API services
│   ├── mockAuthService.ts
│   └── mockEmailService.ts
├── types/              # Shared TypeScript types
│   ├── auth.types.ts
│   ├── email.types.ts
│   └── api.types.ts
├── data/               # Mock data
│   ├── mockEmails.json
│   └── mockFolders.json
├── App.tsx
├── main.tsx
└── router.tsx

tests/
├── unit/
│   ├── hooks/
│   │   ├── useAuth.test.ts
│   │   └── useTokenRefresh.test.ts
│   └── services/
│       └── tokenStorage.test.ts
└── integration/
    └── auth-flow.test.tsx

public/
└── README.md           # Justification for localStorage token storage
```

**Structure Decision**: Single-page application structure following React SPA best practices with feature-based organization. Auth and Dashboard are separate features, each containing their components, hooks, and services. Shared utilities in top-level directories (components/, hooks/, lib/, types/). Mock services and data co-located for easy maintenance.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. All constitution principles satisfied.
