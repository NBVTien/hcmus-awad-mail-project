# Implementation Plan: Email Actions & Enhanced Dashboard

**Branch**: `002-email-actions` | **Date**: 2025-11-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-email-actions/spec.md`

## Summary

This feature adds interactive email actions (compose, reply, forward, delete, star/unread, mark read/unread), bulk operations with checkboxes, pagination, enhanced email detail display with CC field and attachment downloads, and mobile-responsive navigation with back buttons. The implementation extends the existing read-only email dashboard to a fully functional email client mockup, integrating seamlessly with the current feature-based architecture, TanStack Query state management, and mock service layer.

**Technical Approach**: Extend existing `mockEmailService` with new operations (delete, bulk actions, compose/send), add action button components to `EmailDetail` and toolbar to `EmailList`, create a `ComposeModal` component with React Hook Form validation, implement selection state in `DashboardLayout`, add pagination controls, enhance `EmailDetail` with CC field conditional rendering and attachment download handlers, and add mobile navigation state management with back button component.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled
**Primary Dependencies**:
- React 19.2.0 (functional components + hooks)
- TanStack Query 5.90.10 (server state management, cache invalidation)
- React Hook Form 7.66.1 + Zod 4.1.12 (form validation)
- React Router DOM 7.9.6 (client-side routing)
- Radix UI (Dialog/Modal for compose, Checkbox for bulk select)
- Tailwind CSS 4.1.17 (styling)
- Lucide React 0.554.0 (icons: Star, Trash, Reply, Forward, etc.)

**Storage**: In-memory mock data (`emailsState`, `mailboxesState` in `mockEmailService.ts`)
**Testing**: Not currently configured (no test framework detected in package.json - recommend adding Vitest + React Testing Library)
**Target Platform**: Web browsers (desktop-first responsive, mobile fallback)
**Project Type**: Single React SPA with feature-based structure
**Performance Goals**:
- Action button clicks respond in <100ms (optimistic updates)
- Email list pagination renders in <200ms
- Compose modal opens in <100ms
- Bulk operations on 20 emails complete in <500ms

**Constraints**:
- Mock service layer only (no real backend)
- Must maintain existing authentication flow and protected routes
- Must preserve current three-column layout on desktop
- Must use existing TanStack Query patterns for cache invalidation
- Keep bundle size minimal (no new heavy dependencies)

**Scale/Scope**:
- 9 new action buttons across EmailDetail and EmailList toolbar
- 1 new ComposeModal component (reusable for compose/reply/forward)
- 55 functional requirements across 5 modules (actions, composition, bulk, detail, mobile)
- ~100+ emails in mock dataset after expansion (for pagination testing)
- Mobile breakpoint: <768px

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Evaluation (Before Phase 0)

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| **I. Component Modularity** | Single responsibility, reusable components | ✅ PASS | Plan includes modular components: `ComposeModal`, `ActionButtons`, `BulkActionToolbar`, `PaginationControls`, `MobileBackButton` - each with single responsibility |
| | Props for configuration, not internal state for external data | ✅ PASS | Components receive email data, selection state, and action handlers via props |
| | Feature-specific in feature directories, shared in `src/components/` | ✅ PASS | New components in `src/features/dashboard/components/`, shared utilities in `src/components/ui/` |
| **II. Clean Code Standards** | TypeScript strict mode, functional components + hooks | ✅ PASS | Existing codebase uses strict TS + functional components; plan continues this pattern |
| | Custom hooks for reusable logic | ✅ PASS | Plan includes `useEmailActions`, `useBulkSelection`, `useCompose`, `usePagination` custom hooks |
| | Props typed with interfaces/types | ✅ PASS | All components will have `.types.ts` files with typed props interfaces |
| | ESLint rules pass | ✅ PASS | No linting violations introduced; existing patterns followed |
| **III. State Management Discipline** | Local state (useState) for UI, Context for shared state, separate server state | ✅ PASS | Selection state in local component, TanStack Query for server state (emails, mailboxes) |
| | Avoid prop drilling beyond 2-3 levels | ✅ PASS | State lifted to `DashboardLayout`, max 2 levels to child components |
| **IV. Performance Optimization** | Code splitting, lazy loading, virtualization for long lists | ⚠️ ADVISORY | Pagination implemented instead of virtualization (acceptable for demo; virtualization would be premature optimization for 20-50 items per page) |
| | Optimize bundle size | ✅ PASS | No new heavy dependencies; reusing Radix UI Dialog (already in deps via Label/ScrollArea pattern) |
| **V. Accessibility First (NON-NEGOTIABLE)** | Semantic HTML, ARIA attributes, keyboard navigation | ✅ PASS | Plan specifies: `<button>` elements, ARIA labels, keyboard handlers (Enter/Escape), focus management in modal |
| | Color contrast WCAG AA | ✅ PASS | Uses existing Tailwind design tokens (primary, destructive) meeting AA standards |
| **VI. Testing Strategy** | Unit tests for hooks, component tests for UI | ⚠️ ADVISORY | No test framework configured; recommend adding tests post-implementation (outside current scope) |
| **VII. Build and Deployment Hygiene** | No console warnings/errors, TS/ESLint pass | ✅ PASS | Plan follows existing patterns; no breaking changes |

**Overall Gate Status**: ✅ **PASS** (2 advisory notes, no violations)

**Advisory Notes**:
1. **Virtualization**: Using pagination instead of virtualization for email list. Rationale: Current dataset is small (10-20 emails), pagination is simpler and meets performance goals (<200ms render). Virtualization would add complexity (react-window dependency) without measurable benefit for page sizes of 20-50 items.
2. **Testing**: No tests in current scope due to lack of test framework setup. Recommendation: Add Vitest + React Testing Library in separate initiative, then write tests for new components.

## Project Structure

### Documentation (this feature)

```text
specs/002-email-actions/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - component patterns, modal UX, pagination strategies
├── data-model.md        # Phase 1 output - Email, EmailDraft, EmailSelection entities
├── quickstart.md        # Phase 1 output - dev setup, running locally, testing actions
├── contracts/           # Phase 1 output - mock API contracts for new operations
│   └── email-actions-api.yaml  # OpenAPI spec for delete, star, compose, bulk operations
├── checklists/
│   └── requirements.md  # Quality checklist (already created)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── features/
│   └── dashboard/
│       ├── components/
│       │   ├── DashboardLayout.tsx          # [MODIFY] Add selection state, bulk actions
│       │   ├── EmailList.tsx                # [MODIFY] Add checkboxes, star indicators, toolbar
│       │   ├── EmailDetail.tsx              # [MODIFY] Add action buttons, CC field, download buttons
│       │   ├── FolderList.tsx               # [NO CHANGE] Already complete
│       │   ├── ComposeModal.tsx             # [NEW] Modal for compose/reply/forward
│       │   ├── ComposeModal.types.ts        # [NEW] Props and form types
│       │   ├── EmailActionButtons.tsx       # [NEW] Action buttons for EmailDetail
│       │   ├── EmailActionButtons.types.ts  # [NEW]
│       │   ├── BulkActionToolbar.tsx        # [NEW] Toolbar above EmailList
│       │   ├── BulkActionToolbar.types.ts   # [NEW]
│       │   ├── PaginationControls.tsx       # [NEW] Pagination UI at bottom of EmailList
│       │   ├── PaginationControls.types.ts  # [NEW]
│       │   ├── MobileBackButton.tsx         # [NEW] Back button for mobile email detail
│       │   └── MobileBackButton.types.ts    # [NEW]
│       ├── hooks/
│       │   ├── useEmailActions.ts           # [NEW] Hook for star, delete, mark read/unread
│       │   ├── useBulkSelection.ts          # [NEW] Hook for checkbox selection state
│       │   ├── useCompose.ts                # [NEW] Hook for compose/send logic
│       │   ├── usePagination.ts             # [NEW] Hook for pagination state
│       │   ├── useMailboxes.ts              # [NO CHANGE] Existing
│       │   ├── useEmails.ts                 # [MODIFY] Add pagination params
│       │   ├── useEmailDetail.ts            # [NO CHANGE] Existing
│       │   └── useKeyboardNav.ts            # [MODIFY] Handle selection vs focus separately
│       └── types/
│           ├── email-actions.types.ts       # [NEW] Action types, compose form data
│           └── pagination.types.ts          # [NEW] Pagination types
├── components/
│   └── ui/
│       ├── dialog.tsx                       # [NEW] Radix Dialog wrapper for ComposeModal
│       ├── checkbox.tsx                     # [NEW] Radix Checkbox wrapper
│       └── button.tsx                       # [EXISTING] Already available
├── services/
│   ├── mockEmailService.ts                  # [MODIFY] Add deleteEmail, bulkDelete, bulkMarkRead, sendEmail
│   └── mockHelpers.ts                       # [NO CHANGE] Existing
├── data/
│   ├── mockEmails.json                      # [MODIFY] Expand to 100+ emails, add CC field
│   └── mockFolders.json                     # [NO CHANGE] Existing
└── types/
    └── email.types.ts                       # [MODIFY] Add cc field, EmailDraft type

tests/                                        # [FUTURE] Add test files after setting up Vitest
```

**Structure Decision**: Continue using existing single React SPA structure with feature-based organization. All new dashboard components go in `src/features/dashboard/components/`, custom hooks in `src/features/dashboard/hooks/`, and shared UI primitives (Dialog, Checkbox) in `src/components/ui/`. This maintains consistency with the current `auth` and `dashboard` feature modules and follows the project's established patterns.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None* | N/A | All Constitution principles satisfied |

**Note**: The two advisory items (pagination over virtualization, no tests in current scope) are not violations but documented trade-offs:
- **Pagination**: Simpler than virtualization, meets performance requirements for demo dataset size
- **Testing**: Framework setup is outside feature scope; tests can be added incrementally after Vitest setup

---

## Phase 0: Outline & Research

*Output: `research.md` with resolved technical decisions*

### Research Tasks

1. **Modal UX Patterns**:
   - Research Radix UI Dialog API for ComposeModal
   - Best practices for modal focus management and keyboard traps
   - Escape key handling and click-outside behavior
   - Unsaved changes confirmation pattern

2. **Form State Management**:
   - React Hook Form patterns for multi-field forms (To, Subject, Body)
   - Zod schema for email address validation (support comma-separated list)
   - Pre-filling form data for Reply/Reply All/Forward
   - Draft state management (should drafts persist in localStorage or discard on close?)

3. **Bulk Selection Patterns**:
   - Checkbox state management for dynamic lists
   - Select All / Deselect All toggle behavior
   - Visual indication of selected items (background color, border, checkbox state)
   - Handling selection state during folder navigation (clear or persist?)

4. **Pagination Strategies**:
   - Client-side vs server-side pagination trade-offs (mock service can support both)
   - URL state management for page number (query params vs component state)
   - Handling edge cases: delete last item on page, refresh while on page > 1
   - Pagination controls UI: Previous/Next buttons, page numbers (how many to show?)

5. **TanStack Query Cache Invalidation**:
   - Optimistic updates for instant feedback (star, delete)
   - Cache invalidation after mutations (invalidate mailboxes query after star)
   - Handling concurrent mutations (multiple deletes, rapid starring)
   - Error handling and rollback on mutation failure

6. **Mobile Navigation State**:
   - Single-column state management: show list vs show detail
   - Browser history integration for back button (pushState or local state?)
   - Swipe gesture libraries (optional enhancement - react-swipeable?)
   - Handling orientation changes on mobile

7. **Attachment Download Simulation**:
   - Mock download behavior: create Blob URL from JSON data or just show message?
   - Browser download API: `<a download>` attribute or `window.open()`?
   - Success/error messaging for downloads

8. **Email Quoting for Reply/Forward**:
   - Quote formatting: plain text with "> " prefix or HTML <blockquote>?
   - Include original headers (From/To/Date) in forward body
   - Cursor positioning in compose modal (after quote or before?)

---

## Phase 1: Design & Contracts

*Prerequisites: `research.md` complete*

*Output: `data-model.md`, `/contracts/*`, `quickstart.md`, updated agent context*

### Data Model

**File**: `data-model.md`

Entities to document:
- **Email** (extended): Add `cc` field (array of recipients), ensure `isStarred` and `isRead` are mutable
- **EmailDraft**: New entity with `to`, `cc`, `bcc`, `subject`, `body`, `attachments` (optional), `replyToEmailId` (optional), `forwardEmailId` (optional)
- **EmailSelection**: New entity tracking `selectedIds: string[]`, `selectAll: boolean`, `count: number`
- **Attachment** (clarify): `id`, `filename`, `size`, `mimeType`, `url` (mock URL for download)
- **Pagination**: `page: number`, `limit: number`, `total: number`, `totalPages: number`

Validation rules:
- EmailDraft: `to` must have at least one valid email, `subject` cannot be empty
- Email: `cc` field is optional, hidden when empty
- Pagination: `page` must be >= 1 and <= `totalPages`

State transitions:
- Email: `isRead: false → true` (when viewed or marked read), `isStarred: false ↔ true` (toggle)
- Email: `mailboxId: 'inbox' → 'trash'` (on delete), cannot be undone in UI (Trash is final destination)
- EmailSelection: cleared when folder changes

### API Contracts

**File**: `contracts/email-actions-api.yaml`

Endpoints to define (OpenAPI 3.0 format):

```yaml
/api/emails/{id}/star:
  PATCH:
    summary: Toggle star status
    requestBody: { isStarred: boolean }
    responses: 200 (updated Email), 404 (not found)

/api/emails/{id}/read:
  PATCH:
    summary: Mark as read/unread
    requestBody: { isRead: boolean }
    responses: 200 (updated Email), 404 (not found)

/api/emails/{id}:
  DELETE:
    summary: Move email to Trash
    responses: 204 (success), 404 (not found)

/api/emails/bulk:
  POST:
    summary: Bulk operations
    requestBody: { emailIds: string[], action: 'delete' | 'markRead' | 'markUnread' }
    responses: 200 (array of updated Emails), 400 (invalid action)

/api/emails:
  POST:
    summary: Send new email (compose/reply/forward)
    requestBody: EmailDraft
    responses: 201 (created Email in Sent folder), 400 (validation error)

/api/emails/{id}/download-attachment/{attachmentId}:
  GET:
    summary: Download attachment
    responses: 200 (file blob), 404 (not found)
```

### Quickstart Guide

**File**: `quickstart.md`

Sections:
1. **Development Setup**: No new dependencies (Radix Dialog already available via peer deps), just pull latest branch
2. **Running Locally**: `npm run dev`, navigate to `/inbox` after login
3. **Testing Email Actions**:
   - Star an email: Click star button in EmailDetail, verify Starred folder count updates
   - Compose: Click "Compose" in toolbar, fill form, send, check Sent folder
   - Bulk delete: Check 3 emails, click Delete in toolbar, verify moved to Trash
   - Mobile: Resize to <768px, tap email, tap back button
4. **Mock Data**: How to expand mockEmails.json for pagination testing (add 100+ emails)
5. **Troubleshooting**: Common issues (modal not opening, checkboxes not appearing, pagination not showing)

### Agent Context Update

**Script**: `.specify/scripts/bash/update-agent-context.sh claude`

Technologies to add to CLAUDE.md (if not present):
- Radix UI Dialog (for modals)
- Radix UI Checkbox (for bulk selection)
- TanStack Query mutations with optimistic updates pattern
- React Hook Form with dynamic field arrays (for comma-separated emails)
- Mobile-first responsive patterns with Tailwind breakpoints

**Note**: Preserve manual additions between `<!-- MANUAL ADDITIONS START -->` and `<!-- MANUAL ADDITIONS END -->` markers.

---

## Phase 2: Task Generation

*This phase is NOT executed by `/speckit.plan`. Tasks are generated by `/speckit.tasks` command.*

The `/speckit.tasks` command will use this plan, the spec, and the data model to generate:
- `tasks.md` with dependency-ordered implementation tasks
- Task categories: Setup, Component Implementation, Hook Implementation, Service Layer, Integration, Testing (if framework added)
- Estimated 20-30 tasks total

---

## Constitution Check Re-evaluation (Post-Design)

*GATE: Re-check after Phase 1 design artifacts are complete*

### Post-Design Evaluation

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| **I. Component Modularity** | Single responsibility achieved | ✅ PASS | Detailed design confirms: `ComposeModal` handles only composition, `BulkActionToolbar` only bulk actions, `EmailActionButtons` only individual actions |
| | Props-based configuration | ✅ PASS | All components receive handlers and data via props; no global state mutations |
| **II. Clean Code Standards** | TypeScript types defined | ✅ PASS | All `.types.ts` files planned with prop interfaces |
| **III. State Management Discipline** | Appropriate state level | ✅ PASS | Selection state in `DashboardLayout`, form state in `ComposeModal`, server state via TanStack Query |
| **IV. Performance Optimization** | Bundle size acceptable | ✅ PASS | Radix Dialog ~10KB gzipped (acceptable); no other new deps |
| **V. Accessibility First** | ARIA and keyboard support | ✅ PASS | Design includes: dialog role, aria-labels, focus trap in modal, keyboard handlers |
| **VI. Testing Strategy** | Test coverage plan | ⚠️ ADVISORY | Tests not in scope but design is testable (mock service functions, component unit tests) |
| **VII. Build and Deployment** | No breaking changes | ✅ PASS | Design extends existing architecture without breaking changes |

**Overall Gate Status**: ✅ **PASS** (same advisory note on testing)

---

## Next Steps

1. ✅ **Phase 0 & 1 Complete**: `research.md`, `data-model.md`, `contracts/`, `quickstart.md` generated
2. ✅ **Agent Context Updated**: Technologies added to CLAUDE.md
3. **Ready for `/speckit.tasks`**: Generate actionable task list from this plan
4. **Ready for `/speckit.implement`**: Execute tasks after task generation

**Recommendation**: Run `/speckit.tasks` next to generate the implementation task list with proper dependency ordering.
