<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BlokDeprem is a blockchain and AI-supported earthquake aid tracking system designed to make post-earthquake aid processes more transparent, fast, and efficient. The system uses blockchain for reliable and transparent tracking of aid materials, AI for needs identification and distribution optimization, and provides user-friendly web and mobile interfaces.

## System Architecture

The application consists of 4 main components:

1. **Backend (NestJS)**: Core business logic, APIs, and database communication
2. **Frontend (Planned React + Vite + Tailwind)**: User interface for officials and donors
3. **Database (PostgreSQL)**: Operational data storage
4. **Blockchain (Ethereum)**: Immutable tracking of critical status changes
5. **AI Module (Python)**: Needs optimization and distribution suggestions

## Development Commands

### Backend (NestJS)
Navigate to `backend/` directory for all backend operations:

```bash
cd backend

# Development
npm run start:dev          # Start in watch mode
npm run start:debug        # Start with debug mode

# Building and Production
npm run build              # Build the application
npm run start:prod         # Start production build

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run end-to-end tests
npm run test:cov           # Run tests with coverage

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

### AI Module (Python)
The AI module is located in `ai/main.py` and uses Python with data science libraries.

### Blockchain Smart Contract
The smart contract is located at `blockchain/BlokDepremTracker.sol` and is written in Solidity.

## Key Technical Details

### Database Schema (PostgreSQL)
- **locations**: Aid centers and locations
- **officials**: Authorized personnel with crypto wallet addresses
- **aid_items**: Types of aid materials
- **needs**: Location-based needs lists
- **shipments**: Aid shipments with barcodes
- **shipment_details**: Contents of each shipment
- **tracking_logs**: Blockchain records

### API Endpoints Structure
- **Auth**: `/api/auth/*` - Wallet-based authentication
- **Needs**: `/api/needs/*` - CRUD operations for needs
- **Shipments**: `/api/shipments/*` - Shipment management
- **Tracking**: `/api/track/:barcode` - Shipment tracking
- **AI**: `/api/ai/*` - AI-powered suggestions

### Blockchain Integration
- Uses Ethereum smart contract for immutable tracking
- Critical status changes (Registered, InTransit, Delivered) are recorded on blockchain
- Backend integrates with contract using ethers.js or web3.js

### Authentication System
- Crypto wallet-based authentication
- JWT tokens for session management
- Role-based access (Officials, Donors, Admins)

## Technology Stack

- **Backend**: NestJS, TypeScript, TypeORM, PostgreSQL
- **Frontend**: React 18, Vite, Tailwind CSS (planned)
- **Blockchain**: Ethereum, Solidity
- **AI/ML**: Python, NumPy, Pandas, Scikit-learn
- **Authentication**: JWT, Passport.js

## Development Workflow

1. Backend development with NestJS framework
2. Database migrations using TypeORM
3. Smart contract deployment to test networks
4. AI module integration for optimization
5. Frontend consumption of REST APIs

## Important Notes

- The system uses crypto wallet addresses as primary identifiers for officials
- All shipment status changes are recorded both in database and blockchain
- The AI module analyzes data to provide distribution optimization suggestions
- Frontend is planned to be modernized from legacy HTML/CSS/JS to React ecosystem