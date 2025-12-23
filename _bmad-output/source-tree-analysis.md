# BlokDeprem Source Tree Analysis

## Repository Overview

**Repository Type:** Multi-Part Monorepo
**Total Parts:** 4 (backend, frontend, blockchain, ai)

---

## Complete Directory Structure

```
BlokDepremProject/
├── _bmad/                      # BMad Method framework files
├── _bmad-output/               # Generated documentation and artifacts
├── backend/                    # NestJS Backend API (Part: backend)
│   ├── src/
│   │   ├── entities/           # TypeORM database models
│   │   │   ├── aid-item.entity.ts
│   │   │   ├── location.entity.ts
│   │   │   ├── need.entity.ts
│   │   │   ├── official.entity.ts
│   │   │   ├── shipment.entity.ts
│   │   │   ├── shipment-detail.entity.ts
│   │   │   └── tracking-log.entity.ts
│   │   ├── modules/            # Business logic modules
│   │   │   ├── ai/             # AI distribution suggestions
│   │   │   ├── aid-items/      # Aid item management
│   │   │   ├── auth/           # JWT authentication
│   │   │   ├── locations/      # Location management
│   │   │   ├── needs/          # Need tracking
│   │   │   ├── shipments/      # Shipment management
│   │   │   └── tracking/       # Blockchain tracking
│   │   ├── app.module.ts       # Root module
│   │   ├── app.controller.ts   # Root controller
│   │   ├── app.service.ts      # Root service
│   │   └── main.ts             # ⚡ Entry point
│   ├── test/                   # E2E tests
│   ├── dist/                   # Compiled output
│   ├── package.json            # Dependencies
│   ├── tsconfig.json           # TypeScript config
│   └── nest-cli.json           # NestJS CLI config
│
├── frontend/                   # React Web Application (Part: frontend)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # UI components (~48 files)
│   │   │   ├── ui/            # Base UI components
│   │   │   ├── forms/         # Form components
│   │   │   └── layout/        # Layout components
│   │   ├── pages/              # Page components (~10 files)
│   │   │   ├── public/        # Public pages
│   │   │   ├── official/      # Official pages
│   │   │   └── admin/         # Admin pages
│   │   ├── services/           # API services (~6 files)
│   │   ├── stores/             # Zustand stores (~3 files)
│   │   ├── types/              # TypeScript types
│   │   ├── constants/          # Constants
│   │   ├── utils/              # Utilities
│   │   ├── i18n/               # Internationalization
│   │   │   └── locales/       # Translation files
│   │   ├── App.tsx             # ⚡ Root component
│   │   ├── main.tsx            # ⚡ Entry point
│   │   └── index.css           # Global styles
│   ├── package.json            # Dependencies
│   ├── vite.config.ts          # Vite config
│   ├── tailwind.config.js      # Tailwind config
│   └── tsconfig.json           # TypeScript config
│
├── blockchain/                 # Smart Contracts (Part: blockchain)
│   └── BlokDepremTracker.sol   # ⚡ Main smart contract
│
├── ai/                         # AI Module (Part: ai)
│   └── main.py                 # ⚡ Entry point (placeholder)
│
├── openspec/                   # OpenSpec change management
│   └── project.md              # Project specification
│
├── docker-compose.yml          # 🐳 PostgreSQL container
├── init.sql                    # Database initialization
├── package.json                # Root package.json
│
├── README.md                   # Main documentation
├── BACKEND_DOCUMENTATION.md    # Backend docs
├── FRONTEND_DOCUMENTATION.md   # Frontend docs
├── CLAUDE.md                   # AI assistant guidelines
├── AGENTS.md                   # Agent guidelines
└── blokdeprem-tubitak-basvuru-formu.md  # TUBITAK application
```

---

## Critical Folders by Part

### Backend (`/backend`)

| Folder | Purpose | Key Files |
|--------|---------|-----------|
| `src/entities/` | Database models | 7 TypeORM entities |
| `src/modules/auth/` | JWT authentication | controller, service, strategy, guard |
| `src/modules/needs/` | Need management | CRUD operations, location filtering |
| `src/modules/shipments/` | Shipment tracking | Create, update status |
| `src/modules/tracking/` | Blockchain integration | Transaction logging |
| `src/modules/ai/` | AI suggestions | Distribution optimization |
| `src/modules/locations/` | Location CRUD | Coordinates, names |
| `src/modules/aid-items/` | Aid item catalog | Categories, types |

### Frontend (`/frontend`)

| Folder | Purpose | Key Files |
|--------|---------|-----------|
| `src/components/ui/` | Base UI | Button, Input, Modal, Select |
| `src/components/forms/` | Form components | ShipmentForm |
| `src/components/layout/` | Layout wrappers | Navigation, headers |
| `src/pages/public/` | Public pages | Login, Register, Needs, Track |
| `src/pages/official/` | Official pages | Dashboard, Shipments |
| `src/pages/admin/` | Admin pages | Admin Dashboard |
| `src/services/` | API layer | Axios client, endpoints |
| `src/stores/` | State management | authStore, etc. |

### Blockchain (`/blockchain`)

| File | Purpose |
|------|---------|
| `BlokDepremTracker.sol` | Main smart contract for immutable shipment tracking |

---

## Entry Points

| Part | Entry Point | Purpose |
|------|-------------|---------|
| backend | `backend/src/main.ts` | NestJS bootstrap, starts Express server |
| frontend | `frontend/src/main.tsx` | React DOM render, app initialization |
| blockchain | `blockchain/BlokDepremTracker.sol` | Solidity contract constructor |
| ai | `ai/main.py` | Python module entry (placeholder) |

---

## Integration Points

### Frontend → Backend
- **Type:** REST API
- **Client:** Axios (`frontend/src/services/`)
- **Endpoints:** `/auth`, `/needs`, `/shipments`, `/track`, `/ai`

### Backend → Database
- **Type:** TypeORM
- **Connection:** PostgreSQL via docker-compose
- **Entities:** 7 tables for complete data model

### Backend → Blockchain
- **Type:** ethers.js
- **Purpose:** Log shipment status changes to Ethereum
- **Contract:** BlokDepremTracker.sol

### Backend → AI
- **Type:** Internal service
- **Purpose:** Distribution optimization suggestions

---

## Configuration Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | PostgreSQL container setup |
| `init.sql` | Database schema initialization |
| `backend/package.json` | Backend dependencies |
| `backend/tsconfig.json` | TypeScript configuration |
| `backend/nest-cli.json` | NestJS CLI settings |
| `frontend/package.json` | Frontend dependencies |
| `frontend/vite.config.ts` | Vite build configuration |
| `frontend/tailwind.config.js` | TailwindCSS configuration |
| `frontend/.env` | Environment variables |
