# Story 1.5: Admin Role-Based Access Control

Status: review

## Story

As an **Admin**,
I want elevated permissions for protected admin endpoints,
So that only authorized administrators can access reports and analytics.

## Acceptance Criteria

1. **Given** I am logged in with admin role
   **When** I access admin endpoints (e.g., `/predictions/reports/*`)
   **Then** I am granted access ✅

2. **Given** I am logged in with official role (non-admin)
   **When** I attempt to access admin endpoints
   **Then** I receive 403 Forbidden response with standard error format ✅

3. **Given** I am an unauthenticated user
   **When** I attempt to access admin endpoints
   **Then** I receive 401 Unauthorized response ✅

## Tasks / Subtasks

### Task 1: Create Roles Decorator (AC: #1, #2, #3)

- [x] 1.1 Create `backend/src/common/decorators/roles.decorator.ts`

### Task 2: Create RolesGuard (AC: #1, #2, #3)

- [x] 2.1 Create `backend/src/common/guards/roles.guard.ts`

### Task 3: Create Admin Test Endpoint (AC: #1, #2, #3)

- [x] 3.1 Add admin/test endpoint to `auth.controller.ts`

### Task 4: Create Barrel Exports

- [x] 4.1 Create `backend/src/common/decorators/index.ts`
- [x] 4.2 Create `backend/src/common/guards/index.ts`

### Task 5: Unit Tests

- [x] 5.1 Create `backend/src/common/guards/roles.guard.spec.ts` (6 tests)
- [x] 5.2 Integration tests in `auth.controller.spec.ts` (3 tests)

## Dev Notes

### Critical: Use Existing Guard Pattern

The codebase uses `AuthGuard('jwt')` from `@nestjs/passport`:

```typescript
@UseGuards(AuthGuard('jwt'), RolesGuard)  // AuthGuard first, RolesGuard second
@Roles(OfficialRole.ADMIN)
```

### Existing Foundation ✅

| Component | Location |
|-----------|----------|
| `OfficialRole` enum | `entities/official.entity.ts` |
| JWT includes `role` claim | `auth.service.ts` payload |
| `request.user.role` populated | `jwt.strategy.ts` validate() |

### Error Response Format

```typescript
// 403 Forbidden (from RolesGuard)
{
  success: false,
  error: { code: 'FORBIDDEN', message: 'Admin access required' },
  timestamp: '2025-12-23T...'
}
```

## Dev Agent Record

### Agent Model Used

Claude (Gemini-2.5)

### Completion Notes List

- Created `@Roles()` decorator using NestJS `SetMetadata`
- Created `RolesGuard` with Reflector pattern for metadata reading
- Guard throws `ForbiddenException` with standard API error format
- Added `GET /auth/admin/test` endpoint protected by both guards
- All 9 new tests pass, 47 total tests pass with no regressions

### File List

**New Files:**
- `backend/src/common/decorators/roles.decorator.ts`
- `backend/src/common/decorators/index.ts`
- `backend/src/common/guards/roles.guard.ts`
- `backend/src/common/guards/index.ts`
- `backend/src/common/guards/roles.guard.spec.ts`

**Modified Files:**
- `backend/src/modules/auth/auth.controller.ts` - Added admin/test endpoint
- `backend/src/modules/auth/auth.controller.spec.ts` - Added admin endpoint tests

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story created - ready for dev | SM Agent |
| 2025-12-23 | Quality review: applied 7 improvements | Validator |
| 2025-12-23 | Implementation complete - all tests pass (47 total) | Dev Agent |
