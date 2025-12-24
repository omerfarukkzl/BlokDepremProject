# Story 2.5: Prediction Quantity Adjustment

Status: done

## Story

As an **Official**,
I want to adjust the predicted quantities before creating a shipment,
so that I can apply my local knowledge.

## Acceptance Criteria

1. **Given** prediction results are displayed
   **When** I modify the quantity values in the input fields
   **Then** the adjusted values are stored for shipment creation
   **And** both original prediction and adjusted values are tracked
   **And** I can reset to original predictions

## Tasks / Subtasks

- [x] Task 1: Update Prediction Store with Adjustment State (AC: #1)
  - [x] 1.1 Add `adjustedQuantities: Record<string, number> | null` to `PredictionState`
  - [x] 1.2 Add `setAdjustedQuantity: (key: string, value: number) => void` action
  - [x] 1.3 Add `resetToOriginal: () => void` action to clear adjustedQuantities
  - [x] 1.4 Update existing `reset()` to also clear `adjustedQuantities: null`
  - [x] 1.5 Create `useActiveQuantities()` selector hook (returns adjusted ?? original)

- [x] Task 2: Create QuantityAdjuster Component (AC: #1)
  - [x] 2.1 Create `components/features/predictions/QuantityAdjuster.tsx`
  - [x] 2.2 Props: `{ aidType, originalValue, adjustedValue?, onChange, className? }`
  - [x] 2.3 Editable number input with label (capitalize aidType)
  - [x] 2.4 Show original badge + diff indicator (↑/↓) when adjusted !== original
  - [x] 2.5 Validation: non-negative integers, debounce 200ms
  - [x] 2.6 Keyboard: Arrow keys ±1, Shift+Arrow ±10, Escape resets field
  - [x] 2.7 Style with TailwindCSS matching existing prediction UI

- [x] Task 3: Update PredictionResult with Editable Quantities (AC: #1)
  - [x] 3.1 Replace static quantity display with `QuantityAdjuster` components
  - [x] 3.2 Wire `onChange` to `setAdjustedQuantity` from store
  - [x] 3.3 Add "Reset to Original" button (visible when adjustments exist)
  - [x] 3.4 Add disabled "Create Shipment" placeholder button (prep for Story 4.1)

- [x] Task 4: Unit Tests (AC: #1)
  - [x] 4.1 Update `predictionStore.test.ts` - add `adjustedQuantities: null` to `beforeEach`
  - [x] 4.2 Add store tests: `setAdjustedQuantity`, `resetToOriginal`, updated `reset()`
  - [x] 4.3 Create `QuantityAdjuster.test.tsx` (render, onChange, badge, keyboard, debounce)
  - [x] 4.4 Update `PredictionResult.test.tsx` for editable functionality
  - [x] 4.5 Run: `cd frontend && npx vitest` - All 76 tests pass

## Dev Notes

### Architecture Compliance

| Aspect | Requirement |
|--------|-------------|
| Framework | React 19 + Vite + TailwindCSS |
| State | Zustand (extend existing `predictionStore`) |
| Location | `components/features/predictions/` |
| Styling | TailwindCSS (use `yellow` not `amber`) |
| Testing | Vitest + React Testing Library |

### Complete Store Implementation

```typescript
// stores/predictionStore.ts - COMPLETE IMPLEMENTATION
import { create } from 'zustand';
import aiService, { type PredictionResponse } from '../services/aiService';

export interface PredictionState {
  prediction: PredictionResponse | null;
  adjustedQuantities: Record<string, number> | null;
  isLoading: boolean;
  error: string | null;
  fetchPrediction: (regionId: string) => Promise<void>;
  reset: () => void;
  setAdjustedQuantity: (key: string, value: number) => void;
  resetToOriginal: () => void;
}

export const usePredictionStore = create<PredictionState>((set, get) => ({
  prediction: null,
  adjustedQuantities: null,
  isLoading: false,
  error: null,

  fetchPrediction: async (regionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const prediction = await aiService.getPrediction(regionId);
      set({ prediction: prediction ?? null, isLoading: false, adjustedQuantities: null });
    } catch (error: any) {
      set({ prediction: null, isLoading: false, error: error.message || 'Failed' });
    }
  },

  // CRITICAL: Also clears adjustedQuantities
  reset: () => set({ prediction: null, adjustedQuantities: null, isLoading: false, error: null }),

  setAdjustedQuantity: (key, value) => set((state) => ({
    adjustedQuantities: {
      ...(state.adjustedQuantities ?? state.prediction?.predictions ?? {}),
      [key]: value
    }
  })),

  resetToOriginal: () => set({ adjustedQuantities: null }),
}));

// Selector hook - use this in components
export const useActiveQuantities = () => {
  const { prediction, adjustedQuantities } = usePredictionStore();
  return adjustedQuantities ?? prediction?.predictions ?? null;
};
```

### QuantityAdjuster Component

```typescript
// QuantityAdjuster.tsx
interface QuantityAdjusterProps {
  aidType: string;           // 'tent', 'container', 'food', 'blanket'
  originalValue: number;
  adjustedValue?: number;    // undefined = using original
  onChange: (value: number) => void;
  className?: string;
}

// Key behaviors:
// - Label: capitalize(aidType) e.g., "Tent"
// - Input: type="number" min="0" step="1"
// - Debounce onChange by 200ms to prevent rapid re-renders
// - Show badge when adjusted: "Original: {n}" with ↑/↓ indicator
// - Keyboard: ArrowUp/Down ±1, Shift+Arrow ±10, Escape resets to original
// - Background: bg-yellow-50 when modified, bg-gray-50 when original
```

### Test Setup Fix

```typescript
// predictionStore.test.ts - FIX beforeEach
beforeEach(() => {
  vi.clearAllMocks();
  usePredictionStore.setState({
    prediction: null,
    adjustedQuantities: null,  // CRITICAL: Must include this
    isLoading: false,
    error: null
  });
});
```

### Create Shipment Button (Story 4.1 Prep)

```tsx
// In PredictionResult.tsx - disabled placeholder for Story 4.1
const activeQuantities = useActiveQuantities();

{activeQuantities && (
  <button
    disabled
    className="mt-6 w-full py-2 px-4 rounded-md text-white bg-gray-400 cursor-not-allowed"
    title="Coming in Story 4.1"
  >
    Create Shipment (Coming Soon)
  </button>
)}
```

### Project Structure

**Modify:**
- `frontend/src/stores/predictionStore.ts`
- `frontend/src/stores/predictionStore.test.ts`
- `frontend/src/components/features/predictions/PredictionResult.tsx`
- `frontend/src/components/features/predictions/PredictionResult.test.tsx`

**Create:**
- `frontend/src/components/features/predictions/QuantityAdjuster.tsx`
- `frontend/src/components/features/predictions/QuantityAdjuster.test.tsx`

### Previous Story Patterns

- Default export for components
- CVA pattern for variants (see ConfidenceIndicator)
- `cn()` utility for class merging
- Tests use `@testing-library/react` + Vitest

### References

- [predictionStore.ts](file:///Users/omerfarukkizil/development/BlokDepremProject/frontend/src/stores/predictionStore.ts)
- [PredictionResult.tsx](file:///Users/omerfarukkizil/development/BlokDepremProject/frontend/src/components/features/predictions/PredictionResult.tsx)
- [ConfidenceIndicator.tsx](file:///Users/omerfarukkizil/development/BlokDepremProject/frontend/src/components/features/predictions/ConfidenceIndicator.tsx)
- [Story 2.4](file:///Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/sprint-artifacts/2-4-prediction-confidence-score-display.md)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (Antigravity)

### Debug Log References

- All 76 tests pass (8 test files)
- No regressions introduced

### Completion Notes List

- Extended `predictionStore.ts` with `adjustedQuantities` state, `setAdjustedQuantity`, `resetToOriginal` actions
- Updated `reset()` to clear adjustedQuantities when fetching new predictions
- Created `useActiveQuantities()` selector hook for components
- Created `QuantityAdjuster.tsx` component with debounce (200ms), keyboard accessibility, diff indicators
- Updated `PredictionResult.tsx` to use editable QuantityAdjuster components
- Added "Reset to Original Predictions" button (visible when adjustments exist)
- Added disabled "Create Shipment" placeholder button for Story 4.1 integration
- Created comprehensive test suite for QuantityAdjuster (18 tests)
- Updated predictionStore tests (14 tests for new actions and useActiveQuantities)
- Updated PredictionResult tests (8 tests for new functionality)
- [Code Review] Added aria-describedby for screen reader accessibility
- [Code Review] Removed unused inputRef, added useId hook for unique IDs

### File List

- `frontend/src/stores/predictionStore.ts` (Modified)
- `frontend/src/stores/predictionStore.test.ts` (Modified)
- `frontend/src/components/features/predictions/QuantityAdjuster.tsx` (New)
- `frontend/src/components/features/predictions/QuantityAdjuster.test.tsx` (New)
- `frontend/src/components/features/predictions/PredictionResult.tsx` (Modified)
- `frontend/src/components/features/predictions/PredictionResult.test.tsx` (Modified)
