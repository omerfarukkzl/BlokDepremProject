# Story 2.2: NestJS AI Module Integration

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an **Official**,
I want the backend to integrate with the AI service,
So that predictions can be requested through the main API.

## Acceptance Criteria

1. **Given** I am authenticated
   **When** I call POST `/ai/predict` with regionId
   **Then** the backend calls the FastAPI service and returns predictions
   **And** graceful fallback is returned if AI service is unavailable (503 with message)
   **And** requests timeout after 10 seconds (NFR1)

## Tasks / Subtasks

- [x] Task 1: Create AI Module Structure (AC: #1)
  - [x] 1.1 Create `modules/ai/ai.module.ts`
  - [x] 1.2 Create `modules/ai/ai.service.ts` with HttpModule
  - [x] 1.3 Create `modules/ai/ai.controller.ts`
  - [x] 1.4 Create `modules/ai/dto/prediction.dto.ts`

- [x] Task 2: Implement AI Service Logic (AC: #1)
  - [x] 2.1 Configure HttpModule with 10s timeout (NFR1)
  - [x] 2.2 Implement `getPrediction` method calling FastAPI `:5000/predict`
  - [x] 2.3 Implement error handling with 503 fallback (NFR3)
  - [x] 2.4 Map region data to FastAPI request schema using `Region` entity

- [x] Task 3: Implement AI Controller (AC: #1)
  - [x] 3.1 Implement `POST /ai/predict` endpoint
  - [x] 3.2 Apply `WalletAuthGuard` for authentication
  - [x] 3.3 Apply standard API response wrapper
  - [x] 3.4 Validate input using DTO

- [x] Task 4: Testing (AC: #1)
  - [x] 4.1 Unit tests for `AiService` (mocking HttpService)
  - [x] 4.2 E2E tests for `/ai/predict` (mocking FastAPI response)

## Dev Notes

### Architecture Compliance

- **Module**: `modules/ai/` (Dedicated module as per Architecture)
- **Controller**: `modules/ai/ai.controller.ts`
- **Service**: `modules/ai/ai.service.ts`
- **Guards**: `WalletAuthGuard` (Protect endpoint)
- **Response Format**: Use standard wrapper `{ success: true, data: ... }`
- **Error Handling**:
  - 503 Service Unavailable if FastAPI call fails/times out
  - Log failures as `warn` or `error`
  - Do NOT crash the backend if AI is down

### Technical Requirements

- **External Service**: FastAPI is at `http://ai-service:5000` (Docker) or `http://localhost:5000` (Local)
- **Timeouts**: 10 seconds (NFR1)
- **Dependencies**: `HttpModule` (NestJS Axios wrapper)

### FastAPI Integration (Story 2.1 Contract)

- Endpoint: `POST /predict`
- Request Schema (What NestJS sends):
  ```json
  {
    "region_id": "string",
    "collapsed_buildings": 0,
    "urgent_demolition": 0,
    "severely_damaged": 0,
    "moderately_damaged": 0,
    "population": 0,
    "population_change": 0,
    "max_magnitude": 0,
    "earthquake_count": 0,
    "damage_ratio": 0
  }
  ```
- Response Schema (What NestJS receives):
  ```json
  {
    "success": true,
    "data": {
      "predictions": { "tent": 100, ... },
      "confidence": 0.85,
      "prediction_hash": "sha256...",
      "region_id": "..."
    }
  }
  ```

### References

- [Source: _bmad-output/architecture.md#AI-Service](_bmad-output/architecture.md)
- [Source: _bmad-output/sprint-artifacts/2-1-fastapi-prediction-service-setup.md](_bmad-output/sprint-artifacts/2-1-fastapi-prediction-service-setup.md)
- [Source: _bmad-output/epics.md#Story-2.2](_bmad-output/epics.md)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes List

### File List

- `backend/src/modules/ai/ai.module.ts` (Modified - Added HttpModule)
- `backend/src/modules/ai/ai.service.ts` (Modified - Implemented logic)
- `backend/src/modules/ai/ai.controller.ts` (Modified - Added endpoint)
- `backend/src/modules/ai/dto/prediction.dto.ts` (New - Added DTO)
- `backend/src/modules/ai/ai.service.spec.ts` (Modified - Updated tests)

## Senior Developer Review (AI)

### Review Outcome
**Status**: Approved
**Date**: 2025-12-23

### Action Items
- [x] [High] Fix test mocking strategy in `ai.service.spec.ts`
- [x] [High] Improve error handling logging in `ai.service.ts`
- [x] [Medium] Handle DTO defaults in `ai.service.ts`
- [x] [Medium] Add explicit return type to `ai.controller.ts`
- [x] [Low] Extract magic number timeout in `ai.service.ts`

### Severity Breakdown
- 2 High
- 2 Medium
- 1 Low
