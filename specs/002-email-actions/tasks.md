# Tasks: Email Actions & Enhanced Dashboard

**Feature**: 002-email-actions
**Status**: Not Started
**Last Updated**: 2025-11-19

---

## Implementation Strategy

**MVP Scope** (US1 + US2): Core email actions (star, delete, mark unread) + email composition
**Phase 2 Scope**: Reply/Forward actions (US3, US4)
**Phase 3 Scope**: Bulk operations and enhancements (US5-US9)

**Estimated Total Tasks**: 65 tasks across 12 phases

---

## Task Format

```
- [ ] [TaskID] [P?] [Story?] Description with file path
```

- **TaskID**: T001-T065
- **[P]**: Parallel-safe (can run simultaneously with other [P] tasks)
- **[Story]**: [US1]-[US9] for user story association
- **File paths**: Absolute from project root

---

## Dependencies

**Story Dependencies** (must be completed in order):
1. US1 (Email Viewing Actions) - No dependencies
2. US2 (Email Composition) - Requires US1 types/services
3. US3 (Email Reply) - Requires US2 ComposeModal
4. US4 (Email Forward) - Requires US2 ComposeModal
5. US5 (Bulk Selection) - Requires US1 delete actions
6. US6 (Enhanced Detail) - Independent, can parallel with US5
7. US7 (Pagination) - Independent, can parallel with US5-US6
8. US8 (Mobile Navigation) - Independent, can parallel with US5-US7
9. US9 (Email Refresh) - Independent, can parallel with US5-US8

**Parallel Execution Examples**:
- Phase 2 (Foundational): T004-T010 can run in parallel (different files)
- US6, US7, US8, US9 can be implemented in parallel after US1-US4

---

## Phase 1: Project Setup (T001-T003)

**Goal**: Prepare project structure and verify existing codebase

- [X] [T001] [P] Verify existing dashboard structure in `src/features/dashboard/`
- [X] [T002] [P] Audit existing email types in `src/features/dashboard/types/email.types.ts` and `src/types/email.ts`
- [X] [T003] [P] Review existing mockEmailService in `src/services/mockEmailService.ts`

---

## Phase 2: Foundational Components (T004-T010)

**Goal**: Create shared UI primitives and extend type system

**Independent Test**: All components render without errors

### Type Extensions
- [X] [T004] [P] Extend Email type with `cc: string[]` field in `src/features/dashboard/types/email.types.ts`
- [X] [T005] [P] Create EmailDraft type in `src/features/dashboard/types/email.types.ts`
- [X] [T006] [P] Create BulkAction type in `src/features/dashboard/types/email.types.ts`

- [X] [T004] [P] Extend Email type with `cc: string[]` field in `src/features/dashboard/types/email.types.ts`
- [X] [T005] [P] Create EmailDraft type in `src/features/dashboard/types/email.types.ts`
- [X] [T006] [P] Create BulkAction type in `src/features/dashboard/types/email.types.ts`

### Radix UI Wrapper Components
- [X] [T007] [P] Create dialog.tsx wrapper for Radix Dialog in `src/components/ui/dialog.tsx`
- [X] [T008] [P] Create checkbox.tsx wrapper for Radix Checkbox in `src/components/ui/checkbox.tsx`

### Service Extensions
- [X] [T009] Update mockEmailService.ts with deleteEmail function in `src/services/mockEmailService.ts`
- [X] [T010] Update mockEmailService.ts with sendEmail function in `src/services/mockEmailService.ts`

- [X] [T009] Update mockEmailService.ts with deleteEmail function in `src/services/mockEmailService.ts`
- [X] [T010] Update mockEmailService.ts with sendEmail function in `src/services/mockEmailService.ts`

---

## Phase 3: US1 - Email Viewing Actions (T011-T018)

**Goal**: Implement star, delete, mark unread actions in EmailDetail

**Independent Test**: Click star/delete/mark unread buttons, verify email state updates

**Story**: [US1] Email Viewing Actions (Priority: P1)

### Component Creation
- [X] [T011] [US1] Create EmailActionButtons component skeleton in `src/features/dashboard/components/EmailActionButtons.tsx`
- [X] [T012] [US1] Add star button with icon to EmailActionButtons in `src/features/dashboard/components/EmailActionButtons.tsx`
- [X] [T013] [US1] Add delete button with icon to EmailActionButtons in `src/features/dashboard/components/EmailActionButtons.tsx`
- [X] [T014] [US1] Add mark unread button with icon to EmailActionButtons in `src/features/dashboard/components/EmailActionButtons.tsx`

- [X] [T011] [US1] Create EmailActionButtons component skeleton in `src/features/dashboard/components/EmailActionButtons.tsx`
- [X] [T012] [US1] Add star button with icon to EmailActionButtons in `src/features/dashboard/components/EmailActionButtons.tsx`
- [X] [T013] [US1] Add delete button with icon to EmailActionButtons in `src/features/dashboard/components/EmailActionButtons.tsx`
- [X] [T014] [US1] Add mark unread button with icon to EmailActionButtons in `src/features/dashboard/components/EmailActionButtons.tsx`

### Hook Implementation
- [X] [T015] [US1] Create useEmailActions hook in `src/features/dashboard/hooks/useEmailActions.ts`
- [X] [T016] [US1] Implement toggleStar mutation in useEmailActions hook in `src/features/dashboard/hooks/useEmailActions.ts`
- [X] [T017] [US1] Implement deleteEmail mutation in useEmailActions hook in `src/features/dashboard/hooks/useEmailActions.ts`
- [X] [T018] [US1] Implement markUnread mutation in useEmailActions hook in `src/features/dashboard/hooks/useEmailActions.ts`

- [X] [T015] [US1] Create useEmailActions hook in `src/features/dashboard/hooks/useEmailActions.ts`
- [X] [T016] [US1] Implement toggleStar mutation in useEmailActions hook in `src/features/dashboard/hooks/useEmailActions.ts`
- [X] [T017] [US1] Implement deleteEmail mutation in useEmailActions hook in `src/features/dashboard/hooks/useEmailActions.ts`
- [X] [T018] [US1] Implement markUnread mutation in useEmailActions hook in `src/features/dashboard/hooks/useEmailActions.ts`

### Integration
- [X] [T019] [US1] Integrate EmailActionButtons into EmailDetail component in `src/features/dashboard/components/EmailDetail.tsx`
- [X] [T020] [US1] Add optimistic updates for star action in useEmailActions hook in `src/features/dashboard/hooks/useEmailActions.ts`
- [X] [T021] [US1] Handle delete navigation (redirect to inbox) in EmailDetail in `src/features/dashboard/components/EmailDetail.tsx`

- [X] [T019] [US1] Integrate EmailActionButtons into EmailDetail component in `src/features/dashboard/components/EmailDetail.tsx`
- [X] [T020] [US1] Add optimistic updates for star action in useEmailActions hook in `src/features/dashboard/hooks/useEmailActions.ts`
- [X] [T021] [US1] Handle delete navigation (redirect to inbox) in EmailDetail in `src/features/dashboard/components/EmailDetail.tsx`

---

## Phase 4: US2 - Email Composition (T022-T032)

**Goal**: Implement compose modal with send functionality

**Independent Test**: Click Compose, fill form, send email, verify it appears in Sent folder

**Story**: [US2] Email Composition (Priority: P1)

### Modal Component
- [X] [T022] [US2] Create ComposeModal component skeleton in `src/features/dashboard/components/ComposeModal.tsx`
- [X] [T023] [US2] Add Radix Dialog wrapper to ComposeModal in `src/features/dashboard/components/ComposeModal.tsx`
- [X] [T024] [US2] Create form fields (to, subject, body) in ComposeModal in `src/features/dashboard/components/ComposeModal.tsx`

- [X] [T022] [US2] Create ComposeModal component skeleton in `src/features/dashboard/components/ComposeModal.tsx`
- [X] [T023] [US2] Add Radix Dialog wrapper to ComposeModal in `src/features/dashboard/components/ComposeModal.tsx`
- [X] [T024] [US2] Create form fields (to, subject, body) in ComposeModal in `src/features/dashboard/components/ComposeModal.tsx`

### Form Validation
- [X] [T025] [US2] Define Zod schema for email composition in `src/features/dashboard/components/ComposeModal.tsx`
- [X] [T026] [US2] Integrate React Hook Form with Zod in ComposeModal in `src/features/dashboard/components/ComposeModal.tsx`
- [X] [T027] [US2] Add email validation for "to" field in ComposeModal in `src/features/dashboard/components/ComposeModal.tsx`

- [X] [T025] [US2] Define Zod schema for email composition in `src/features/dashboard/components/ComposeModal.tsx`
- [X] [T026] [US2] Integrate React Hook Form with Zod in ComposeModal in `src/features/dashboard/components/ComposeModal.tsx`
- [X] [T027] [US2] Add email validation for "to" field in ComposeModal in `src/features/dashboard/components/ComposeModal.tsx`

### Hook Implementation
- [X] [T028] [US2] Create useCompose hook in `src/features/dashboard/hooks/useCompose.ts`
- [X] [T029] [US2] Implement sendEmail mutation in useCompose hook in `src/features/dashboard/hooks/useCompose.ts`
- [X] [T030] [US2] Add success/error toast notifications in useCompose hook in `src/features/dashboard/hooks/useCompose.ts`

- [X] [T028] [US2] Create useCompose hook in `src/features/dashboard/hooks/useCompose.ts`
- [X] [T029] [US2] Implement sendEmail mutation in useCompose hook in `src/features/dashboard/hooks/useCompose.ts`
- [X] [T030] [US2] Add success/error toast notifications in useCompose hook in `src/features/dashboard/hooks/useCompose.ts`

### Integration
- [X] [T031] [US2] Add Compose button to DashboardLayout toolbar in `src/features/dashboard/components/DashboardLayout.tsx`
- [X] [T032] [US2] Wire ComposeModal open/close state in DashboardLayout in `src/features/dashboard/components/DashboardLayout.tsx`

- [X] [T031] [US2] Add Compose button to DashboardLayout toolbar in `src/features/dashboard/components/DashboardLayout.tsx`
- [X] [T032] [US2] Wire ComposeModal open/close state in DashboardLayout in `src/features/dashboard/components/DashboardLayout.tsx`

---

## Phase 5: US3 - Email Reply Actions (T033-T039)

**Goal**: Implement Reply and Reply All with pre-filled recipients

**Independent Test**: Click Reply, verify modal opens with correct to/subject, send reply

**Story**: [US3] Email Reply Actions (Priority: P2)

### Reply Logic
- [X] [T033] [US3] Add Reply button to EmailActionButtons in `src/features/dashboard/components/EmailActionButtons.tsx`
- [X] [T034] [US3] Add Reply All button to EmailActionButtons in `src/features/dashboard/components/EmailActionButtons.tsx`
- [X] [T035] [US3] Create reply mode handler in useCompose hook in `src/features/dashboard/hooks/useCompose.ts`
- [X] [T036] [US3] Implement recipient pre-fill logic for Reply in useCompose in `src/features/dashboard/hooks/useCompose.ts`
- [X] [T037] [US3] Implement recipient pre-fill logic for Reply All in useCompose in `src/features/dashboard/hooks/useCompose.ts`

### Subject Handling
- [X] [T038] [US3] Add "Re:" prefix to subject in reply mode in `src/features/dashboard/hooks/useCompose.ts`
- [X] [T039] [US3] Pass email context to ComposeModal for reply in `src/features/dashboard/components/EmailDetail.tsx`

---

## Phase 6: US4 - Email Forwarding (T040-T044)

**Goal**: Implement Forward with quoted original content

**Independent Test**: Click Forward, verify quoted content, send to new recipient

**Story**: [US4] Email Forwarding (Priority: P2)

### Forward Logic
- [X] [T040] [US4] Add Forward button to EmailActionButtons in `src/features/dashboard/components/EmailActionButtons.tsx`
- [X] [T041] [US4] Create forward mode handler in useCompose hook in `src/features/dashboard/hooks/useCompose.ts`
- [X] [T042] [US4] Implement quoted content formatting in useCompose in `src/features/dashboard/hooks/useCompose.ts`
- [X] [T043] [US4] Add "Fwd:" prefix to subject in forward mode in `src/features/dashboard/hooks/useCompose.ts`
- [X] [T044] [US4] Clear recipient field for forward mode in ComposeModal in `src/features/dashboard/components/ComposeModal.tsx`

---

## Phase 7: US5 - Bulk Email Selection (T045-T052)

**Goal**: Implement checkboxes and bulk operations (delete, mark read)

**Independent Test**: Select multiple emails, perform bulk delete, verify emails removed

**Story**: [US5] Bulk Email Selection (Priority: P3)

### Selection UI
- [X] [T045] [US5] Add checkbox column to EmailList items in `src/features/dashboard/components/EmailList.tsx`
- [X] [T046] [US5] Create BulkActionToolbar component skeleton in `src/features/dashboard/components/BulkActionToolbar.tsx`
- [X] [T047] [US5] Add Select All checkbox to BulkActionToolbar in `src/features/dashboard/components/BulkActionToolbar.tsx`
- [X] [T048] [US5] Add bulk delete button to BulkActionToolbar in `src/features/dashboard/components/BulkActionToolbar.tsx`
- [X] [T049] [US5] Add bulk mark as read button to BulkActionToolbar in `src/features/dashboard/components/BulkActionToolbar.tsx`

### Hook Implementation
- [X] [T050] [US5] Create useBulkSelection hook in `src/features/dashboard/hooks/useBulkSelection.ts`
- [X] [T051] [US5] Implement bulkDelete mutation in useBulkSelection in `src/features/dashboard/hooks/useBulkSelection.ts`
- [X] [T052] [US5] Implement bulkMarkRead mutation in useBulkSelection in `src/features/dashboard/hooks/useBulkSelection.ts`

### Service Extension
- [X] [T053] [US5] Add bulkDelete function to mockEmailService in `src/services/mockEmailService.ts`
- [X] [T054] [US5] Add bulkMarkRead function to mockEmailService in `src/services/mockEmailService.ts`

---

## Phase 8: US6 - Enhanced Email Detail (T055-T057)

**Goal**: Display CC field and enable attachment downloads

**Independent Test**: View email with CC and attachments, download attachment

**Story**: [US6] Enhanced Email Detail (Priority: P3)

### CC Display
- [X] [T055] [US6] Add CC field display to EmailDetail component in `src/features/dashboard/components/EmailDetail.tsx`
- [X] [T056] [US6] Update mockEmails.json with sample CC data in `src/data/mockEmails.json`

### Attachment Handling
- [X] [T057] [US6] Add attachment download links to EmailDetail in `src/features/dashboard/components/EmailDetail.tsx`

---

## Phase 9: US7 - Email List Pagination (T058-T061)

**Goal**: Paginate email list with Previous/Next controls

**Independent Test**: Navigate between pages, verify correct emails displayed

**Story**: [US7] Email List Pagination (Priority: P3)

### Pagination Component
- [X] [T058] [US7] Create PaginationControls component in `src/features/dashboard/components/PaginationControls.tsx`
- [X] [T059] [US7] Create usePagination hook in `src/features/dashboard/hooks/usePagination.ts`

### Integration
- [X] [T060] [US7] Integrate pagination into EmailList component in `src/features/dashboard/components/EmailList.tsx`
- [X] [T061] [US7] Update useEmails hook to support pagination in `src/features/dashboard/hooks/useEmails.ts`

---

## Phase 10: US8 - Mobile Responsive Navigation (T062)

**Goal**: Add back button for mobile email detail view

**Independent Test**: On mobile viewport, view email, click back, return to list

**Story**: [US8] Mobile Responsive Navigation (Priority: P3)

- [X] [T062] [US8] Create MobileBackButton component and integrate into EmailDetail in `src/features/dashboard/components/EmailDetail.tsx`

---

## Phase 11: US9 - Email List Refresh (T063)

**Goal**: Add refresh button to reload email list

**Independent Test**: Click refresh, verify email list updates

**Story**: [US9] Email List Refresh (Priority: P4)

- [X] [T063] [US9] Add refresh button to DashboardLayout toolbar in `src/features/dashboard/components/DashboardLayout.tsx`

---

## Phase 12: Integration & Polish (T064-T065)

**Goal**: Final integration and cleanup

- [X] [T064] Update keyboard navigation in useKeyboardNav hook for new actions in `src/features/dashboard/hooks/useKeyboardNav.ts`
- [X] [T065] Add error boundaries for ComposeModal and bulk actions in `src/features/dashboard/components/DashboardLayout.tsx`

---

## Task Summary

**Total Tasks**: 65

**By Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 7 tasks
- Phase 3 (US1): 11 tasks
- Phase 4 (US2): 11 tasks
- Phase 5 (US3): 7 tasks
- Phase 6 (US4): 5 tasks
- Phase 7 (US5): 10 tasks
- Phase 8 (US6): 3 tasks
- Phase 9 (US7): 4 tasks
- Phase 10 (US8): 1 task
- Phase 11 (US9): 1 task
- Phase 12 (Polish): 2 tasks

**By Priority**:
- P1 (MVP): 22 tasks (US1 + US2)
- P2: 12 tasks (US3 + US4)
- P3: 28 tasks (US5 + US6 + US7 + US8)
- P4: 1 task (US9)
- Setup/Polish: 2 tasks

**Parallel Execution Opportunities**:
- Phase 2: T004-T008 (type definitions and UI components)
- After US1-US4: US6, US7, US8, US9 can run in parallel
- Foundational service extensions (T009-T010) can run in parallel

---

## Notes

- No test tasks included (testing framework not configured per requirements)
- All file paths are absolute from project root
- Tasks marked [P] are truly parallel (different files, no shared state)
- Each user story phase includes Goal and Independent Test sections
- MVP scope covers US1 + US2 (22 tasks) for core functionality
- Mock data updates included where needed (mockEmails.json, mockEmailService.ts)
