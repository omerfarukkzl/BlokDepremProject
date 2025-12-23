# BlokDeprem Project Overview

## Project Summary

**BlokDeprem** is a blockchain and AI-powered earthquake aid tracking system designed to make post-earthquake relief processes more transparent, fast, and efficient.

- **Name:** BlokDeprem (Blockchain Deprem)
- **Purpose:** Post-earthquake aid coordination and tracking
- **Status:** Active Development
- **Repository Type:** Multi-Part Monorepo

---

## Architecture Type

**Multi-Part Application** with 4 distinct components:

| Part | Type | Technology Stack | Purpose |
|------|------|-----------------|---------|
| **backend** | Backend API | NestJS, TypeScript, TypeORM, PostgreSQL | Business logic, REST API, database |
| **frontend** | Web App | React 19, Vite, TypeScript, TailwindCSS | User interface, SPA |
| **blockchain** | Smart Contract | Solidity (Ethereum) | Immutable tracking records |
| **ai** | AI Module | Python | Distribution optimization |

---

## Technology Stack Summary

### Backend
- **Framework:** NestJS 11
- **Language:** TypeScript 5.7
- **ORM:** TypeORM 0.3
- **Database:** PostgreSQL 13
- **Auth:** JWT + Passport
- **Validation:** class-validator, class-transformer
- **Blockchain Integration:** ethers.js 6.16

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite 7
- **Language:** TypeScript 5.9
- **Styling:** TailwindCSS 3.4
- **State:** Zustand 5
- **Forms:** React Hook Form + Zod
- **HTTP:** Axios + TanStack Query
- **i18n:** i18next
- **UI:** Headless UI + Heroicons

### Infrastructure
- **Container:** Docker + docker-compose
- **Database:** PostgreSQL 13
- **Network:** Ethereum (for blockchain tracking)

---

## System Actors

1. **Official (Görevli)** - Authorized personnel/volunteers who:
   - Register with crypto wallet address
   - Accept and log aid deliveries
   - Create barcodes for shipments
   - Update shipment status

2. **Donor (Yardımsever)** - Contributors who:
   - View location-based needs lists
   - Track donations via barcode

3. **Admin** - System administrators who:
   - Access reports and analytics
   - Monitor all aid movements

---

## Core Features

### Implemented ✅
- JWT-based authentication with wallet addresses
- RESTful API with modular architecture
- 7 database entities for complete data model
- React SPA with responsive design
- Zustand state management
- Form validation with Zod
- Route-based code organization
- Docker PostgreSQL setup

### In Development 🔄
- Blockchain integration with Ethereum
- AI distribution optimization
- Real-time updates (WebSockets)
- PWA support
- Barcode scanning

---

## Quick Reference

| Category | Technology |
|----------|------------|
| Primary Language | TypeScript |
| Backend Framework | NestJS |
| Frontend Framework | React + Vite |
| Database | PostgreSQL |
| ORM | TypeORM |
| State Management | Zustand |
| Styling | TailwindCSS |
| Blockchain | Ethereum/Solidity |
| AI | Python |

---

## Documentation Links

### Generated Documentation
- [Source Tree Analysis](./source-tree-analysis.md)
- [Architecture - Backend](./architecture-backend.md)
- [Architecture - Frontend](./architecture-frontend.md)
- [Integration Architecture](./integration-architecture.md)
- [Development Guide](./development-guide.md)

### Existing Documentation
- [README.md](../README.md) - Project overview and roadmap
- [BACKEND_DOCUMENTATION.md](../BACKEND_DOCUMENTATION.md) - Comprehensive backend docs
- [FRONTEND_DOCUMENTATION.md](../FRONTEND_DOCUMENTATION.md) - Comprehensive frontend docs
- [NEEDS_TRACK_IMPLEMENTATION_REPORT.md](../NEEDS_TRACK_IMPLEMENTATION_REPORT.md) - Implementation report

---

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Quick Start
```bash
# Start database
docker-compose up -d

# Backend
cd backend && npm install && npm run start:dev

# Frontend
cd frontend && npm install && npm run dev
```

Backend API: http://localhost:3000
Frontend: http://localhost:5173

---

## AI-Assisted Development Guide

When working with AI agents on this project:

1. **For Backend Changes:** Reference `BACKEND_DOCUMENTATION.md` and the entities in `backend/src/entities/`
2. **For Frontend Changes:** Reference `FRONTEND_DOCUMENTATION.md` and components in `frontend/src/components/`
3. **For Database Changes:** See the entity definitions and TypeORM configuration
4. **For API Work:** Check the modules structure in `backend/src/modules/`
