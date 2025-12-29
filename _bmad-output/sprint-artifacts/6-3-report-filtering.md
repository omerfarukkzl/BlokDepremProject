# Story 6.3: Report Filtering

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story
...
- [x] Task 6: Compliance & Testing
  - [x] TypeScript type checking passes (backend & frontend)
  - [x] Backend tests pass (140 tests)
  - [x] [AI-Review] Compliance: Backend accuracy tests extended for filters (16/16 cases)

## Dev Notes
...
### Change Log

- 2025-12-29: Implemented Report Filtering feature (Story 6.3) - Date range, region, and aid category filters with URL state persistence
- 2025-12-29: [Code Review] Fixed date filtering timezone logic and added comprehensive unit tests for filter verification.

## Senior Developer Review (AI)

**Reviewer:** Antigravity (AI)
**Date:** 2025-12-29
**Outcome:** ✅ Approved

**Findings:**
- **Critical Fixed**: Untracked files (`ReportFilters`, `ReportsFilterBar`) were identified and added to git.
- **Critical Fixed**: Missing tests for `getAccuracyMetrics` filtering logic were implemented. 16/16 tests now pass.
- **Medium Fixed**: Date filtering logic in `ai.service.ts` updated to robustly handle start-of-day/end-of-day boundaries.
- **Verification**: Verified all Acceptance Criteria are met with implementation evidence. Backend logic now explicitly tested for edge cases.

**Next Steps:**
- Proceed to Story 6.5 (Aggregate Accuracy Metrics).

As an **Admin**,
I want to filter reports by date range, region, and aid category,
So that I can analyze specific segments of data (e.g., "How accurate were Tent predictions in Hatay last week?").

## Acceptance Criteria

1.  **Given** I am on the reports dashboard (`/admin/reports`)
    **When** I select a date range (Start Date, End Date), a Region, or an Aid Category
    **Then** the "Overall Accuracy" metrics, "Predicted vs Actual" chart, and "Recent Predictions" table update to show only matching data
    **And** the charts reflect only the selected Category if one is filtered (e.g., only Tents)

2.  **Given** filters are applied
    **When** I click "Clear Filters"
    **Then** all input fields reset
    **And** the dashboard shows all data again

3.  **Given** I apply filters
    **Then** the browser URL updates with query parameters (e.g., `?region=Hatay&category=tent&from=2025-01-01`)
    **And** refreshing the page (or sharing the link) preserves the filter state

4.  **Given** no data matches the filters
    **Then** a helpful "No matching records found" message is displayed

## Tasks / Subtasks

- [x] Task 1: Backend - Filter DTO and Controller Update (AC: 1)
  - [x] Create `backend/src/modules/ai/dto/get-reports-stats.dto.ts`
    - [x] Add optional fields: `startDate` (Date), `endDate` (Date), `regionId` (string), `category` (string enum: tent, container, food_package, blanket)
    - [x] Add `class-validator` decorators (`@IsOptional`, `@IsDateString`, `@IsString`)
  - [x] Update `getReportsStats` in `backend/src/modules/ai/ai.controller.ts` to use `@Query()` with the new DTO

- [x] Task 2: Backend - Service Filtering Logic (AC: 1, 4)
  - [x] Update `getAccuracyMetrics` in `backend/src/modules/ai/ai.service.ts` to accept the DTO
  - [x] Implement Date Range filtering using in-memory filter on `created_at`
  - [x] Implement Region filtering using in-memory filter on `region_id`
  - [x] Update Aggregation Logic:
    - [x] If `category` filter is present, only compute accuracy/totals for that specific key in `prediction.predictedQuantities`
    - [x] If `category` is NOT present, compute for all as before

- [x] Task 3: Frontend - Filter Store/State (AC: 3)
  - [x] Update `frontend/src/pages/admin/AdminReportsPage.tsx` logic
  - [x] Use `react-router-dom`'s `useSearchParams` to manage filter state (Single Source of Truth)
  - [x] Ensure React Query refetches data when search params change

- [x] Task 4: Frontend - Filter Bar Component (AC: 1, 2)
  - [x] Create `frontend/src/components/features/predictions/ReportsFilterBar.tsx`
    - [x] Inputs: DateRangePicker (start/end), Region Select (dropdown from constants/API), Category Select
    - [x] "Clear Filters" button
    - [x] Style with TailwindCSS to match dashboard theme

- [x] Task 5: Frontend - Integration (AC: 1, 3, 4)
  - [x] Add `ReportsFilterBar` to `AdminReportsPage`
  - [x] Pass current filter values from URL to the component
  - [x] Pass filters to `aiService.getReportsStats()` API call
  - [x] Handle empty state when filtered results are empty

- [x] Task 6: Compliance & Testing
  - [x] TypeScript type checking passes (backend & frontend)
  - [x] Backend tests pass (140 tests)

## Dev Notes

- **Architecture Compliance**:
  - **DTO Validation**: Don't skip `class-validator`. Ensure dates are parsed correctly from query strings.
  - **URL State**: Do NOT duplicate state in `useState` and URL. Use `useSearchParams` as the primary driver for the API call to ensure deep-linking works (AC 3).

- **Technical Implementation Details**:
  - **Date Filtering**: Remember to handle timezones or set time to start-of-day/end-of-day for the range (00:00:00 to 23:59:59).
  - **Category Logic**: Since `predictedQuantities` is `jsonb` (`Record<string, number>`), you can't easily filter *rows* by key in SQL without complex JSON queries. Better to fetch the entities matching Date/Region (using standard SQL), then in the TypeScript aggregation loop, just skip keys that don't match the selected category. Given the prototype scale, this in-memory reduction is acceptable and safer.

- **Previous Story Learnings (Story 6.2)**:
  - Reuse the `AccuracyChart` component. Ensure it handles single-category data gracefully (it might just show 1 group of bars instead of 4).

### References

- `backend/src/modules/ai/ai.service.ts`: Update `getAccuracyMetrics`.
- `frontend/src/pages/admin/AdminReportsPage.tsx`: Add filtering.
- `Story 6.2`: See `calculateAccuracy` logic.

## Dev Agent Record

### Agent Model Used

Antigravity (Claude) - Session 2025-12-29

### Debug Log References

### Completion Notes List

- ✅ Created `get-reports-stats.dto.ts` with `@IsOptional`, `@IsDateString`, `@IsString`, `@IsIn` validators
- ✅ Updated `ai.controller.ts` to use `@Query()` decorator with the new DTO
- ✅ Updated `ai.service.ts` with date/region/category filtering logic in `getAccuracyMetrics()`
- ✅ Added `ReportFilters` interface and `AID_CATEGORY_OPTIONS` to `reports.ts`
- ✅ Updated `aiService.ts` to accept filters and build query string
- ✅ Created `ReportsFilterBar.tsx` with date pickers, region/category dropdowns, and clear button
- ✅ Rewrote `AdminReportsPage.tsx` with `useSearchParams` for URL-based filter state
- ✅ Added "No matching records found" empty state for filtered results (AC 4)
- ✅ TypeScript compilation successful for backend and frontend
- ✅ All 140 backend tests pass

### File List

- backend/src/modules/ai/dto/get-reports-stats.dto.ts (NEW)
- backend/src/modules/ai/ai.controller.ts (MODIFIED)
- backend/src/modules/ai/ai.service.ts (MODIFIED)
- frontend/src/types/reports.ts (MODIFIED)
- frontend/src/services/aiService.ts (MODIFIED)
- frontend/src/components/features/predictions/ReportsFilterBar.tsx (NEW)
- frontend/src/pages/admin/AdminReportsPage.tsx (MODIFIED)
- _bmad-output/sprint-artifacts/sprint-status.yaml (MODIFIED)

### Change Log

- 2025-12-29: Implemented Report Filtering feature (Story 6.3) - Date range, region, and aid category filters with URL state persistence
