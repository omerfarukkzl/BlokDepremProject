# BlokDeprem Development Guide

## Prerequisites

- **Node.js:** v18+
- **npm:** v9+
- **Docker:** v20+ (for PostgreSQL)
- **Docker Compose:** v2+

---

## Quick Start

### 1. Start Database
```bash
# From project root
docker-compose up -d

# Verify database is running
docker ps
# Should show: blokdeprem-db (postgres:13)
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Start development server
npm run start:dev
```

Backend runs at: **http://localhost:3000**

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## Development Commands

### Backend (`/backend`)

| Command | Purpose |
|---------|---------|
| `npm run start:dev` | Development with hot reload |
| `npm run start:debug` | Debug mode |
| `npm run build` | Production build |
| `npm run start:prod` | Run production build |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run lint` | Lint and fix |
| `npm run format` | Format with Prettier |

### Frontend (`/frontend`)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development with Vite |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix lint errors |
| `npm run format` | Format with Prettier |

### Docker

| Command | Purpose |
|---------|---------|
| `docker-compose up -d` | Start PostgreSQL |
| `docker-compose down` | Stop PostgreSQL |
| `docker-compose logs db` | View database logs |
| `docker exec -it blokdeprem-db psql -U user -d blokdeprem` | Connect to database |

---

## Environment Setup

### Backend (`backend/.env`)
```env
# Create this file if it doesn't exist
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=user
DB_PASSWORD=password
DB_DATABASE=blokdeprem
JWT_SECRET=your-secret-key-here
```

### Frontend (`frontend/.env`)
```env
# Already exists with example values
VITE_API_URL=http://localhost:3000
```

---

## Project Structure Conventions

### Backend Modules

Each module in `backend/src/modules/` follows this structure:
```
module-name/
├── module-name.module.ts      # Module definition
├── module-name.controller.ts  # HTTP endpoints
├── module-name.service.ts     # Business logic
├── dto/                       # Data Transfer Objects
│   ├── create-*.dto.ts
│   └── update-*.dto.ts
└── guards/                    # Auth guards (if needed)
```

### Frontend Components

Components in `frontend/src/components/` follow this structure:
```
components/
├── ui/           # Reusable base components (Button, Input, Modal)
├── forms/        # Form-specific components
├── layout/       # Layout wrappers (Nav, Header, Footer)
└── [feature]/    # Feature-specific components
```

### Pages

Pages in `frontend/src/pages/` are organized by access level:
```
pages/
├── public/       # No auth required (Login, Needs, Track)
├── official/     # Official role required (Dashboard, Shipments)
└── admin/        # Admin role required (Reports)
```

---

## Testing

### Backend Tests
```bash
cd backend

# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

### Test Files
- Unit tests: `*.spec.ts` alongside source files
- E2E tests: `backend/test/*.e2e-spec.ts`

---

## API Testing (Example Requests)

### Register an Official
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0x1234567890abcdef1234567890abcdef12345678",
    "name": "Test Official",
    "location_id": 1
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0x1234567890abcdef1234567890abcdef12345678"
  }'
```

### Get Needs (Public)
```bash
curl http://localhost:3000/needs
```

### Create Shipment (Auth Required)
```bash
curl -X POST http://localhost:3000/shipments/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "source_location_id": 1,
    "destination_location_id": 2,
    "items": [{"item_id": 1, "quantity": 50}]
  }'
```

---

## Common Tasks

### Adding a New API Endpoint

1. Create/update DTO in `backend/src/modules/[module]/dto/`
2. Add method to service in `backend/src/modules/[module]/*.service.ts`
3. Add route to controller in `backend/src/modules/[module]/*.controller.ts`
4. Update frontend API service in `frontend/src/services/`

### Adding a New Database Entity

1. Create entity in `backend/src/entities/`
2. Import in `backend/src/app.module.ts` TypeORM entities array
3. TypeORM will auto-sync in development

### Adding a New Frontend Page

1. Create page component in `frontend/src/pages/[access-level]/`
2. Add route in `frontend/src/App.tsx`
3. Update navigation if needed

### Adding a New UI Component

1. Create in `frontend/src/components/ui/`
2. Use Headless UI for accessibility
3. Style with TailwindCSS
4. Export from component index (if exists)

---

## Troubleshooting

### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker ps

# Restart database
docker-compose down && docker-compose up -d

# Check logs
docker-compose logs db
```

### Backend Won't Start
```bash
# Check for port conflicts
lsof -i :3000

# Check TypeScript errors
npm run build
```

### Frontend Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules/.vite
npm run dev
```

---

## Code Style

### TypeScript
- Strict mode enabled
- Use explicit types (avoid `any`)
- Follow NestJS/React conventions

### Formatting
- Prettier for code formatting
- ESLint for linting
- Run before committing

### Git
- Conventional commits recommended
- Feature branches for new work
