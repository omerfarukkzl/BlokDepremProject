---
project_name: 'BlokDepremProject'
user_name: 'Omerfarukkizil'
date: '2025-12-22'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality', 'workflow_rules', 'critical_rules']
status: 'complete'
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Backend (NestJS)
| Package | Version |
|---------|---------|
| @nestjs/common | ^11.0.1 |
| @nestjs/core | ^11.0.1 |
| @nestjs/jwt | ^11.0.0 |
| @nestjs/typeorm | ^11.0.0 |
| typeorm | ^0.3.27 |
| ethers | ^6.16.0 |
| class-validator | ^0.14.2 |
| pg (PostgreSQL) | ^8.16.3 |
| TypeScript | ^5.7.3 |

### Frontend (React)
| Package | Version |
|---------|---------|
| react | ^19.1.1 |
| vite | ^7.1.7 |
| zustand | ^5.0.8 |
| tailwindcss | ^3.4.6 |
| react-hook-form | ^7.65.0 |
| zod | ^4.1.12 |
| @tanstack/react-query | ^5.90.5 |
| ethers | ^6.15.0 |
| TypeScript | ~5.9.3 |

### AI Service (Python)
| Package | Version |
|---------|---------|
| FastAPI | Latest |
| scikit-learn | Latest |
| pandas | Latest |
| joblib | Latest |

---

## Critical Implementation Rules

### TypeScript Configuration (Backend)

- **strictNullChecks: true** — Always handle null/undefined
- **experimentalDecorators: true** — Required for NestJS decorators
- **target: ES2023** — Use modern JavaScript features
- **moduleResolution: nodenext** — Node.js ESM resolution
- **noImplicitAny: false** — Implicit any is allowed (but discouraged)

### Import/Export Patterns

- Use **named exports** for services and utilities
- Use **default exports** for React components
- Always use **absolute imports** from `src/` in NestJS
- TypeORM entities use **ESM-compatible imports**

### Error Handling

- **Backend**: Always use NestJS built-in exception filters
- **External services**: Wrap in try/catch with graceful fallback
- **Blockchain**: Never throw uncaught exceptions; return pending status
- **Frontend**: Use React Error Boundaries for component errors

---

## Framework-Specific Rules

### NestJS Patterns

- **Module structure**: `*.module.ts`, `*.service.ts`, `*.controller.ts`
- **DTOs**: Always use `class-validator` decorators
- **Guards**: Use `@UseGuards()` decorator for protected routes
- **Entities**: Place in `src/entities/` with `.entity.ts` extension
- **Dependency Injection**: Always use constructor injection

### React Patterns

- **Components**: PascalCase files (e.g., `PredictionForm.tsx`)
- **Hooks**: Use React Query for server state, Zustand for client state
- **Forms**: Use react-hook-form with zod validation
- **Styling**: TailwindCSS utility classes, no inline styles
- **State slices**: Follow established Zustand slice pattern

### TypeORM Patterns

- **Entity fields**: camelCase (e.g., `walletAddress`, `createdAt`)
- **Table names**: snake_case plural (e.g., `tracking_logs`)
- **Relations**: Always use explicit relation decorators
- **JSONB columns**: Use for flexible data (e.g., `predictedQuantities`)

---

## Testing Rules

### Backend Testing

- **File pattern**: `*.spec.ts` co-located with source
- **Framework**: Jest with ts-jest
- **Test location**: `src/**/*.spec.ts`
- **E2E tests**: `test/` directory with `jest-e2e.json` config
- **Coverage**: Run `npm run test:cov` for coverage report

### Frontend Testing

- **Not yet configured** — Follow standard React Testing Library patterns when adding tests

---

## Code Quality & Style Rules

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| **TypeScript files** | kebab-case | `tracking-log.entity.ts` |
| **React components** | PascalCase | `PredictionForm.tsx` |
| **Functions** | camelCase | `getPrediction()` |
| **Variables** | camelCase | `regionId` |
| **Entity fields** | camelCase | `walletAddress` |
| **DB tables** | snake_case | `tracking_logs` |
| **API endpoints** | kebab-case plural | `/shipments`, `/tracking-logs` |

### Formatting

- **Prettier**: Configured in both backend and frontend
- **ESLint**: ESLint 9 with TypeScript plugin
- **Commands**: `npm run format` and `npm run lint`

---

## Workflow Rules

### Development Commands

```bash
# Start database
docker-compose up -d

# Start backend (Terminal 1)
cd backend && npm run start:dev

# Start frontend (Terminal 2)
cd frontend && npm run dev

# Start AI service (Terminal 3)
cd ai && uvicorn main:app --reload --port 5000
```

### Service Ports

| Service | Port |
|---------|------|
| NestJS Backend | 3000 |
| React Frontend | 5173 |
| FastAPI AI | 5000 |
| PostgreSQL | 5432 |

---

## Critical Don't-Miss Rules

### Anti-Patterns to AVOID

1. ❌ **Never throw unhandled exceptions in async operations**
   - Always wrap external calls in try/catch

2. ❌ **Never block main thread waiting for blockchain**
   - Use async handling, return pending status

3. ❌ **Never store private keys or secrets in code**
   - Use environment variables only

4. ❌ **Never create files outside established folder structure**
   - Follow existing module patterns

5. ❌ **Never skip validation on DTOs**
   - Always use class-validator decorators

### Graceful Degradation (MANDATORY)

When AI or blockchain services are unavailable:

```typescript
// ✅ CORRECT: Graceful fallback
try {
  const response = await this.aiService.getPrediction(regionId);
  return response;
} catch (error) {
  this.logger.warn(`AI service unavailable: ${error.message}`);
  return this.getFallbackPrediction(regionId);
}

// ❌ WRONG: Crashes when service is down
const response = await aiService.getPrediction(regionId);
return response;
```

### API Response Format (REQUIRED)

All NestJS endpoints must return this structure:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-12-22T03:00:00Z"
}
```

### Blockchain Transaction Pattern

- Always persist to PostgreSQL FIRST
- Record blockchain transaction AFTER database commit
- Store transaction hash in database for verification
- Retry failed transactions up to 3 times

---

## Quick Reference for AI Agents

### Before Implementing Any Story:

1. ✅ Read `_bmad-output/architecture.md` for full context
2. ✅ Check existing module patterns in `backend/src/modules/`
3. ✅ Follow established naming conventions
4. ✅ Use existing UI components from `frontend/src/components/ui/`
5. ✅ Implement graceful degradation for external services

### When Adding New Files:

- Entities → `backend/src/entities/`
- NestJS modules → `backend/src/modules/{module-name}/`
- React components → `frontend/src/components/features/{feature}/`
- React services → `frontend/src/services/`
- Zustand stores → `frontend/src/stores/`
