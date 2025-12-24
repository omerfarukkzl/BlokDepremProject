# Story 3.1: Smart Contract Development & Deployment

Status: complete

## Story

As a **Developer**,
I want a Solidity smart contract deployed to Sepolia testnet,
so that predictions and shipments can be recorded on-chain.

## Acceptance Criteria

1. **Given** the smart contract is deployed via Remix IDE
   **When** `addPredictionHash()` is called with regionId, hash, and timestamp
   **Then** the prediction hash is stored immutably on Ethereum

2. **Given** the smart contract is deployed via Remix IDE
   **When** `addShipmentLog()` is called
   **Then** shipment status data is stored immutably on Ethereum

3. **Given** the smart contract is deployed
   **When** `getShipmentHistory()` is called with a barcode
   **Then** all on-chain logs for that shipment are returned

4. **Given** the smart contract is deployed
   **When** `getPredictionRecord()` is called with a prediction ID
   **Then** the stored prediction hash and metadata are returned

5. **Given** the smart contract is deployed
   **Then** the contract address is configured in backend environment

## Tasks / Subtasks

- [x] Task 1: Extend Existing Smart Contract (AC: #1, #2, #4)
  - [x] 1.1 Add `PredictionRecord` struct with `bytes32 hash`, `string regionId`, `uint256 timestamp`
  - [x] 1.2 Add `mapping(uint256 => PredictionRecord) public predictionRecords`
  - [x] 1.3 Add `uint256 public predictionCount` counter
  - [x] 1.4 Implement `addPredictionHash(string memory _regionId, bytes32 _hash)` → returns `uint256`
  - [x] 1.5 Implement `getPredictionRecord(uint256 _predictionId)` view function
  - [x] 1.6 Add event `PredictionRecorded(uint256 indexed predictionId, bytes32 hash, string regionId, uint256 timestamp)`
  - [x] 1.7 Add event `ShipmentLogged(string indexed barcode, string status, string location, uint256 timestamp)`
  - [x] 1.8 Update existing `addShipmentLog()` to emit `ShipmentLogged` event
  - [x] 1.9 Verify existing `getShipmentHistory()` functions work correctly

- [x] Task 2: Smart Contract Testing in Remix (AC: #1, #2, #3, #4)
  - [x] 2.1 Deploy contract to Remix JavaScript VM for testing
  - [x] 2.2 Test `addPredictionHash()` with sample bytes32 hash and region ID
  - [x] 2.3 Verify returned prediction ID matches `predictionCount`
  - [x] 2.4 Test `getPredictionRecord()` returns correct data
  - [x] 2.5 Test `addShipmentLog()` with sample barcode, status, location
  - [x] 2.6 Test `getShipmentHistory()` returns all logs for barcode
  - [x] 2.7 Verify events are emitted correctly (check Remix console)
  - [x] 2.8 Test `onlyBackend` modifier restricts access properly

- [x] Task 3: Deploy to Sepolia Testnet (AC: #1, #2, #5)
  - [x] 3.1 Create Infura account at https://app.infura.io/register (free tier)
  - [x] 3.2 Copy Sepolia RPC URL from Infura dashboard
  - [x] 3.3 Get Sepolia ETH from faucet (https://sepoliafaucet.com or https://faucets.chain.link/sepolia)
  - [x] 3.4 Configure Remix to use Injected Provider (MetaMask)
  - [x] 3.5 Select Sepolia network in MetaMask (Chain ID: 11155111)
  - [x] 3.6 Deploy contract to Sepolia
  - [x] 3.7 Record deployed contract address
  - [x] 3.8 Call `setBackendAddress()` with backend wallet address
  - [x] 3.9 Verify contract on Etherscan Sepolia (optional but recommended)

- [x] Task 4: Generate Backend Wallet (AC: #5)
  - [x] 4.1 Generate dedicated backend wallet (NOT your MetaMask wallet):
        ```bash
        cd backend && node -e "const {Wallet}=require('ethers'); const w=Wallet.createRandom(); console.log('Address:', w.address); console.log('Private Key:', w.privateKey)"
        ```
  - [x] 4.2 Fund backend wallet with Sepolia ETH from faucet
  - [x] 4.3 Use backend wallet address when calling `setBackendAddress()` on contract

- [x] Task 5: Backend Environment Configuration (AC: #5)
  - [x] 5.1 Add `BLOCKCHAIN_CONTRACT_ADDRESS` to `backend/.env`
  - [x] 5.2 Add `SEPOLIA_RPC_URL` to `backend/.env` (from Infura dashboard)
  - [x] 5.3 Add `BACKEND_WALLET_PRIVATE_KEY` to `backend/.env` (from Task 4)
  - [x] 5.4 Add `ETHERSCAN_BASE_URL=https://sepolia.etherscan.io` to `backend/.env`
  - [x] 5.5 Verify `backend/.gitignore` contains `.env` (CRITICAL: never commit private key!)
  - [x] 5.6 Update `backend/.env.example` with placeholder values (no secrets)
  - [x] 5.7 Export contract ABI JSON to `backend/src/modules/blockchain/contracts/BlokDeprem.abi.json`

- [x] Task 6: Create Deployment Documentation
  - [x] 6.1 Create `blockchain/README.md` with deployment guide
  - [x] 6.2 Document Remix IDE deployment steps
  - [x] 6.3 Document contract verification steps
  - [x] 6.4 Document environment variable requirements

## Dev Notes

### Existing Contract Analysis

**Current State:** A smart contract `blockchain/BlokDepremTracker.sol` already exists with:
- ✅ `addShipmentLog(barcode, status, location)` function
- ✅ `getShipmentHistory(barcode)` function
- ✅ `Log` struct for shipment logs
- ✅ `onlyBackend` modifier for access control
- ✅ `setBackendAddress()` for configuration
- ❌ **MISSING**: Prediction hash storage (addPredictionHash, getPredictionRecord)
- ❌ **MISSING**: Events for transaction tracking

### Required Contract Extensions (Per PRD Specification)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BlokDepremTracker {
    address public owner;
    address public backendAddress;

    // Existing shipment logs
    struct Log {
        string status;
        uint256 timestamp;
        string location;
    }
    mapping(string => Log[]) public shipmentHistory;

    // NEW: Prediction records (per PRD spec)
    struct PredictionRecord {
        bytes32 hash;        // Gas-efficient: bytes32 vs string saves ~50% gas
        string regionId;
        uint256 timestamp;
    }
    mapping(uint256 => PredictionRecord) public predictionRecords;
    uint256 public predictionCount;

    // Events for Story 3.2 blockchain listeners
    event PredictionRecorded(
        uint256 indexed predictionId, 
        bytes32 hash, 
        string regionId, 
        uint256 timestamp
    );
    event ShipmentLogged(
        string indexed barcode, 
        string status, 
        string location, 
        uint256 timestamp
    );

    modifier onlyBackend() {
        require(msg.sender == backendAddress, "Only backend can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setBackendAddress(address _backendAddress) public {
        require(msg.sender == owner, "Only owner can set the backend address");
        backendAddress = _backendAddress;
    }

    // NEW: Record prediction hash on-chain (returns ID for backend storage)
    function addPredictionHash(
        string memory _regionId, 
        bytes32 _hash
    ) public onlyBackend returns (uint256) {
        predictionCount++;
        predictionRecords[predictionCount] = PredictionRecord({
            hash: _hash,
            regionId: _regionId,
            timestamp: block.timestamp
        });
        emit PredictionRecorded(predictionCount, _hash, _regionId, block.timestamp);
        return predictionCount;  // Store this in Prediction.blockchain_prediction_id
    }

    // NEW: Retrieve prediction record
    function getPredictionRecord(uint256 _predictionId) 
        public view returns (PredictionRecord memory) 
    {
        require(_predictionId > 0 && _predictionId <= predictionCount, "Invalid prediction ID");
        return predictionRecords[_predictionId];
    }

    // MODIFIED: Add event emission
    function addShipmentLog(
        string memory _barcode, 
        string memory _status, 
        string memory _location
    ) public onlyBackend {
        shipmentHistory[_barcode].push(Log({
            status: _status, 
            timestamp: block.timestamp, 
            location: _location
        }));
        emit ShipmentLogged(_barcode, _status, _location, block.timestamp);
    }

    function getShipmentHistory(string memory _barcode) 
        public view returns (Log[] memory) 
    {
        return shipmentHistory[_barcode];
    }
}
```

### Architecture Compliance

| Aspect | Requirement |
|--------|-------------|
| Blockchain | Ethereum Sepolia testnet |
| Smart Contract | Solidity ^0.8.0 |
| Deployment Tool | Remix IDE (browser-based) |
| Backend Library | **ethers.js 6.16.0** (already installed) |
| Transaction Time | < 30 seconds (NFR2) |
| Retry Strategy | 3x retry on failure (NFR4, handled in Story 3.2) |
| Source Location | `blockchain/BlokDepremTracker.sol` |

### Sepolia Testnet Configuration

| Parameter | Value |
|-----------|-------|
| Network Name | Sepolia |
| Chain ID | **11155111** (hex: 0xaa36a7) |
| Currency | SepoliaETH |
| RPC URL | Get from Infura: https://app.infura.io/register |
| Block Explorer | https://sepolia.etherscan.io |
| Faucets | https://sepoliafaucet.com, https://faucets.chain.link/sepolia |

> **Note:** Frontend `walletService.ts:134-145` already has Sepolia config. Reuse these constants.

### Environment Variables

```bash
# backend/.env (add these lines)

# Blockchain Configuration
BLOCKCHAIN_CONTRACT_ADDRESS=0x...  # From Remix deployment
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
BACKEND_WALLET_PRIVATE_KEY=0x...   # From Task 4 - NEVER COMMIT!
ETHERSCAN_BASE_URL=https://sepolia.etherscan.io
```

### Backend Wallet vs MetaMask Wallet

| Wallet | Purpose |
|--------|---------|
| **MetaMask (Owner)** | Deploys contract, calls `setBackendAddress()` |
| **Backend Wallet** | Signs transactions from NestJS, funded with Sepolia ETH |

Generate backend wallet:
```bash
cd backend && node -e "const {Wallet}=require('ethers'); const w=Wallet.createRandom(); console.log('Address:', w.address); console.log('Private Key:', w.privateKey)"
```

### Hash Conversion (Backend → Contract)

The Prediction entity stores SHA-256 as 64-char hex string. Convert to `bytes32`:

```typescript
// In BlockchainService (Story 3.2)
import { ethers } from 'ethers';

// prediction.prediction_hash = "a1b2c3...64chars"
const bytes32Hash = ethers.hexlify(
  ethers.toBeArray('0x' + prediction.prediction_hash)
);
// Result: 0xa1b2c3...
```

### ABI Export for Story 3.2

After deploying in Remix:
1. Go to "Solidity Compiler" tab
2. Click "ABI" button under contract name
3. Save to `backend/src/modules/blockchain/contracts/BlokDeprem.abi.json`

**Critical Event Signatures for ethers.js v6:**
```typescript
// BlockchainService will use these
contract.on('PredictionRecorded', (predictionId, hash, regionId, timestamp) => {
  // Handle event
});

contract.on('ShipmentLogged', (barcode, status, location, timestamp) => {
  // Handle event
});
```

### On-Chain ID Mapping Strategy

| Database | Blockchain | Storage |
|----------|-----------|---------|
| `prediction.id` | `predictionCount` return value | Store blockchain ID in new `blockchain_prediction_id` column OR use `blockchain_tx_hash` lookup |

For Story 3.3, the `addPredictionHash()` return value should be stored for later verification via `getPredictionRecord()`.

### Previous Story Intelligence

**From Story 2.6 (Prediction Entity & Hash Generation):**
- `prediction_hash`: SHA-256 hex string (64 chars)
- `blockchain_tx_hash`: nullable, stores Ethereum tx hash
- Convert hex string to `bytes32` when calling contract

### Project Structure

**Existing:**
- `blockchain/BlokDepremTracker.sol` — Extend with prediction functions
- `frontend/src/services/walletService.ts` — Has Sepolia config (reuse constants)
- `backend/package.json` — ethers.js 6.16.0 already installed

**Create:**
- `blockchain/README.md` — Deployment documentation
- `backend/src/modules/blockchain/contracts/BlokDeprem.abi.json` — Contract ABI
- `backend/src/modules/blockchain/contracts/` — Directory for ABI

**Modify:**
- `blockchain/BlokDepremTracker.sol` — Add prediction functions + events
- `backend/.env` — Add blockchain configuration
- `backend/.env.example` — Add placeholder values

### Dependencies from This Story

| Story | Requires |
|-------|----------|
| Story 3.2 | Contract address, ABI, ethers.js v6 patterns |
| Story 3.3 | `addPredictionHash()` function, bytes32 conversion |
| Story 3.4 | `addShipmentLog()` function, ShipmentLogged event |
| Story 3.5 | `ETHERSCAN_BASE_URL` for verification links |
| Story 3.6 | `getShipmentHistory()` function |

### Security Considerations

1. **Private Key**: NEVER commit `BACKEND_WALLET_PRIVATE_KEY` to git
2. **Backend Modifier**: Contract uses `onlyBackend` to restrict write access
3. **Owner Control**: Only owner can call `setBackendAddress()`
4. **Separate Wallets**: Use dedicated backend wallet, not personal MetaMask

### Verification Checklist

- [ ] Contract compiles without errors in Remix
- [ ] All functions work in Remix JavaScript VM
- [ ] Events emit correctly (visible in Remix logs)
- [ ] Contract deployed to Sepolia successfully
- [ ] Backend wallet generated and funded
- [ ] `setBackendAddress()` called with backend wallet address
- [ ] Contract address added to backend `.env`
- [ ] ABI exported to correct location
- [ ] `.gitignore` contains `.env` (verify!)
- [ ] Etherscan verification completed (optional)

### References

- [Existing Smart Contract](file:///Users/omerfarukkizil/development/BlokDepremProject/blockchain/BlokDepremTracker.sol)
- [Prediction Entity](file:///Users/omerfarukkizil/development/BlokDepremProject/backend/src/entities/prediction.entity.ts)
- [Frontend Sepolia Config](file:///Users/omerfarukkizil/development/BlokDepremProject/frontend/src/services/walletService.ts#L134-L145)
- [Architecture - Blockchain Section](file:///Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/architecture.md#new-component-smart-contract)
- [ethers.js v6 Docs](https://docs.ethers.org/v6/)
- [Remix IDE](https://remix.ethereum.org)
- [Sepolia Etherscan](https://sepolia.etherscan.io)
- [Infura Registration](https://app.infura.io/register)

## Dev Agent Record

### Agent Model Used

Claude Antigravity (claude-3.5-sonnet)

### Debug Log References

N/A - No errors encountered during smart contract development.

### Completion Notes List

**2025-12-24 - Task 1 Complete:**
- Extended `BlokDepremTracker.sol` with `PredictionRecord` struct, `addPredictionHash()`, `getPredictionRecord()` functions
- Added `predictionCount` counter for tracking prediction IDs
- Added `PredictionRecorded` and `ShipmentLogged` events for blockchain transaction tracking
- Updated `addShipmentLog()` to emit `ShipmentLogged` event
- Contract is ready for Remix IDE deployment

**2025-12-24 - Task 5 Partial:**
- Verified `.gitignore` contains `.env` - confirmed
- Updated `backend/.env.example` with blockchain configuration placeholders
- Created `backend/src/modules/blockchain/contracts/BlokDeprem.abi.json` with contract ABI
- Remaining subtasks (5.1-5.4) require user to deploy contract and generate wallet

**2025-12-24 - Task 2, 3, 4, 5 Complete:**
- Verified manual deployment steps with user
- Deployed contract to Sepolia: `0x894eB7812CAB6F2dDd80e742aEf2BeD592df4005`
- Generated backend wallet: `0x028E43CBD8eed55d3882e6E41f1F39aF7184297A`
- Configured backend access control via `setBackendAddress`
- Provided environment variables for `backend/.env` configuration
- Verified Sourcify/Blockscout verification success

### File List

**New Files:**
- `blockchain/README.md` - Comprehensive smart contract deployment guide
- `backend/src/modules/blockchain/contracts/BlokDeprem.abi.json` - Contract ABI for ethers.js integration

**Modified Files:**
- `blockchain/BlokDepremTracker.sol` - Extended with prediction functions, events
- `backend/.env.example` - Added blockchain configuration placeholders

