# Story 5.2: Barcode Search Functionality

**Status**: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Donor**,
I want to search for a shipment using its barcode,
So that I can find my donation's tracking information.

## Acceptance Criteria

1. **Given** I am on the tracking page
2. **When** I enter a valid barcode and submit
3. **Then** the shipment details are displayed
4. **And** an error message is shown if the barcode is not found
5. **And** the search input is validated for proper barcode format

## Tasks / Subtasks

- [x] **Frontend: Validation & Search Logic Verification**
  - [x] Verify `TrackPage.tsx` implements input validation:
    - [x] Input must accept `BD-YYYY-XXXXX` format (case-insensitive).
    - [x] `trackingService.validateBarcode` must enforce this format.
  - [x] Verify error handling:
    - [x] "Not Found" error from backend (404) should display user-friendly message "Bu barkoda ait kargo bulunamadı" or similar.
    - [x] Network errors handled gracefully.
  - [x] Verify submission behavior:
    - [x] Enter key triggers search.
    - [x] Click "Takip Et" triggers search.
    - [x] Loading state disables input/button.

- [x] **Backend: Endpoint Verification (Reference Story 5.1)**
  - [x] Ensure `GET /shipments/public/track/:barcode` accepts the barcode format.
  - [x] Ensure it returns 404 for non-existent barcodes.

## Dev Notes

### Architecture & Patterns
- **Frontend**: Uses `trackingService` to communicate with backend. The validation logic should probably reside in `trackingService` or a shared utility if reused, but `trackingService` is fine.
- **Validation**: Barcode format is `BD-\d{4}-\d{5}`. Enforced strictly via regex in `validateBarcode()`.
- **State Management**: Local component state (`useState`) is used in `TrackPage.tsx`. This is acceptable for this simple interaction.

### Existing Implementation Analysis
- `TrackPage.tsx` has implemented the search logic in Story 5.1.
- **This Story Focus**: Verified and enhanced the barcode format validation which was too loose in the initial implementation.
- **Testing**: Added comprehensive unit tests for `trackingService.validateBarcode`.

### References
- [Project Context: Architecture](file:///Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/architecture.md)
- [Story 5.1: Public Tracking Page](file:///Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/sprint-artifacts/5-1-public-tracking-page.md)

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash (Antigravity)

### Debug Log References
- `frontend/src/pages/public/TrackPage/TrackPage.tsx`: Verified search implementation.
- `frontend/src/services/trackingService.ts`: Updated `validateBarcode()` with strict format validation.
- `backend/src/modules/shipments/shipments.service.ts`: Verified `trackShipmentByBarcode()` returns 404 for not found.

### Completion Notes List

1. **Implemented strict barcode format validation** (`BD-YYYY-XXXXX`):
   - Updated `trackingService.validateBarcode()` to enforce exact format via regex `/^BD-\d{4}-\d{5}$/`
   - Added year range validation (2020-2099)
   - Made validation case-insensitive
   - Localized error messages in Turkish

2. **Updated placeholder text** in `TrackPage.tsx`:
   - Changed from incorrect `BK-2024-001` to correct format `BD-2025-00001`

3. **Added unit tests** for `validateBarcode()`:
   - Created `trackingService.test.ts` with 13 comprehensive tests
   - Tests cover: valid format, case insensitivity, empty input, missing prefix, wrong year/sequence format, year range validation, whitespace handling

4. **Verified backend endpoint compliance**:
   - `GET /shipments/public/track/:barcode` correctly throws `NotFoundException` for non-existent barcodes
   - Case-insensitive barcode search confirmed with 48 passing backend tests

5. **Verified frontend error handling**:
   - 404 errors display "Bu barkoda ait kargo bulunamadı" message
   - Network errors handled gracefully with fallback message

6. **Verified submission behavior**:
   - Enter key triggers search via `onKeyPress` handler
   - "Takip Et" button triggers search via `onClick`
   - Loading state disables input and button (`disabled={loading}`)

### File List

- `frontend/src/services/trackingService.ts` - Modified: Enhanced `validateBarcode()` with strict BD-YYYY-XXXXX format validation
- `frontend/src/services/trackingService.test.ts` - New: Unit tests for barcode validation (13 tests)
- `frontend/src/pages/public/TrackPage/TrackPage.tsx` - Modified: Updated placeholder text to correct format

## Change Log

| 2025-12-25 | Initial story implementation. Enhanced barcode validation, added unit tests, verified backend endpoint. |
| 2025-12-25 | Code Review: Fixed UX issue (auto-search on URL param) and verified tests. Status -> done. |

## Senior Developer Review (AI)

- **Date**: 2025-12-25
- **Reviewer**: Antigravity (AI)
- **Status**: **APPROVED**

### Findings
1.  **Scope**: Workspace contained uncommitted changes from other stories (scope pollution), but Story 5.2 components were isolated enough for verification.
2.  **UX Improvement**: `TrackPage.tsx` was updated to automatically trigger search when a `barcode` URL parameter is present, improving the sharing experience.
3.  **Testing**: `trackingService.test.ts` provides good coverage (13 tests passed) for the validation logic.
4.  **Verification**: Manual verification of code and tests confirms all ACs are met.

### Outcome
- **Status**: Updated to `done`
- **Fixes Applied**: Auto-search logic added to `TrackPage.tsx`.

