# Story 3.4: Record Shipment Status On-Chain

Status: done

## Story

As the **System**,
I want to **record shipment status changes on the blockchain**,
so that **the delivery journey is transparent**.

## Acceptance Criteria

1. **Given** a shipment status is updated
   **When** the status change is persisted in PostgreSQL
   **Then** `addShipmentLog()` is called on the smart contract with barcode, status, and location
2. **And** the transaction hash is stored in `TrackingLog.transaction_hash`
3. **And** blockchain recording is async and non-blocking—failures don't block status updates (NFR10)

## Tasks / Subtasks

- [x] Import `BlockchainModule` in `ShipmentsModule`
    - [x] Add `BlockchainModule` to imports array in `shipments.module.ts`
- [x] Inject `BlockchainService` into `ShipmentsService`
    - [x] Add constructor parameter for `BlockchainService`
- [x] Replace placeholder `transaction_hash` with real blockchain call
    - [x] In `updateStatus()`, after saving `TrackingLog`, call `blockchainService.addShipmentLog()` asynchronously
    - [x] Update `TrackingLog.transaction_hash` with the returned hash
    - [x] Use fire-and-forget pattern: `.then().catch()` to avoid blocking
- [x] Determine location source for `addShipmentLog`
    - [x] Use `shipment.destinationLocation` or add `location` field to `UpdateShipmentStatusDto`
- [x] Write unit tests
    - [x] Mock `BlockchainService` in `ShipmentsService` tests
    - [x] Verify `addShipmentLog` is called with correct params
    - [x] Verify status update succeeds even if blockchain fails

## Dev Notes

### Existing Implementation (Use These)

- **`TrackingLog.transaction_hash`** already exists (no new column needed)
- **`BlockchainService.addShipmentLog(barcode, status, location)`** already implemented with 3x retry logic
- **Smart contract ABI** includes `addShipmentLog` function

### Integration Pattern (From Story 3.3)

```typescript
// In ShipmentsService.updateStatus() - after saving TrackingLog:
const trackingLog = await this.trackingLogRepository.save(newLog);

// Fire-and-forget blockchain recording
this.blockchainService.addShipmentLog(barcode, status, location)
  .then(txHash => {
    trackingLog.transaction_hash = txHash;
    this.trackingLogRepository.save(trackingLog);
  })
  .catch(err => this.logger.warn(`Blockchain recording failed: ${err.message}`));
```

### Source Files

| File | Action |
|------|--------|
| `backend/src/modules/shipments/shipments.module.ts` | Import `BlockchainModule` |
| `backend/src/modules/shipments/shipments.service.ts` | Inject `BlockchainService`, update `updateStatus()` |
| `backend/src/modules/shipments/dto/update-shipment-status.dto.ts` | Optionally add `location` field |

### References

- [Story 3.3](file:///Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/sprint-artifacts/3-3-record-prediction-hash-on-chain.md) - Pattern for async blockchain calls
- [BlockchainService](file:///Users/omerfarukkizil/development/BlokDepremProject/backend/src/modules/blockchain/blockchain.service.ts) - Already has `addShipmentLog`
- [TrackingLog Entity](file:///Users/omerfarukkizil/development/BlokDepremProject/backend/src/entities/tracking-log.entity.ts) - Already has `transaction_hash`

## Dev Agent Record

### Agent Model Used

Gemini (Antigravity)

### Debug Log References

N/A

### Completion Notes List

- Imported `BlockchainModule` in `ShipmentsModule` to enable blockchain integration
- Injected `BlockchainService` into `ShipmentsService` constructor
- Added `Logger` for proper error/success logging
- Replaced placeholder `transaction_hash` with `pending` initial value, updated async via fire-and-forget
- Implemented blockchain call in both `create()` and `updateStatus()` methods
- Location logic: uses destination_location_id for `Delivered` status, source_location_id for `InTransit`/`Registered`
- Added comprehensive unit tests (9 tests) covering all acceptance criteria
- All 77 backend tests pass with no regressions

**Code Review Fixes Applied (2025-12-25):**
- **H1**: Added `@HttpCode(HttpStatus.ACCEPTED)` (202 status) to controller endpoints per Epic AC requirement
- **M2/M3**: Fixed location logic to use actual location names from `Location` entity instead of hardcoded `location_{id}` format
- **M4**: Enhanced test coverage with 4 new tests (13 total tests now):
  - Verify blockchain calls use actual location names
  - Verify fallback to `location_{id}` when location name unavailable
  - Verify transaction hash updates from 'pending' to actual hash
  - All tests pass (13/13)

### File List

- `backend/src/modules/shipments/shipments.module.ts` (modified)
- `backend/src/modules/shipments/shipments.service.ts` (modified)
- `backend/src/modules/shipments/shipments.service.spec.ts` (modified)

## Change Log

- 2025-12-24: Implemented blockchain integration for shipment status recording (Story 3.4)
- 2025-12-25: Code review fixes applied - Added HTTP 202 status codes, fixed location logic to use actual names, enhanced test coverage (4 new tests)

