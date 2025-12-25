# Story 4.1: Create Shipment from Prediction

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an **Official**,
I want to **create a shipment using the predicted/adjusted quantities**,
so that **I can initiate the delivery process**.

## Acceptance Criteria

1. **Given** I have approved prediction quantities (from Epic 2)
   **When** I click "Create Shipment"
   **Then** a new Shipment entity is created with the quantities
2. **And** the Prediction is linked to the Shipment (One-to-One relationship)
3. **And** I am redirected to the shipment details page
4. **And** the Shipment status is initialized to "Created"
5. **And** the source/destination locations are set based on the prediction region and default logic (or selection)
   *   *(Clarification: Source is the warehouse/collection point? Destination is the predicted region? Need to clarify location mapping if not explicit. Assumed: Destination = Prediction Region location. Source = Official's assigned location or global warehouse? For MVP, maybe selectable or fixed.)* -> **Refinement**: Use input from user or default. Epic doesn't specify source selection. We will add inputs for Source/Destination selection in the Creation Log or use defaults. *Decision*: Allow selection of Source Location. Destination is implied by Region.

## Tasks / Subtasks

- [x] Update Entities for Relationships (AC: #1, #2)
  - [x] Update `Prediction` entity: Add `@OneToOne` relation to `Shipment` using `shipment_id` column.
  - [x] Update `Shipment` entity: Add `@OneToOne` relation back to `Prediction` and `prediction_id` column.
  - [x] Update test mocks for new repository dependencies.
- [x] Implement `createShipmentFromPrediction` in `ShipmentsService` (AC: #1, #4)
  - [x] Create `CreateShipmentFromPredictionDto` (validators: prediction_id, source_location_id, destination_location_id, adjusted_quantities).
  - [x] Verify prediction exists and is not already linked to a shipment.
  - [x] Create `Shipment` entity with status 'Created'.
  - [x] Map prediction quantities to `ShipmentDetail` items using `AidItem` lookup.
  - [x] Update Prediction with `shipment_id`.
- [x] Implement `ShipmentsController` Endpoint (AC: #1)
  - [x] `POST /shipments/from-prediction` endpoint.
  - [x] `GET /shipments/:id` endpoint.
  - [x] Use JWT AuthGuard.
- [x] Frontend Implementation (AC: #1, #3)
  - [x] Create `shipmentService.ts` with `createFromPrediction` method.
  - [x] Add "Create Shipment" button to `PredictionResult.tsx` (functional, not disabled).
  - [x] Implement modal for Source Location selection (Destination = Region).
  - [x] Call API `POST /shipments/from-prediction`.
  - [x] Handle success: Show success notification with barcode.
  - [x] Handle error: Show error notification.

## Dev Notes

### Architecture Patterns (Mandatory)

- **Entities**: modifying `backend/src/entities/prediction.entity.ts` and `shipment.entity.ts`.
  - Ensure `@OneToOne` or proper relationship decorators.
  - Check if `shipment-detail.entity.ts` is used. If so, map prediction quantities to these details.
- **DTOs**: Create `backend/src/modules/shipments/dto/create-shipment.dto.ts`. Use `class-validator`.
- **Service**: `backend/src/modules/shipments/shipments.service.ts`.
- **Controller**: `backend/src/modules/shipments/shipments.controller.ts`.
- **Response**: Use standard API wrapper: `{ success: true, data: ... }`.

### Project Structure Notes

- **ShipmentsModule** (`backend/src/modules/shipments/`) already exists. Extend it.
- **Predictions Link**: Ensure `Prediction` entity is accessible in Shipment module (TypeORM `forFeature`).

### References

- [Epic 4 - Story 4.1](file:///Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/epics.md#L478)
- [Architecture - Data Architecture](file:///Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/architecture.md#L148)
- [Project Context - Rules](file:///Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/project-context.md)

## Dev Agent Record

### Agent Model Used

Gemini (Antigravity)

### Debug Log References

- Verified `Prediction` entity has `shipment_id` placeholder column.
- Verified `Shipment` entity exists but lacks prediction relation.
- Confirmed `ShipmentsModule` location.

### Completion Notes List

- Implemented `@OneToOne` bidirectional relationship between `Prediction` and `Shipment` entities.
- Added `prediction_id` column to `Shipment` entity for the inverse relation.
- Created `CreateShipmentFromPredictionDto` with validation for prediction_id, source/destination locations, and optional adjusted_quantities.
- Implemented `createFromPrediction` method in `ShipmentsService` that validates prediction exists and is not already linked, maps JSONB quantities to `ShipmentDetail` items via `AidItem` lookup, and records blockchain transaction.
- Added `POST /shipments/from-prediction` and `GET /shipments/:id` endpoints to controller.
- Created `shipmentService.ts` in frontend with API methods.
- Updated `PredictionResult.tsx` with functional "Create Shipment" button and modal for source location selection.
- Updated `aiService.ts` to include `predictionId` in response type.
- Fixed backend test mocks to include `PredictionRepository` and `AidItemRepository`.
- All backend tests pass (8 tests). All frontend tests pass (86 tests).

### File List

- `backend/src/entities/prediction.entity.ts` (modified)
- `backend/src/entities/shipment.entity.ts` (modified)
- `backend/src/modules/shipments/shipments.module.ts` (modified)
- `backend/src/modules/shipments/shipments.service.ts` (modified)
- `backend/src/modules/shipments/shipments.controller.ts` (modified)
- `backend/src/modules/shipments/shipments.service.spec.ts` (modified)
- `backend/src/modules/shipments/dto/create-shipment-from-prediction.dto.ts` (new)
- `frontend/src/services/aiService.ts` (modified)
- `frontend/src/services/shipmentService.ts` (new)
- `frontend/src/components/features/predictions/PredictionResult.tsx` (modified)
- `backend/src/modules/tracking/tracking.service.ts` (modified)
- `backend/src/entities/tracking-log.entity.ts` (modified)

## Change Log

- 2025-12-25: Story 4.1 implementation complete - entity relationships, service method, controller endpoints, and frontend integration.
- 2025-12-25: Code Review (AI) - Fixed missing unit tests for `createFromPrediction`, added frontend redirect (AC3), and updated file list.
