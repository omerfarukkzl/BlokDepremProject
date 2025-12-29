# Story 6.1: Admin Reports Dashboard

Status: done

## Story

As an **Admin**,
I want to access a reports dashboard,
So that I can view prediction accuracy analytics.

## Scope Clarification

> **This story creates the dashboard shell with routing, access control, and a placeholder chart.** Real data integration and detailed accuracy reports are implemented in Story 6.2.

## Acceptance Criteria

1.  **Given** I am logged in with admin role
    **When** I navigate to `/admin/reports`
    **Then** a dashboard with prediction accuracy metrics placeholder is displayed
    **And** non-admin users are redirected with 403 Forbidden

## Tasks / Subtasks

- [x] Task 1: Update Constants (AC: 1)
  - [x] Add `REPORTS: '/admin/reports'` to `ROUTES.ADMIN` in `frontend/src/constants/index.ts`
  - [x] Add `REPORTS: { DASHBOARD_STATS: '/ai/reports/stats' }` to `API_ENDPOINTS` in `frontend/src/constants/index.ts`

- [x] Task 2: Create AdminReportsPage Component (AC: 1)
  - [x] Create directory `frontend/src/pages/admin/` if not exists
  - [x] Create `frontend/src/pages/admin/AdminReportsPage.tsx`
  - [x] Implement layout with "Admin Dashboard" header
  - [x] Create metrics grid container for future widgets
  - [x] Add placeholder `BarChart` from recharts with mock data
  - [x] Implement loading state using `LoadingSpinner` from `components/ui`
  - [x] Implement error state with "Unable to load dashboard data" + retry button

- [x] Task 3: Install Dependencies (AC: 1)
  - [x] Run `npm install recharts` in frontend directory
  - [x] Verify recharts version is 2.x stable (latest)

- [x] Task 4: Update Routing (AC: 1)
  - [x] Update `frontend/src/App.tsx`
  - [x] Import `AdminReportsPage` component
  - [x] Replace `/admin/*` placeholder with `AdminReportsPage` at `/admin/reports`
  - [x] Ensure `ProtectedRoute` with `requiredRole="admin"` wraps the route
  - [x] Add fallback redirect from `/admin` to `/admin/reports`

- [x] Task 5: Backend Endpoint Stub (AC: 1)
  - [x] Add `getReportsStats()` method to `backend/src/modules/ai/ai.controller.ts`
  - [x] Protect with `@UseGuards(AuthGuard('jwt'))` and admin role check
  - [x] Return mock `DashboardStats` response for now
  - [x] Endpoint path: `GET /ai/reports/stats`

- [x] Task 6: Component Tests (AC: 1)
  - [x] Create `frontend/src/pages/admin/AdminReportsPage.test.tsx`
  - [x] Test: Renders dashboard header
  - [x] Test: Renders placeholder chart
  - [x] Verify ProtectedRoute integration via existing tests

- [x] Task 7: Manual UX Verification - **MANDATORY per Epic 5 Retro**
  - [x] Login as admin user (wallet with admin role)
  - [x] Navigate to `/admin/reports`
  - [x] Verify dashboard loads without console errors
  - [x] Verify placeholder chart renders correctly
  - [x] Test with official role → should redirect (403 behavior)
  - [x] Test unauthenticated → should redirect to login

## Dev Notes

### Scope Reminder
This story creates the **dashboard shell**. Story 6.2 implements real prediction accuracy data fetching and display.

### From Epic 5 Retrospective
- ✅ **Recharts** selected as visualization library (team decision)
- ✅ **GIN Indexing** planned for JSONB columns (backend prep for 6.2+)
- ⚠️ **Manual Verification is MANDATORY** - Action Item 5.1

### TypeScript Interfaces

```typescript
// frontend/src/types/reports.ts (create this file)
export interface DashboardStats {
  totalPredictions: number;
  completedPredictions: number;
  averageAccuracy: number;
  recentPredictions: Array<{
    id: string;
    regionName: string;
    accuracy: number;
    createdAt: string;
  }>;
}

// Mock data for placeholder chart
export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalPredictions: 42,
  completedPredictions: 35,
  averageAccuracy: 87.5,
  recentPredictions: [
    { id: '1', regionName: 'Istanbul', accuracy: 92, createdAt: '2025-12-28' },
    { id: '2', regionName: 'Ankara', accuracy: 85, createdAt: '2025-12-27' },
    { id: '3', regionName: 'Izmir', accuracy: 88, createdAt: '2025-12-26' },
  ],
};
```

### Recharts Usage Pattern

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Example placeholder chart
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={mockData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="regionName" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="accuracy" fill="#3B82F6" />
  </BarChart>
</ResponsiveContainer>
```

### Error Handling Pattern (MANDATORY)

```tsx
// Follow project-context.md graceful degradation
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: () => reportsService.getDashboardStats(),
});

if (error) {
  return (
    <div className="text-center py-8">
      <p className="text-red-600">Unable to load dashboard data</p>
      <button onClick={() => refetch()} className="mt-4 btn-primary">
        Retry
      </button>
    </div>
  );
}
```

### File Structure

```
frontend/src/
├── pages/
│   └── admin/                    # NEW - Admin pages directory
│       └── AdminReportsPage.tsx  # NEW - Dashboard component
│       └── AdminReportsPage.test.tsx  # NEW - Tests
├── types/
│   └── reports.ts               # NEW - Report type definitions
├── constants/
│   └── index.ts                 # UPDATE - Add ROUTES.ADMIN.REPORTS
```

### Architecture Compliance
- **Frontend page location:** `frontend/src/pages/admin/` (organized subdirectory for admin pages)
- **Backend controller:** `backend/src/modules/ai/ai.controller.ts` (per architecture.md FR25-29 mapping)
- **Styling:** TailwindCSS utility classes only
- **State:** React Query for server state (already configured in App.tsx)

### Access Control
- Reuse `ProtectedRoute` component with `requiredRole="admin"`
- Backend uses `@UseGuards(AuthGuard('jwt'))` + role check
- Roles defined: `'admin' | 'official' | 'donor'` (see authService.ts)

### Constants Updates Required

```typescript
// frontend/src/constants/index.ts

// In ROUTES.ADMIN section (around line 59):
ADMIN: {
  DASHBOARD: '/admin/dashboard',
  REPORTS: '/admin/reports',  // ADD THIS
  USERS: '/admin/users',
  // ... rest unchanged
},

// In API_ENDPOINTS section (add new section):
REPORTS: {
  DASHBOARD_STATS: '/ai/reports/stats',
},
```

## Dev Agent Record

### Agent Model Used

Antigravity (Claude) - Session 2025-12-29

### Completion Notes List

1. **Task 1 - Constants**: Added `ROUTES.ADMIN.REPORTS` and `API_ENDPOINTS.REPORTS.DASHBOARD_STATS` to frontend constants.
2. **Task 2 - AdminReportsPage**: Created complete dashboard component with:
   - Admin Dashboard header with description
   - 3 metrics cards (Total Predictions, Completed Predictions, Average Accuracy)
   - Recharts BarChart showing prediction accuracy by region
   - LoadingSpinner integration from UI components
   - Error state with retry button following project graceful degradation patterns
3. **Task 3 - Dependencies**: Installed `recharts@2.x` (35 packages added)
4. **Task 4 - Routing**: Updated App.tsx with AdminReportsPage import and nested routing with fallback redirect
5. **Task 5 - Backend Stub**: Added `GET /ai/reports/stats` endpoint with RolesGuard + admin role check
6. **Task 6 - Tests**: Created 4 unit tests covering header, chart, metrics, and section rendering

### Debug Log References

- No significant issues encountered during implementation.
- Fixed type-only import for `DashboardStats` to comply with `verbatimModuleSyntax`.
- Fixed Tooltip formatter type to handle potential undefined values.

### File List

**New Files:**
- `frontend/src/types/reports.ts` - Dashboard stats interface and mock data
- `frontend/src/pages/admin/AdminReportsPage.tsx` - Main dashboard component
- `frontend/src/pages/admin/AdminReportsPage.test.tsx` - Component tests

**Modified Files:**
- `frontend/src/constants/index.ts` - Added ROUTES.ADMIN.REPORTS and API_ENDPOINTS.REPORTS
- `frontend/src/App.tsx` - Added AdminReportsPage import and routing
- `backend/src/modules/ai/ai.controller.ts` - Added getReportsStats endpoint with admin guard
- `frontend/package.json` - Added recharts dependency

