# Story 3.2: NestJS Blockchain Module Setup

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Developer**,
I want a Blockchain module in NestJS using ethers.js,
so that the backend can interact with the smart contract.

## Acceptance Criteria

1. **Given** the module is configured with Sepolia RPC and contract ABI
   **When** blockchain methods are called
   **Then** transactions are signed with the backend wallet

2. **Given** a blockchain transaction fails
   **When** the transaction is processed
   **Then** it is retried up to 3 times (NFR4)

3. **Given** a transaction is processed
   **When** it completes (success or failure)
   **Then** transaction status is logged for debugging

4. **Given** the application starts
   **When** the module initializes
   **Then** the connection to the Sepolia provider is verified

## Tasks / Subtasks

- [x] Task 1: Module Structure & Configuration (AC: #1)
  - [x] 1.1 Create `backend/src/modules/blockchain/blockchain.module.ts` (export `BlockchainService`)
  - [x] 1.2 Create `backend/src/modules/blockchain/blockchain.service.ts`
  - [x] 1.3 Create `backend/src/modules/blockchain/blockchain.controller.ts` (skeleton)
  - [x] 1.4 Configure optional `ConfigService` injection for env vars
  - [x] 1.5 Register `BlockchainModule` in `app.module.ts`

- [x] Task 2: Provider & Wallet Setup (AC: #1, #4)
  - [x] 2.1 Implement `onModuleInit` in service to establish provider connection
  - [x] 2.2 Initialize `ethers.JsonRpcProvider` with `SEPOLIA_RPC_URL`
  - [x] 2.3 Initialize `ethers.Wallet` with `BACKEND_WALLET_PRIVATE_KEY` and provider
  - [x] 2.4 Verify connection on startup (e.g., `getNetwork()`) and log success/failure
  - [x] 2.5 Ensure ABI file `backend/src/modules/blockchain/contracts/BlokDeprem.abi.json` is loaded correctly

- [x] Task 3: Smart Contract Integration (AC: #1)
  - [x] 3.1 Initialize `ethers.Contract` instance with address from env and loaded ABI
  - [x] 3.2 Create type-safe wrapper methods for contract functions (`addPredictionHash`, `addShipmentLog`, etc.)
  - [x] 3.3 Create DTOs if necessary for typed inputs

- [x] Task 4: Resilience & Logging (AC: #2, #3)
  - [x] 4.1 Implement a generic retry mechanism (helper method or interceptor) for contract calls
  - [x] 4.2 Configure simple backoff strategy for retries (e.g., 1s, 2s, 4s)
  - [x] 4.3 Add comprehensive logging (debug payloads, info transaction hashes, error details)

- [x] Task 5: Unit Testing (AC: #1-4)
  - [x] 5.1 Create `blockchain.service.spec.ts`
  - [x] 5.2 Mock `ethers.JsonRpcProvider`, `ethers.Wallet`, and `ethers.Contract`
  - [x] 5.3 Test initialization flow
  - [x] 5.4 Test retry logic with mocked failures
  - [x] 5.5 Test error handling and logging

- [x] Review Follow-ups (Code Review)
  - [x] [AI-Review][High] Fix Graceful Degradation in `onModuleInit` (prevent crash on startup)
  - [x] [AI-Review][Medium] Complete logging for transaction mining status (success/failure)
  - [x] [AI-Review][Medium] Commit uncommitted Smart Contract file properly

## Dev Notes

### Architecture Patterns & Constraints

- **Library Version**: MUST use `ethers.js v6` (installed v6.16.0). Note that v6 uses `ethers.JsonRpcProvider` instead of `ethers.providers.JsonRpcProvider`.
- **Environment Variables**:
  - `SEPOLIA_RPC_URL`: Endpoint info.
  - `BLOCKCHAIN_CONTRACT_ADDRESS`: Address of deployed contract (from Story 3.1).
  - `BACKEND_WALLET_PRIVATE_KEY`: Private key for signing (CRITICAL: Never log this).
- **Module Pattern**: Follow standard NestJS module structure using `ConfigService` for secrets.
- **Async Pattern**: Transactions are async. The service should return the transaction receipt or hash, but ensure to wait for block confirmation (1 confirmation is usually enough for testnet) if immediate consistency is required, OR return the hash immediately and let background worker handle confirmation (Architectural choice: "Async transaction handling, don't block main thread"). Logic: Return hash immediately, or await `tx.wait(1)` depending on use case. For this story, setting up the basic interaction capability is key.
- **Retry Logic**: Can be implemented with a simple loop or a library like `axios-retry` logic adapted for ethers, or a custom `retry` decorator/wrapper.

### Previous Story Intelligence (Story 3.1)

- **Contract Address**: `0x894eB7812CAB6F2dDd80e742aEf2BeD592df4005` (Verify in .env)
- **ABI Location**: `backend/src/modules/blockchain/contracts/BlokDeprem.abi.json`
- **Backend Wallet**: The wallet has been generated and funded. Address: `0x028E43CBD8eed55d3882e6E41f1F39aF7184297A`.
- **Learnings**: Separation of concerns worked well. Keep blockchain logic isolated in this module.

### Project Structure Notes

- **Path**: `backend/src/modules/blockchain/`
- **Files**:
  - `blockchain.module.ts`
  - `blockchain.service.ts`
  - `blockchain.controller.ts`
  - `dto/` (if needed)

### References

- [Architecture: Blockchain Module](file:///Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/architecture.md#blockchain-module-structure)
- [Previous Story 3.1](file:///Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/sprint-artifacts/3-1-smart-contract-development-deployment.md)
- [ethers.js v6 Documentation](https://docs.ethers.org/v6/)

## Dev Agent Record

### Agent Model Used

Claude Antigravity (claude-3.5-sonnet)

### Debug Log References

- Startup Log: `[BlockchainService] Connected to blockchain network: sepolia (chainId: 11155111)`
- Unit Test Pass: `PASS src/modules/blockchain/blockchain.service.spec.ts`

### Completion Notes List

- Implemented `BlockchainModule` with `BlockchainService` and `BlockchainController`.
- Configured usage of `ethers.js` v6 with JsonRpcProvider and Wallet.
- Implemented `executeWithRetry` generic method to handle transaction retries (AC2).
- Updated `nest-cli.json` to copy ABI JSON assets to dist folder.
- Verified connection logs and unit tests pass.
- **Post-Review Fixes**: 
  - Added graceful degradation for blockchain connection failures (AC: Project Context).
  - Added background transaction monitoring for mining confirmation logs.
  - Committed helper smart contract updates.

### File List

- `backend/src/modules/blockchain/blockchain.module.ts`
- `backend/src/modules/blockchain/blockchain.service.ts`
- `backend/src/modules/blockchain/blockchain.controller.ts`
- `backend/src/modules/blockchain/blockchain.service.spec.ts`
- `backend/src/app.module.ts`
- `backend/nest-cli.json`
