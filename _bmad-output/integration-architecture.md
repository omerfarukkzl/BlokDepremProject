# BlokDeprem Integration Architecture

## Overview

BlokDeprem is a multi-part system with clear integration boundaries between components.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                    http://localhost:5173                         │
└─────────────────────────────┬───────────────────────────────────┘
                              │ REST API (Axios)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend (NestJS)                         │
│                    http://localhost:3000                         │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌─────────────────┐  │
│  │  Auth   │  │  Needs   │  │ Shipments │  │    Tracking     │  │
│  │ Module  │  │  Module  │  │  Module   │  │     Module      │  │
│  └────┬────┘  └────┬─────┘  └─────┬─────┘  └────────┬────────┘  │
│       │            │              │                  │           │
│       └────────────┴──────────────┴──────────────────┘           │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
           ▼                   ▼                   ▼
    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
    │  PostgreSQL │     │  Ethereum   │     │  AI Module  │
    │   Database  │     │  Blockchain │     │   (Python)  │
    └─────────────┘     └─────────────┘     └─────────────┘
```

---

## Integration Points

### 1. Frontend ↔ Backend (REST API)

**Direction:** Bidirectional
**Protocol:** HTTP/REST
**Client:** Axios + TanStack Query

| Endpoint Group | Base Path | Auth Required | Purpose |
|----------------|-----------|---------------|---------|
| Auth | `/auth` | No | Login, Register |
| Needs | `/needs` | Partial | List/create needs |
| Shipments | `/shipments` | Yes | Manage shipments |
| Tracking | `/track` | No | Track by barcode |
| AI | `/ai` | Yes | Distribution suggestions |
| Locations | `/locations` | No | Location data |
| Aid Items | `/aid-items` | No | Item catalog |

**Authentication Flow:**
1. User enters wallet address on frontend
2. Frontend POSTs to `/auth/login`
3. Backend validates and returns JWT token
4. Frontend stores token in Zustand + localStorage
5. Subsequent requests include `Authorization: Bearer <token>`

---

### 2. Backend ↔ PostgreSQL (TypeORM)

**Direction:** Bidirectional
**Protocol:** PostgreSQL wire protocol
**ORM:** TypeORM

**Connection Config:**
```typescript
{
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'user',
  password: 'password',
  database: 'blokdeprem',
  synchronize: true  // Development only
}
```

**Entities:**
- `Location` - Geographic locations
- `Official` - Authorized personnel (linked to wallet)
- `AidItem` - Aid item types/categories
- `Need` - Location-specific needs
- `Shipment` - Shipment records
- `ShipmentDetail` - Items in shipment
- `TrackingLog` - Blockchain transaction logs

---

### 3. Backend → Blockchain (ethers.js)

**Direction:** Backend → Ethereum
**Protocol:** JSON-RPC
**Library:** ethers.js v6

**Purpose:** Log immutable shipment status changes

**Smart Contract Functions:**
```solidity
// Add new status log
function addShipmentLog(
  string memory _barcode, 
  string memory _status, 
  string memory _location
) public onlyBackend

// Query shipment history
function getShipmentHistory(
  string memory _barcode
) public view returns (Log[] memory)
```

**Integration Flow:**
1. Shipment status changes in backend
2. Backend calls `addShipmentLog()` via ethers.js
3. Transaction hash stored in `tracking_logs` table
4. Users can verify on blockchain

---

### 4. Backend ↔ AI Module

**Direction:** Backend → AI → Backend
**Protocol:** Internal/HTTP
**Status:** Placeholder implementation

**Purpose:** Distribution optimization and priority suggestions

**Planned Endpoints:**
- `GET /ai/distribution-suggestions` - Get optimal distribution routes
- AI analyzes needs, inventory, and logistics
- Returns prioritized distribution recommendations

---

## Data Flow Examples

### Creating a Shipment

```
1. Official fills form on Frontend
2. Frontend POST /shipments/create
3. Backend validates auth (JWT)
4. Backend creates Shipment entity
5. Backend creates ShipmentDetail entities
6. Backend generates barcode
7. Backend calls blockchain.addShipmentLog()
8. Backend stores transaction_hash
9. Response returned to Frontend
10. Frontend updates UI via Zustand
```

### Tracking a Shipment

```
1. User enters barcode on Frontend
2. Frontend GET /track/:barcode
3. Backend queries shipments table
4. Backend queries tracking_logs table
5. Backend optionally verifies on blockchain
6. Response with full history
7. Frontend displays timeline
```

---

## Authentication Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend                               │
│  ┌─────────────────┐    ┌──────────────────────────────────┐ │
│  │   Login Page    │───▶│         authStore (Zustand)       │ │
│  └─────────────────┘    │  - token: string                  │ │
│                         │  - user: Official                 │ │
│  ┌─────────────────┐    │  - isAuthenticated: boolean       │ │
│  │  API Service    │◀───│                                   │ │
│  │  (Axios + JWT)  │    └──────────────────────────────────┘ │
│  └────────┬────────┘                                         │
└───────────┼──────────────────────────────────────────────────┘
            │ Authorization: Bearer <token>
            ▼
┌───────────────────────────────────────────────────────────────┐
│                         Backend                                │
│  ┌────────────────┐    ┌─────────────────────────────────────┐│
│  │  Auth Module   │───▶│        JwtAuthGuard                 ││
│  │  - JwtStrategy │    │   (Protects secured routes)         ││
│  │  - JwtService  │    └─────────────────────────────────────┘│
│  └────────────────┘                                           │
└───────────────────────────────────────────────────────────────┘
```

---

## Environment Configuration

### Backend
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=user
DB_PASSWORD=password
DB_DATABASE=blokdeprem

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Blockchain
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/...
CONTRACT_ADDRESS=0x...
WALLET_PRIVATE_KEY=...
```

### Frontend
```env
VITE_API_URL=http://localhost:3000
VITE_BLOCKCHAIN_NETWORK=sepolia
```

---

## Ports and Services

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Backend (NestJS) | 3000 | http://localhost:3000 |
| PostgreSQL | 5432 | localhost:5432 |
| Ethereum | - | Sepolia testnet |
