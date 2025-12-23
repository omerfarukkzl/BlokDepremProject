# Story 2.3: Region Selection & Prediction UI

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an **Official**,
I want to select a region and request predictions,
so that I can see recommended aid quantities for that area.

## Acceptance Criteria

1. **Given** I am on the predictions page
   **When** I select a region and click "Generate Prediction"
   **Then** predicted quantities for 4 aid types are displayed
   **And** a loading state is shown during the request
   **And** error messages are displayed if the request fails

## Tasks / Subtasks

- [x] Task 1: Update Frontend Services (AC: #1)
  - [x] 1.1 Update `services/aiService.ts` to call backend `POST /ai/predict`
  - [x] 1.2 Implement `fetchRegions` in `services/locationService.ts` (if not exists) or mock/hardcode for prototype
  - [x] 1.3 Create `stores/predictionStore.ts` with Zustand for state management (loading, error, results)

- [x] Task 2: Create Prediction Form Component (AC: #1)
  - [x] 2.1 Create `components/features/predictions/PredictionForm.tsx`
  - [x] 2.2 Add region selection dropdown (populated from locations)
  - [x] 2.3 Add "Generate Prediction" button
  - [x] 2.4 Handle form submission and trigger `predictionStore.fetchPrediction`

- [x] Task 3: Create Prediction Result Component (AC: #1)
  - [x] 3.1 Create `components/features/predictions/PredictionResult.tsx`
  - [x] 3.2 Display the 4 aid types (Tent, Container, Food, Blanket) with quantities
  - [x] 3.3 Display confidence score (from Story 2.4 prep - basic display now)
  - [x] 3.4 Handle loading state (spinner/skeleton)
  - [x] 3.5 Handle error state (display user-friendly message)

- [x] Task 4: Integrate into Predictions Page (AC: #1)
  - [x] 4.1 Update/Create `pages/PredictionsPage.tsx` (or similar Official dashboard page)
  - [x] 4.2 Assemble `PredictionForm` and `PredictionResult`
  - [x] 4.3 Ensure responsive layout

## Dev Notes

### Architecture Compliance

- **Frontend Framework**: React 19 + Vite + TailwindCSS
- **State Management**: Zustand
  - Create `usePredictionStore` in `stores/predictionStore.ts`
  - Pattern: `isLoading`, `error`, `data`, `actions: { fetchPrediction }`
- **Service Layer**:
  - `services/aiService.ts` for API calls to NestJS
  - Use `axios` or `fetch` wrapper (ensure auth token is attached - `authService` usually handles interceptors)
  - **Explicit Types**: Define `PredictionResponse` interface to match backend:
    ```typescript
    interface PredictionResponse {
      predictions: Record<string, number>; // tent, container, food, blanket
      confidence: number;
      prediction_hash: string;
      region_id: string;
    }
    ```
- **UI Components**:
  - Place in `components/features/predictions/`
  - Use functional components with hooks
  - Styling: TailwindCSS utility classes
  - Component Naming: PascalCase (e.g., `PredictionForm`)

### Technical Requirements

- **API Endpoint**: `POST /ai/predict` (Implemented in Story 2.2)
  - Payload: `{ regionId: string }` (or detailed object if backend requires it, verify Story 2.2 implementation)
- **Error Handling**:
  - Handle 503 (AI unavailable) gracefully.
  - Handle 401 (Unauthorized) - should redirect to login.
- **Mocking/Data**:
  - If `locations` API isn't ready, verify if `Region` entity exists and if we can fetch list. If not, use a hardcoded list of regions for the prototype (e.g., Hatay, Kahramanmaras, etc.).

### Project Structure Notes

- `frontend/src/components/features/predictions/` - New directory for prediction features.
- `frontend/src/stores/predictionStore.ts` - New store.
- `frontend/src/services/aiService.ts` - New service.

### References

- [Source: _bmad-output/epics.md#Story-2.3](file:///Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/epics.md)
- [Source: _bmad-output/architecture.md#Frontend-Structure](file:///Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/architecture.md)
- [Source: _bmad-output/sprint-artifacts/2-2-nestjs-ai-module-integration.md](file:///Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/sprint-artifacts/2-2-nestjs-ai-module-integration.md)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Task 1 Completed: Implemented `aiService`, `locationService`, and `predictionStore` with full test coverage (Red-Green-Refactor).
- Task 2 Completed: Implemented `PredictionForm` component with tests.
- Task 3 Completed: Implemented `PredictionResult` component with tests.
- Task 4 Completed: Assembled `PredictionsPage` and integrated into `App.tsx` routing.

### File List

- `frontend/src/services/aiService.ts` (New)
- `frontend/src/services/aiService.test.ts` (New)
- `frontend/src/services/locationService.ts` (New)
- `frontend/src/services/locationService.test.ts` (New)
- `frontend/src/stores/predictionStore.ts` (New)
- `frontend/src/stores/predictionStore.test.ts` (New)
- `frontend/src/components/features/predictions/PredictionForm.tsx` (New)
- `frontend/src/components/features/predictions/PredictionForm.test.tsx` (New)
- `frontend/src/components/features/predictions/PredictionResult.tsx` (New)
- `frontend/src/components/features/predictions/PredictionResult.test.tsx` (New)
- `frontend/src/pages/official/PredictionsPage/PredictionsPage.tsx` (New)
- `frontend/src/pages/official/PredictionsPage/PredictionsPage.test.tsx` (New)
- `frontend/src/constants/index.ts` (Modified)
- `frontend/src/App.tsx` (Modified)
- `frontend/vitest.config.ts` (New)
- `frontend/src/setupTests.ts` (New)
- `frontend/package.json` (Modified)
