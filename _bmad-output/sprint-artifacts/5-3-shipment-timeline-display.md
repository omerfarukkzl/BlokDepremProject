# Story 5.3: Shipment Timeline Display

**Status**: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Donor**,
I want to view the complete timeline of my shipment,
So that I can see every status update in the journey.

## Acceptance Criteria

1. **Given** a shipment is found
2. **When** I view the tracking results
3. **Then** a timeline shows all status updates with timestamps
4. **And** each status shows location (Received → Departed → Arrived → Delivered)
5. **And** blockchain verification links are displayed where available (from Epic 3)

## Tasks / Subtasks

- [x] **Backend: Tracking Data Verification**
  - [x] Verify `ShipmentsService.trackShipmentByBarcode` includes `trackingLogs` (or `trackingEvents` - check entity name).
  - [x] Ensure `trackingLogs` includes relations: `location`.
  - [x] Ensure `trackingLogs` includes `blockchainTxHash` field.
  - [x] Ensure logs are sorted by `createdAt` (ascending or descending as appropriate for UI, likely ascending for flow, descending for feed).

- [x] **Frontend: Component Implementation**
  - [x] Verify/Reuse `frontend/src/components/features/tracking/BlockchainVerificationLink.tsx` (Already exists).
  - [x] Create `frontend/src/components/features/tracking/TrackingTimeline.tsx`:
    - [x] Props: `events` (Array of tracking logs).
    - [x] Layout: Vertical timeline using TailwindCSS.
    - [x] Item Content: Status name, Date/Time, Location name.
    - [x] Integration: Include `BlockchainVerificationLink` if `blockchainTxHash` exists.
    - [x] Visuals: Use status icons (using `@heroicons/react` to match project standard).

- [x] **Frontend: Integration**
  - [x] Update `frontend/src/pages/public/TrackPage/TrackPage.tsx`:
    - [x] Import and place `TrackingTimeline` component.
    - [x] Pass `shipment.trackingLogs` to the timeline.
    - [x] Ensure layout is responsive (mobile-friendly).

- [x] **Review Follow-ups (AI)**
  - [x] [AI-Review][Medium] Allow `Cancelled` status transition in `ShipmentsService`.
  - [x] [AI-Review][Medium] Correct Icon Library requirement to `@heroicons/react`.

## Dev Notes

### Architecture & Patterns
- **Component Location**: `frontend/src/components/features/tracking/` (matches Architecture Structure).
- **Styling**: TailwindCSS. Use distinct colors for active/completed states if possible (though for history, all are "past" events).
- **Icons**: Use `@heroicons/react` (Project Standard).
- **Date Formatting**: Use `Intl.DateTimeFormat` or `date-fns` (if available) for locale-aware formatting (Turkish/English).
- **Etherscan URL**: Hardcode Sepolia base URL or use env var `VITE_BLOCKCHAIN_EXPLORER_URL` if defined (check `.env`).

### Existing Implementation Context
- **Tracking Page**: `TrackPage.tsx` already exists and fetches shipment data.
- **Data Model**: `Shipment` entity has `trackingLogs`. `TrackingLog` entity has `status`, `location`, `blockchainTxHash`.
- **API**: `GET /shipments/public/track/:barcode`.
- **Previous Story**: 5.2 implemented the search and validation. 5.1 implemented the basic page and fetch.

### Technical Requirements
- **Timeline Logic**:
  - Handle `null` location (if any status update doesn't have a location).
  - Handle valid/invalid timestamps.
  - Gracefully handle missing `blockchainTxHash` (don't show link).

### References
- [Architecture Document](file:///Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/architecture.md)
- [Epic 5: Public Donation Tracking](file:///Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/epics.md)

---

## Senior Developer Review (AI)

### Findings & Resolution
- **Icon Library**: Story requested `lucide-react`, but project uses `@heroicons/react`. Adjusted requirements to use Heroicons for consistency.
- **Cancelled Status**: Implementation was strict about transitions. Updated `ShipmentsService` to allow cancellation from non-final states.
- **Task Accuracy**: Corrected task about `BlockchainVerificationLink` to reflect reuse.

All medium and low issues have been resolved.

---

## Dev Agent Record

### Implementation Notes

**Date**: 2025-12-25

**Backend Changes**:
- Updated `ShipmentsService.trackShipmentByBarcode` to populate the `location` field in tracking history by inferring from status:
  - `Registered`, `Created`, `Departed` → Source Location name
  - `Arrived`, `Delivered` → Destination Location name
- Tracking logs are sorted by `timestamp: 'DESC'` (most recent first) in the service query.
- Fixed a pre-existing test issue where `unit` field was expected but doesn't exist in `AidItem` entity.
- Updated `updateStatus` logic to support `Cancelled` status transitions.

**Frontend Changes**:
- Created `TrackingTimeline.tsx` component with:
  - Vertical timeline layout using TailwindCSS
  - Status-specific colors and icons (using @heroicons/react)
  - Displays status name, location (if available), notes, and timestamp
  - Integrates `BlockchainVerificationLink` for on-chain transactions
  - Sorts events chronologically (oldest first) for timeline display
  - Accessibility: proper ARIA roles and labels
- Updated `TrackPage.tsx` to use the new `TrackingTimeline` component (refactored from inline implementation)
- Added comprehensive test suite for `TrackingTimeline` (12 tests)

**Existing Components Leveraged**:
- `BlockchainVerificationLink.tsx` was already implemented from previous stories
- `TrackPage.tsx` had inline timeline code that was refactored into the reusable component

### Debug Log

No significant issues encountered. Pre-existing test configuration issues (Vitest globals not recognized by TS) don't affect test execution.

---

## File List

### New Files
- `frontend/src/components/features/tracking/TrackingTimeline.tsx`
- `frontend/src/components/features/tracking/TrackingTimeline.test.tsx`

### Modified Files
- `frontend/src/components/features/tracking/index.ts` - Added TrackingTimeline exports
- `frontend/src/pages/public/TrackPage/TrackPage.tsx` - Refactored to use TrackingTimeline component
- `backend/src/modules/shipments/shipments.service.ts` - Added location inference and Cancelled status support
- `backend/src/modules/shipments/shipments.service.spec.ts` - Fixed test expectation

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-25 | Initial implementation of Story 5.3: Created TrackingTimeline component, refactored TrackPage, added location inference in backend | Dev Agent |
| 2025-12-25 | Code Review updates: Added Cancelled status support, confirmed Heroicons usage | Senior Dev Agent |
