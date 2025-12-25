# Story 5.4: Origin & Destination Display

**Status**: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Donor**,
I want to see the origin and destination of my shipment,
So that I know where my donation went.

## Acceptance Criteria

1. **Given** I am viewing shipment details
2. **When** the page loads
3. **Then** the origin location (collection point) is displayed
4. **And** the destination location (distribution center) is displayed
5. **And** a visual route indicator connects origin to destination

## Tasks / Subtasks

- [x] **Backend: Location Data Verification**
  - [x] Verify `ShipmentsService.trackShipmentByBarcode` returns full `sourceLocation` and `destinationLocation` details (name, and if available: lat/long).
  - [x] Ensure the response DTO correctly maps these fields to the frontend structure (`TrackingResponse`).

- [x] **Frontend: Component Implementation**
  - [x] Create `frontend/src/components/features/tracking/RouteDisplay.tsx`:
    - [x] Props: `origin` (Location), `destination` (Location), `status` (ShipmentStatus).
    - [x] Layout: Horizontal or Vertical flex layout (responsive).
    - [x] Content: Origin Name, Destination Name.
    - [x] Visuals: Connection line/arrow between points.
      - [x] Use `lucide-react` or `@heroicons/react` for icons (MapPin, ArrowRight).
      - [x] Style the line to indicate progress (e.g., solid if delivered, dashed if transit).

- [x] **Frontend: Integration**
  - [x] Update `frontend/src/pages/public/TrackPage/TrackPage.tsx`:
    - [x] Import and place `RouteDisplay` component above the Timeline.
    - [x] Pass `shipment.originLocation` and `shipment.destinationLocation` to the component.

## Dev Notes

### Architecture & Patterns
- **Component Location**: `frontend/src/components/features/tracking/` matches Project Structure.
- **Styling**: TailwindCSS.
- **Icons**: Use `@heroicons/react` (Project Standard).
- **Data Availability**: The `Location` entity currently only has `name`, `latitude`, `longitude`. It does **not** have address, city, or region. The UI must handle missing address fields gracefully (display only Name).

### Technical Constraints
- **Visual Indicator**: Since we don't have a map library in the stack, use a CSS/SVG visual representation of the route (Point A -> Line -> Point B).
- **Progress Indication**: The connection line can be colored or styled based on the shipment status (e.g., Gray for Created, Blue for In Transit, Green for Delivered).

### References
- [Architecture Document](file:///Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/architecture.md)
- [Epic 5: Public Donation Tracking](file:///Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/epics.md)
- [Tracking Service](file:///Users/omerfarukkizil/development/BlokDepremProject/frontend/src/services/trackingService.ts)

## Dev Agent Record

### Agent Model Used

Gemini 2.5 (Antigravity)

### Debug Log References

### Completion Notes List
- Implemented `lat` and `long` return in `ShipmentsService`.
- Fixed `TrackingService` interfaces and mapping logic (and repaired corrupted file).
- Created `RouteDisplay` component with visual progress indicator.
- Integrated `RouteDisplay` seamlessly into `TrackPage`.
- Verified with comprehensive tests.

---

## Senior Developer Review (AI)

**Reviewed by:** Antigravity (Gemini 2.5)  
**Review Date:** 2025-12-25  
**Outcome:** ✅ APPROVED (with fixes applied)

### Issues Found & Fixed

| # | Severity | Issue | Resolution |
|---|----------|-------|------------|
| 1 | HIGH | Duplicate `text-xs` CSS class in `RouteDisplay.tsx:73` | ✅ Fixed - Removed duplicate class |
| 2 | HIGH | Type mismatch - `status` prop didn't accept backend statuses (`departed`, `arrived`) | ✅ Fixed - Added `ShipmentStatus` type union |
| 3 | MEDIUM | Missing tests for empty city fallback and status mapping | ✅ Fixed - Added 3 new test cases |
| 4 | MEDIUM | Progress bar showed 5% for `departed` status instead of 50% | ✅ Fixed - Extended `getProgress()` switch |
| 5 | LOW | Story status was `ready-for-dev` despite completion | ✅ Fixed - Updated to `done` |
| 6 | LOW | Agent model placeholder not filled | ✅ Fixed |

### Test Results After Fixes

```
✓ RouteDisplay.test.tsx (8 tests) - All Pass
  ✓ renders origin and destination cities correctly
  ✓ renders coordinates when available  
  ✓ renders without coordinates gracefully
  ✓ applies custom className
  ✓ renders estimated duration when provided and in transit
  ✓ renders fallback text when city is empty (backend behavior) [NEW]
  ✓ handles departed status with correct progress [NEW]
  ✓ handles arrived status with correct progress [NEW]
```

### Known Limitations (Documented, Not Blocking)

- **Location Entity** lacks `city`, `region`, `address` fields. Component gracefully shows "Belirtilmedi" fallback. This is a data model constraint, not a bug.

### File List
- `backend/src/modules/shipments/shipments.service.ts`
- `backend/src/modules/shipments/shipments.service.spec.ts`
- `frontend/src/services/trackingService.ts`
- `frontend/src/components/features/tracking/RouteDisplay.tsx`
- `frontend/src/components/features/tracking/RouteDisplay.test.tsx`
- `frontend/src/components/features/tracking/index.ts`
- `frontend/src/pages/public/TrackPage/TrackPage.tsx`
