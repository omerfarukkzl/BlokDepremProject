wwww# Story 3.3: Record Prediction Hash On-Chain

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As the **System**,
I want to **record prediction hashes on the blockchain**,
so that **AI predictions are immutably traceable**.

## Acceptance Criteria

1. **Given** a prediction hash is generated
   **When** the recording is triggered
   **Then** `addPredictionHash()` is called on the smart contract
2. **And** the transaction hash is stored in the `Prediction` entity
3. **And** recording failures don't block the prediction flow (NFR10)

## Tasks / Subtasks

- [x] Update `Prediction` entity to support transaction hash storage <!-- id: 0 -->
    - [x] Add `blockchain_tx_hash` column to `Prediction` entity (nullable)
- [x] Implement `recordPredictionHash` in `BlockchainService` <!-- id: 1 -->
    - [x] Create method to call `addPredictionHash(regionId, hash)` on smart contract
    - [x] Handle transaction submission and retrieval of transaction hash
    - [x] Implement error handling (log errors, do not throw to caller)
- [x] Integrate recording into Prediction creation flow <!-- id: 2 -->
    - [x] Call `recordPredictionHash` asynchronously after prediction persistence
    - [x] Update `Prediction` record with returned `blockchain_tx_hash`
- [x] Verify non-blocking behavior <!-- id: 3 -->
    - [x] Test that prediction success response is returned even if blockchain call fails (simulate failure)

## Dev Notes

- **Architecture Patterns:**
    - **Async Execution:** The requirement "failures don't block prediction flow" suggests treating the blockchain interaction as a side effect. This can be achieved by:
        - Calling the blockchain service method asynchronously without `await` block the main response (fire and forget, but handle errors within the async promise).
        - OR using NestJS Event Emitter (`EventEmitter2`): Dispatch `prediction.created` event, handle in a listener. **Recommendation:** Since no event bus is explicitly mentioned in architecture, a simple async call in the service (wrapped in `try/catch` or `.catch()`) or `void` method execution is sufficient, but ensure exceptions are caught so they don't crash the app.
    - **Entity Update:** The prediction is already saved before the blockchain call. You will need to update the existing record with the `transactionHash` once the transaction is sent (or confirmed, depending on requirements - usually "sent" gives a hash immediately).
    - **Smart Contract:** Ensure `addPredictionHash` exists on the deployed contract ABI.

- **Source Tree Components:**
    - `backend/src/modules/predictions/entities/prediction.entity.ts`
    - `backend/src/modules/blockchain/blockchain.service.ts`
    - `backend/src/modules/predictions/predictions.service.ts` (or wherever prediction is created)

- **Testing Standards:**
    - **Unit Tests:** Mock `BlockchainService` in `PredictionsService` tests. Verify it is called.
    - **Integration Tests:** Test the flow. Since blockchain is external, use a mock or the local hardhat/anvil if available, otherwise mock the contract call. `BlockchainService` should have its own tests mocking the provider/contract.

### Project Structure Notes

- **Keep blockchain logic encapsulated in `BlockchainModule`.**
- `PredictionsModule` should import `BlockchainModule`.

### References

- [Epics: Story 3.3](file:///Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/epics.md)
- [Architecture: Blockchain Integration](file:///Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/architecture.md)

## Dev Agent Record

### Agent Model Used

Antigravity (simulated)

### Debug Log References

- None

### Completion Notes List

- Ensure `ethers.js` is correctly configured in `BlockchainModule`.
- Check if `addPredictionHash` takes purely the hash string or other params. (Based on Story 3.1, it's `addPredictionHash(string)`).

### Senior Developer Review (AI)

- **Outcome:** Changes Requested (Auto-fixed)
- **Date:** 2025-12-24
- **Action Items:**
    - [x] Untracked files added to git
    - [x] Security risk in .env.example fixed (placeholder key)
    - [x] Naming discrepancy fixed in story (transactionHash -> blockchain_tx_hash)
    - [x] Production code cleaned (removed test-only logic)
    - [x] Story file list updated

### File List

- `backend/src/entities/prediction.entity.ts`
- `backend/src/modules/predictions/predictions.service.ts`
- `backend/src/modules/blockchain/blockchain.module.ts`
- `backend/src/modules/blockchain/blockchain.service.ts`
- `backend/src/modules/blockchain/blockchain.controller.ts`
- `backend/src/modules/blockchain/contracts/BlokDeprem.abi.json`
