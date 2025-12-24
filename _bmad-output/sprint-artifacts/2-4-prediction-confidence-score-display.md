# Story 2.4: Prediction Confidence Score Display

Status: done

## Story

As an **Official**,
I want to see the confidence score for each prediction,
so that I know how reliable the AI recommendation is.

## Acceptance Criteria

1. **Given** a prediction has been generated
   **When** I view the prediction results
   **Then** a confidence percentage is displayed (e.g., 82%)
   **And** the confidence is visually indicated (color coding for high/medium/low)

## Tasks / Subtasks

- [x] Task 1: Create ConfidenceIndicator Component (AC: #1)
  - [x] 1.1 Create `components/features/predictions/ConfidenceIndicator.tsx`
  - [x] 1.2 Define props interface: `{ confidence: number; size?: 'sm' | 'md' | 'lg' }`
  - [x] 1.3 Use `class-variance-authority` (CVA) pattern matching Badge component
  - [x] 1.4 Use `cn` utility from `utils/cn.ts` for class merging
  - [x] 1.5 Implement three-tier color coding (see Technical Requirements)
  - [x] 1.6 Add visual progress bar showing confidence level
  - [x] 1.7 Display percentage text (e.g., "82%")
  - [x] 1.8 Add accessibility: `aria-label`, `role="progressbar"`, `aria-valuenow`

- [x] Task 2: Integrate into PredictionResult (AC: #1)
  - [x] 2.1 Import and use `ConfidenceIndicator` in `PredictionResult.tsx`
  - [x] 2.2 Remove existing inline confidence display (lines 31-36)
  - [x] 2.3 Position prominently with responsive layout

- [x] Task 3: Unit Tests (AC: #1)
  - [x] 3.1 Create `ConfidenceIndicator.test.tsx`
  - [x] 3.2 Test boundary values: 0.49, 0.50, 0.79, 0.80
  - [x] 3.3 Test accessibility attributes
  - [x] 3.4 Run: `npx vitest`

## Dev Notes

### Architecture Compliance

| Aspect | Requirement |
|--------|-------------|
| Framework | React 19 + Vite + TailwindCSS |
| Location | `components/features/predictions/` |
| Pattern | Use CVA like `Badge` component |
| Styling | Use `cn` utility from `utils/cn.ts` |
| Testing | Vitest + React Testing Library |

### Technical Requirements

#### Props Interface
```typescript
interface ConfidenceIndicatorProps {
  confidence: number; // 0.0 to 1.0
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

#### Confidence Tiers (Use `yellow`, NOT `amber`)
| Level | Range | Classes |
|-------|-------|---------|
| High | ≥ 0.80 | `bg-green-100 text-green-800`, bar: `bg-green-500` |
| Medium | 0.50 - 0.79 | `bg-yellow-100 text-yellow-800`, bar: `bg-yellow-500` |
| Low | < 0.50 | `bg-red-100 text-red-800`, bar: `bg-red-500` |

> ⚠️ **CRITICAL**: Use `yellow` not `amber` - amber is not in tailwind.config.js

#### Pattern Reference: Badge Component
```typescript
// Reference: components/ui/Badge/Badge.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const confidenceVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
  {
    variants: {
      level: {
        high: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-red-100 text-red-800',
      },
      size: {
        sm: 'text-xs px-2',
        md: 'text-sm px-3',
        lg: 'text-base px-4',
      },
    },
    defaultVariants: { level: 'medium', size: 'md' },
  }
);
```

### API Response (from Store)
```typescript
// prediction.confidence is 0.0 to 1.0
const { prediction } = usePredictionStore();
// Use: prediction.confidence
```

### Project Structure
- `frontend/src/components/features/predictions/ConfidenceIndicator.tsx` (New)
- `frontend/src/components/features/predictions/ConfidenceIndicator.test.tsx` (New)
- `frontend/src/components/features/predictions/PredictionResult.tsx` (Modify)

### Previous Story Intelligence
- Vitest configured in `vitest.config.ts`
- Test setup in `setupTests.ts`
- `PredictionResult.test.tsx` exists - update if needed
- All components use default export pattern

### References

- [Badge.tsx](file:///Users/omerfarukkizil/development/BlokDepremProject/frontend/src/components/ui/Badge/Badge.tsx) - CVA pattern reference
- [cn.ts](file:///Users/omerfarukkizil/development/BlokDepremProject/frontend/src/utils/cn.ts) - Class utility
- [PredictionResult.tsx](file:///Users/omerfarukkizil/development/BlokDepremProject/frontend/src/components/features/predictions/PredictionResult.tsx) - Integration target
- [epics.md#Story-2.4](file:///Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/epics.md)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (Antigravity)

### Debug Log References

- All 21 ConfidenceIndicator tests pass
- All 28 prediction component tests pass (no regressions)

### Completion Notes List

- Created `ConfidenceIndicator.tsx` component using CVA pattern matching existing Badge component
- Implemented three-tier confidence classification: High (≥80%), Medium (50-79%), Low (<50%)
- Added visual progress bar with color-coded fill (green/yellow/red)
- Full accessibility support: role="progressbar", aria-valuenow, aria-valuemin, aria-valuemax, aria-label
- Integrated into `PredictionResult.tsx` replacing inline confidence display
- Created comprehensive test suite with 21 tests covering boundary values, color classes, and accessibility
- **Code Review Fix**: Added input validation (normalizeConfidence) to clamp values to 0-1 range
- **Code Review Fix**: Exported `getConfidenceLevel` function for reuse
- **Code Review Fix**: Wrapped component in `React.memo` with displayName
- **Code Review Fix**: Added 10 edge case tests (0, 1, >1, <0, NaN, className, getConfidenceLevel)
- **Code Review Fix**: Updated PredictionResult.test.tsx to verify ConfidenceIndicator renders

### File List

- `frontend/src/components/features/predictions/ConfidenceIndicator.tsx` (New + Code Review Fixes)
- `frontend/src/components/features/predictions/ConfidenceIndicator.test.tsx` (New + Edge Cases)
- `frontend/src/components/features/predictions/PredictionResult.tsx` (Modified)
- `frontend/src/components/features/predictions/PredictionResult.test.tsx` (Modified - added ConfidenceIndicator verification)
