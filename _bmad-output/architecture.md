---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - /Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/prd.md
  - /Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/index.md
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2025-12-22'
project_name: 'BlokDepremProject'
user_name: 'Omerfarukkizil'
date: '2025-12-22'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements (29 total):**

| Category | Count | Key Capabilities |
|----------|-------|-----------------|
| Authentication & Identity | FR1-FR5 | MetaMask wallet auth, signature verification, role-based access |
| AI Prediction Service | FR6-FR10 | Region-based predictions for 4 aid types, confidence scores, prediction hashing |
| Blockchain Integration | FR11-FR15 | Immutable recording of predictions + shipments on Ethereum |
| Shipment Management | FR16-FR20 | Barcode generation, status tracking, delivery confirmation, accuracy calculation |
| Public Tracking | FR21-FR24 | Unauthenticated barcode lookup, timeline display, blockchain verification |
| Reporting & Analytics | FR25-FR29 | Prediction accuracy reports, filtering, export, audit trail |

**Non-Functional Requirements (11 total):**

| NFR | Architectural Impact |
|-----|---------------------|
| AI response < 10s | Flask/FastAPI micro-service with pre-loaded models |
| Blockchain transactions < 30s | Async transaction handling, don't block main thread |
| Graceful degradation | Fallback when AI/blockchain unavailable; database-first design |
| Retry failed transactions (3x) | Queue/retry mechanism for blockchain writes |
| JWT 24h expiry | Standard stateless auth, no session storage |
| Data persists before blockchain | PostgreSQL is source of truth; blockchain is verification layer |

**Scale & Complexity:**

- Primary domain: Full-stack (Web App + API Backend + AI Service + Smart Contract)
- Complexity level: HIGH — AI + Blockchain + Multi-part integration
- Estimated architectural components: 4 major parts + 6 integration layers

### Technical Constraints & Dependencies

**Existing Foundation (Brownfield):**
- NestJS 11 backend with 7 TypeORM entities
- React 19 + Vite + Zustand + TailwindCSS frontend
- 4 trained Random Forest models for aid prediction
- Docker PostgreSQL infrastructure
- JWT auth with wallet address support

**New Components Required:**
- Flask/FastAPI prediction service exposing ML models
- Ethereum smart contract (Sepolia testnet)
- NestJS ↔ AI Service integration layer
- NestJS ↔ Blockchain integration layer

### Cross-Cutting Concerns Identified

1. **Authentication Flow** — Wallet-based auth across frontend + backend
2. **Blockchain Recording** — Predictions and shipments both need on-chain recording
3. **Error Handling** — Graceful degradation when external services fail
4. **Audit Trail** — All predictions and deliveries must be traceable
5. **Data Consistency** — PostgreSQL and blockchain must stay synchronized

---

## Starter Template Evaluation

### Primary Technology Domain

Multi-Part Monorepo (Full-stack + AI + Blockchain) — extending existing brownfield project.

### Existing Stack (Confirmed)

| Part | Stack | Version |
|------|-------|---------|
| Backend API | NestJS + TypeORM + PostgreSQL | NestJS 11 |
| Web Frontend | React + Vite + Zustand + TailwindCSS | React 19, Vite 7 |
| Blockchain | ethers.js + Solidity | ethers.js 6.16 |
| AI Module | Python + scikit-learn (Random Forest) | Python 3.x |

### New Component: AI Prediction Service

**Selected:** FastAPI

**Rationale:**
- Modern async Python framework with automatic OpenAPI documentation
- Excellent integration with ML libraries (scikit-learn, pandas)
- Production-ready with uvicorn server
- Type hints support matches TypeScript patterns in NestJS

**Initialization Command:**
```bash
# In /ai directory
pip install fastapi uvicorn pandas scikit-learn joblib
```

### New Component: Smart Contract

**Selected:** Remix IDE for prototype deployment to Sepolia

**Rationale:**
- Quick iteration for prototype phase
- Browser-based, no local toolchain required
- Direct MetaMask integration for deployment
- Can migrate to Hardhat later for production testing

### Architectural Decisions Inherited from Existing Stack

- **TypeScript** for all JS/TS code
- **PostgreSQL** as source of truth
- **JWT + Wallet Auth** for officials
- **TailwindCSS** for styling
- **Zustand** for state management
- **Docker Compose** for local infrastructure

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data architecture for new Prediction entity
- NestJS ↔ AI Service communication pattern
- NestJS ↔ Blockchain integration pattern

**Important Decisions (Shape Architecture):**
- Wallet signature verification approach
- Local development orchestration

**Deferred Decisions (Post-MVP):**
- Production deployment strategy
- Scaling patterns
- Monitoring and observability

### Data Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Prediction Entity** | TypeORM with JSONB columns | Matches existing entity patterns; JSONB allows flexible storage of `predictedQuantities` and `actualQuantities` as `Record<string, number>` |
| **Data Validation** | class-validator decorators | Already used in existing entities |
| **Migration Strategy** | TypeORM synchronize (dev) | Prototype phase; production would use migrations |

**Prediction Entity Schema:**
```typescript
@Entity()
export class Prediction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  regionId: string;

  @Column('jsonb')
  predictedQuantities: Record<string, number>;

  @Column('jsonb', { nullable: true })
  actualQuantities: Record<string, number>;

  @Column({ nullable: true })
  blockchainTxHash: string;

  @Column({ type: 'decimal', nullable: true })
  accuracy: number;

  @CreateDateColumn()
  createdAt: Date;
}
```

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Wallet Signature Verification** | NestJS Guard with ethers.js `verifyMessage` | Clean separation of concerns; reusable across protected routes |
| **Signature Challenge** | Server-generated nonce + message | Prevents replay attacks |
| **Role Management** | Existing JWT payload with `role` claim | Reuse existing auth module patterns |

**WalletAuthGuard Pattern:**
```typescript
@Injectable()
export class WalletAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { signature, message, walletAddress } = request.body;
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  }
}
```

### API & Communication Patterns

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **NestJS → AI Service** | Dedicated `AiModule` with HttpModule | Encapsulates error handling, retry logic, and caching |
| **NestJS → Blockchain** | Dedicated `BlockchainModule` with retry queue | Handles async transactions, 3x retry on failure, stores tx hash |
| **Error Handling** | Graceful degradation pattern | AI/blockchain failures don't block core functionality |

**AI Module Structure:**
```
backend/src/modules/ai/
├── ai.module.ts
├── ai.service.ts        # HTTP calls to FastAPI
├── ai.controller.ts     # /ai/predict endpoints
└── dto/
    └── prediction.dto.ts
```

**Blockchain Module Structure:**
```
backend/src/modules/blockchain/
├── blockchain.module.ts
├── blockchain.service.ts    # ethers.js contract calls
├── blockchain.controller.ts # /blockchain/* endpoints
└── contracts/
    └── BlokDeprem.abi.json
```

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Local Development** | Docker Compose for all services | Single `docker-compose up` starts everything |
| **Service Ports** | NestJS:3000, React:5173, FastAPI:5000, PostgreSQL:5432 | Clear separation, no conflicts |
| **Environment Config** | `.env` files per service | Standard pattern, git-ignored |

**Updated docker-compose.yaml Services:**
```yaml
services:
  postgres:
    # ... existing
  backend:
    # ... existing NestJS
  frontend:
    # ... existing React
  ai-service:  # NEW
    build: ./ai
    ports:
      - "5000:5000"
    volumes:
      - ./ai/models:/app/models
```

### Decision Impact Analysis

**Implementation Sequence:**
1. Prediction Entity (data foundation)
2. FastAPI Service (AI capability)
3. AI Module in NestJS (integration)
4. Smart Contract (blockchain foundation)
5. Blockchain Module in NestJS (integration)
6. Frontend updates (user interface)

**Cross-Component Dependencies:**
- AI Module depends on FastAPI being available (with fallback)
- Blockchain Module depends on smart contract deployment
- Frontend depends on new NestJS endpoints

---

## Implementation Patterns & Consistency Rules

### Existing Patterns (From Brownfield Codebase)

| Category | Existing Pattern |
|----------|-----------------|
| **Database Tables** | snake_case (`tracking_logs`, `aid_items`) |
| **Entity Fields** | camelCase (`walletAddress`, `createdAt`) |
| **API Endpoints** | kebab-case plural (`/shipments`, `/tracking-logs`) |
| **TypeScript Files** | kebab-case (`tracking-log.entity.ts`) |
| **React Components** | PascalCase (`OfficialHomePage.tsx`) |
| **Frontend Services** | camelCase functions (`shipmentService.ts`) |

### New Patterns for Integration Layers

#### Naming Patterns

| Area | Pattern | Example |
|------|---------|--------|
| **AI Module files** | `ai.*.ts` | `ai.service.ts`, `ai.controller.ts` |
| **Blockchain Module files** | `blockchain.*.ts` | `blockchain.service.ts` |
| **DTO files** | `*.dto.ts` | `prediction.dto.ts`, `blockchain-record.dto.ts` |
| **FastAPI endpoints** | snake_case | `/predict`, `/health` |
| **Python files** | snake_case | `prediction_service.py`, `model_loader.py` |

#### API Response Format

All NestJS endpoints should follow this wrapper pattern:

```typescript
// Success response
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-12-22T02:30:00Z"
}

// Error response
{
  "success": false,
  "error": {
    "code": "AI_SERVICE_UNAVAILABLE",
    "message": "AI prediction service is temporarily unavailable"
  },
  "timestamp": "2025-12-22T02:30:00Z"
}
```

#### Error Handling Patterns

| Scenario | Pattern |
|----------|--------|
| **AI service unavailable** | Return 503 with fallback message; don't throw uncaught exception |
| **Blockchain tx failed** | Queue for retry; return 202 Accepted with pending status |
| **Validation error** | Return 400 with field-specific error messages |
| **Auth failure** | Return 401 with generic "Unauthorized" (no hints) |

#### State Management Patterns (Zustand)

```typescript
// Store slice pattern for new AI features
interface PredictionSlice {
  predictions: Prediction[];
  isLoading: boolean;
  error: string | null;
  fetchPrediction: (regionId: string) => Promise<void>;
  clearError: () => void;
}
```

#### Logging Patterns

| Level | When to Use |
|-------|-------------|
| `error` | Caught exceptions, failed external calls |
| `warn` | Degraded functionality, retry attempts |
| `log` | Successful operations, state changes |
| `debug` | Request/response payloads (dev only) |

### AI Agent Enforcement Rules

**All AI Agents MUST:**

1. ✅ Use existing entity patterns (TypeORM decorators, camelCase fields)
2. ✅ Follow NestJS module structure (`*.module.ts`, `*.service.ts`, `*.controller.ts`)
3. ✅ Use the standard API response wrapper format
4. ✅ Implement graceful degradation for external service calls
5. ✅ Use Zustand slice pattern for new frontend state

**All AI Agents MUST NOT:**

1. ❌ Create new folders outside established structure
2. ❌ Use different naming conventions than existing code
3. ❌ Add new dependencies without documenting in architecture
4. ❌ Throw unhandled exceptions from async operations
5. ❌ Store sensitive data (private keys, secrets) in code

### Pattern Examples

**✅ Good: NestJS AI Service with Error Handling**
```typescript
@Injectable()
export class AiService {
  async getPrediction(regionId: string): Promise<PredictionDto> {
    try {
      const response = await this.httpService.post('/predict', { region_id: regionId });
      return response.data;
    } catch (error) {
      this.logger.warn(`AI service unavailable, returning fallback for ${regionId}`);
      return this.getFallbackPrediction(regionId);
    }
  }
}
```

**❌ Bad: Missing Error Handling**
```typescript
async getPrediction(regionId: string) {
  const response = await axios.post('/predict', { region_id: regionId });
  return response.data; // Will crash if AI service is down!
}
```

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
BlokDepremProject/
├── README.md
├── docker-compose.yaml         # All services (existing + AI)
├── .gitignore
├── .env.example
│
├── backend/                    # NestJS 11 Backend
│   ├── package.json
│   ├── nest-cli.json
│   ├── tsconfig.json
│   ├── .env
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── entities/           # Existing 7 + new Prediction
│   │   │   ├── location.entity.ts
│   │   │   ├── official.entity.ts
│   │   │   ├── aid-item.entity.ts
│   │   │   ├── need.entity.ts
│   │   │   ├── shipment.entity.ts
│   │   │   ├── shipment-detail.entity.ts
│   │   │   ├── tracking-log.entity.ts
│   │   │   └── prediction.entity.ts     # NEW
│   │   ├── modules/
│   │   │   ├── auth/           # Existing auth module
│   │   │   ├── locations/
│   │   │   ├── officials/
│   │   │   ├── needs/
│   │   │   ├── shipments/
│   │   │   ├── ai/             # NEW - AI Integration
│   │   │   │   ├── ai.module.ts
│   │   │   │   ├── ai.service.ts
│   │   │   │   ├── ai.controller.ts
│   │   │   │   └── dto/
│   │   │   │       └── prediction.dto.ts
│   │   │   └── blockchain/     # NEW - Blockchain Integration
│   │   │       ├── blockchain.module.ts
│   │   │       ├── blockchain.service.ts
│   │   │       ├── blockchain.controller.ts
│   │   │       └── contracts/
│   │   │           └── BlokDeprem.abi.json
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── wallet-auth.guard.ts     # NEW
│   │   └── common/
│   │       ├── filters/
│   │       ├── interceptors/
│   │       └── decorators/
│   └── test/
│
├── frontend/                   # React 19 Frontend
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── ui/             # Reusable UI components
│   │   │   └── features/       # Feature-specific components
│   │   │       ├── predictions/ # NEW - AI prediction UI
│   │   │       │   ├── PredictionForm.tsx
│   │   │       │   ├── PredictionResult.tsx
│   │   │       │   └── AccuracyReport.tsx
│   │   │       └── tracking/   # NEW - Blockchain tracking UI
│   │   │           ├── TrackingTimeline.tsx
│   │   │           └── BlockchainVerification.tsx
│   │   ├── pages/
│   │   │   ├── OfficialHomePage.tsx
│   │   │   ├── TrackingPage.tsx
│   │   │   └── AdminReportsPage.tsx     # NEW
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── shipmentService.ts
│   │   │   ├── aiService.ts    # NEW
│   │   │   └── blockchainService.ts    # NEW
│   │   └── stores/
│   │       ├── authStore.ts
│   │       └── predictionStore.ts      # NEW
│   └── public/
│
├── ai/                         # FastAPI AI Service (NEW)
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── main.py                 # FastAPI entrypoint
│   ├── prediction_service.py
│   ├── model_loader.py
│   └── models/                 # Trained Random Forest models
│       ├── tent_model.joblib
│       ├── container_model.joblib
│       ├── food_model.joblib
│       └── blanket_model.joblib
│
└── blockchain/                 # Smart Contract (NEW)
    ├── contracts/
    │   └── BlokDeprem.sol
    ├── scripts/
    │   └── deploy.js           # Optional Hardhat deploy
    └── README.md               # Remix IDE deployment guide
```

### Architectural Boundaries

#### API Boundaries

| Boundary | Endpoints | Auth |
|----------|-----------|------|
| **Public API** | `/track/:barcode`, `/health` | None |
| **Official API** | `/ai/predict`, `/shipments/*`, `/needs/*` | JWT + Wallet |
| **Admin API** | `/predictions/reports/*`, `/admin/*` | JWT + Admin Role |
| **Internal** | NestJS → FastAPI (`:5000/predict`) | None (internal network) |

#### Service Boundaries

| Service | Port | Responsibility |
|---------|------|--------------|
| **NestJS Backend** | 3000 | API orchestration, auth, database |
| **React Frontend** | 5173 | User interface, MetaMask integration |
| **FastAPI AI** | 5000 | ML predictions only |
| **Ethereum Sepolia** | RPC | Immutable record storage |
| **PostgreSQL** | 5432 | Primary data storage |

### Requirements to Structure Mapping

| FR Category | Backend Location | Frontend Location |
|-------------|------------------|------------------|
| **Authentication (FR1-5)** | `modules/auth/`, `guards/` | `services/authService.ts`, `stores/authStore.ts` |
| **AI Prediction (FR6-10)** | `modules/ai/` | `components/features/predictions/`, `services/aiService.ts` |
| **Blockchain (FR11-15)** | `modules/blockchain/` | `components/features/tracking/`, `services/blockchainService.ts` |
| **Shipments (FR16-20)** | `modules/shipments/` | Existing pages |
| **Public Tracking (FR21-24)** | `modules/shipments/` controller | `pages/TrackingPage.tsx` |
| **Reports (FR25-29)** | `modules/ai/` controller | `pages/AdminReportsPage.tsx` |

### Data Flow

```
User Request → React → NestJS → PostgreSQL (persist)
                              → FastAPI (AI prediction)
                              → Ethereum (blockchain record)
                              ← Response with tx hash
```

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices work together without conflicts. NestJS 11, React 19, FastAPI, ethers.js 6.16, and PostgreSQL are proven combinations. TypeScript is used consistently across NestJS and React, matching the existing codebase patterns.

**Pattern Consistency:**
Implementation patterns align with existing brownfield codebase conventions. Naming patterns (snake_case for DB, camelCase for entity fields, PascalCase for components) match established code.

**Structure Alignment:**
Project structure supports all architectural decisions with clear module boundaries. New AI and Blockchain modules follow existing NestJS module conventions.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**

| FR Category | Count | Status |
|-------------|-------|--------|
| Authentication & Identity (FR1-5) | 5 | ✅ Covered by auth module + WalletAuthGuard |
| AI Prediction Service (FR6-10) | 5 | ✅ Covered by AI module + FastAPI |
| Blockchain Integration (FR11-15) | 5 | ✅ Covered by Blockchain module + smart contract |
| Shipment Management (FR16-20) | 5 | ✅ Covered by existing shipments module |
| Public Tracking (FR21-24) | 4 | ✅ Covered by public controller endpoints |
| Reporting & Analytics (FR25-29) | 5 | ✅ Covered by AI controller + admin page |

**Non-Functional Requirements Coverage:**

| NFR | Status | Architectural Support |
|-----|--------|----------------------|
| AI response < 10s | ✅ | Pre-loaded models in FastAPI |
| Blockchain tx < 30s | ✅ | Async handling, non-blocking |
| Graceful degradation | ✅ | Fallback patterns in AI/Blockchain modules |
| 3x retry on failure | ✅ | Blockchain module retry queue |
| JWT 24h expiry | ✅ | Existing auth module |
| Database-first design | ✅ | PostgreSQL as source of truth |

### Implementation Readiness Validation ✅

**Decision Completeness:**
All critical decisions documented with technology versions. Integration patterns defined for NestJS ↔ FastAPI and NestJS ↔ Ethereum.

**Structure Completeness:**
Complete directory tree with all files specified. New modules clearly marked with integration points.

**Pattern Completeness:**
Naming conventions, error handling patterns, state management patterns, and logging patterns fully documented with examples.

### Gap Analysis Results

**Critical Gaps:** None ✅

**Important Gaps (Optional Improvements):**
- Testing strategy: Test locations defined but detailed test patterns deferred to epic stories
- Deployment strategy: Intentionally deferred per PRD scope (prototype only)

**Nice-to-Have (Post-MVP):**
- Monitoring and observability patterns
- CI/CD pipeline configuration

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (HIGH)
- [x] Technical constraints identified (brownfield, existing 7 entities)
- [x] Cross-cutting concerns mapped (5 identified)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined (AI module, Blockchain module)
- [x] Error handling and fallback strategies defined

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented with examples

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** ✅ READY FOR IMPLEMENTATION

**Confidence Level:** HIGH
- Brownfield project with established patterns
- Clear integration boundaries defined
- All requirements mapped to architectural components

**Key Strengths:**
- Leverages existing working codebase and patterns
- Clear separation between AI prediction and blockchain recording
- Graceful degradation ensures core functionality works even if external services fail
- Database-first design ensures data safety

**Areas for Future Enhancement:**
- Production deployment configuration
- Horizontal scaling patterns
- Real-time WebSocket notifications (deferred from MVP)

### Implementation Handoff

**AI Agent Guidelines:**
1. Follow all architectural decisions exactly as documented
2. Use implementation patterns consistently across all components
3. Respect project structure and boundaries
4. Refer to this document for all architectural questions

**First Implementation Priority:**
1. Create Prediction entity in backend
2. Set up FastAPI AI service with trained models
3. Create AI module in NestJS for integration
4. Deploy smart contract to Sepolia
5. Create Blockchain module in NestJS
6. Add frontend components and services

---

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2025-12-22
**Document Location:** `_bmad-output/architecture.md`

### Final Architecture Deliverables

**📋 Complete Architecture Document**
- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**🏗️ Implementation Ready Foundation**
- 5 major architectural decisions made
- 6 implementation pattern categories defined
- 4 architectural components specified (backend, frontend, ai, blockchain)
- 29 functional requirements + 11 NFRs fully supported

### Quality Assurance Checklist

**✅ Architecture Coherence**
- [x] All decisions work together without conflicts
- [x] Technology choices are compatible
- [x] Patterns support the architectural decisions
- [x] Structure aligns with all choices

**✅ Requirements Coverage**
- [x] All functional requirements are supported
- [x] All non-functional requirements are addressed
- [x] Cross-cutting concerns are handled
- [x] Integration points are defined

**✅ Implementation Readiness**
- [x] Decisions are specific and actionable
- [x] Patterns prevent agent conflicts
- [x] Structure is complete and unambiguous
- [x] Examples are provided for clarity

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.
