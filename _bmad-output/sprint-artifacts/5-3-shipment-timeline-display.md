# Story 5.3: Shipment Timeline Display

**Status**: ready-for-dev

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

- [ ] **Backend: Tracking Data Verification**
  - [ ] Verify `ShipmentsService.trackShipmentByBarcode` includes `trackingLogs` (or `trackingEvents` - check entity name).
  - [ ] Ensure `trackingLogs` includes relations: `location`.
  - [ ] Ensure `trackingLogs` includes `blockchainTxHash` field.
  - [ ] Ensure logs are sorted by `createdAt` (ascending or descending as appropriate for UI, likely ascending for flow, descending for feed).

- [ ] **Frontend: Component Implementation**
  - [ ] Create `frontend/src/components/features/tracking/BlockchainVerificationLink.tsx`:
    - [ ] Props: `txHash` (string).
    - [ ] Render: Link to `https://sepolia.etherscan.io/tx/{txHash}`.
    - [ ] Style: Icon + "Verify on Blockchain" text, open in new tab (`target="_blank"`).
  - [ ] Create `frontend/src/components/features/tracking/TrackingTimeline.tsx`:
    - [ ] Props: `events` (Array of tracking logs).
    - [ ] Layout: Vertical timeline using TailwindCSS.
    - [ ] Item Content: Status name, Date/Time, Location name.
    - [ ] Integration: Include `BlockchainVerificationLink` if `blockchainTxHash` exists.
    - [ ] Visuals: Use icons for different statuses (e.g., `lucide-react`).

- [ ] **Frontend: Integration**
  - [ ] Update `frontend/src/pages/public/TrackPage/TrackPage.tsx`:
    - [ ] Import and place `TrackingTimeline` component.
    - [ ] Pass `shipment.trackingLogs` to the timeline.
    - [ ] Ensure layout is responsive (mobile-friendly).

## Dev Notes

### Architecture & Patterns
- **Component Location**: `frontend/src/components/features/tracking/` (matches Architecture Structure).
- **Styling**: TailwindCSS. Use distinct colors for active/completed states if possible (though for history, all are "past" events).
- **Icons**: Use `lucide-react` (standard in T3 stack).
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
