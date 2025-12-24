# BlokDeprem Smart Contract Deployment Guide

This guide covers deploying the `BlokDepremTracker` smart contract to the Ethereum Sepolia testnet using Remix IDE.

## Prerequisites

- MetaMask browser extension installed
- MetaMask configured with Sepolia testnet
- Sepolia ETH for gas fees (from faucet)

## Contract Overview

The `BlokDepremTracker` contract provides:
- **Prediction Recording**: Store prediction hashes on-chain with region and timestamp
- **Shipment Tracking**: Record shipment status updates with location data
- **Access Control**: Only authorized backend address can write to the contract

### Contract Functions

| Function | Access | Description |
|----------|--------|-------------|
| `addPredictionHash(regionId, hash)` | Backend only | Records prediction hash, returns prediction ID |
| `getPredictionRecord(predictionId)` | Public | Retrieves prediction record by ID |
| `addShipmentLog(barcode, status, location)` | Backend only | Records shipment log entry |
| `getShipmentHistory(barcode)` | Public | Retrieves all logs for a shipment |
| `setBackendAddress(address)` | Owner only | Sets the authorized backend wallet |

### Events

- `PredictionRecorded(predictionId, hash, regionId, timestamp)`
- `ShipmentLogged(barcode, status, location, timestamp)`

---

## Step 1: Set Up Infura (RPC Provider)

1. Go to [Infura Registration](https://app.infura.io/register)
2. Create a free account
3. Create a new API Key (Web3 API)
4. Copy the Sepolia HTTPS endpoint URL:
   ```
   https://sepolia.infura.io/v3/YOUR_PROJECT_ID
   ```
5. Save this URL for `SEPOLIA_RPC_URL` in your backend `.env`

---

## Step 2: Get Sepolia Testnet ETH

MetaMask wallet needs Sepolia ETH for gas fees. Use these faucets:

- [Sepolia Faucet](https://sepoliafaucet.com) - Alchemy faucet
- [Chainlink Faucet](https://faucets.chain.link/sepolia) - Chainlink faucet

Request 0.1 SepoliaETH (should be enough for deployment and testing).

---

## Step 3: Configure MetaMask for Sepolia

1. Open MetaMask
2. Click on the network dropdown (top left)
3. Enable "Show test networks" in Settings > Advanced
4. Select **Sepolia test network**

**Sepolia Configuration:**
| Parameter | Value |
|-----------|-------|
| Network Name | Sepolia |
| Chain ID | 11155111 (0xaa36a7) |
| Currency Symbol | SepoliaETH |
| Block Explorer | https://sepolia.etherscan.io |

---

## Step 4: Deploy Using Remix IDE

### 4.1 Open Remix IDE

1. Go to [Remix IDE](https://remix.ethereum.org)
2. In the File Explorer, create a new file: `BlokDepremTracker.sol`
3. Copy the entire contract code from `blockchain/BlokDepremTracker.sol`

### 4.2 Compile the Contract

1. Go to **Solidity Compiler** tab (left sidebar)
2. Select compiler version: `0.8.0` or higher
3. Click **Compile BlokDepremTracker.sol**
4. Ensure no errors (warnings are okay)

### 4.3 Deploy to Sepolia

1. Go to **Deploy & Run Transactions** tab
2. Under **Environment**, select **Injected Provider - MetaMask**
3. MetaMask will prompt to connect - approve the connection
4. Verify the network shows **Sepolia (11155111)**
5. Select `BlokDepremTracker` contract
6. Click **Deploy**
7. Confirm the transaction in MetaMask

### 4.4 Record Deployment Info

After deployment:
1. Copy the **Contract Address** from Remix (Deployed Contracts section)
2. Save this address - you'll need it for `BLOCKCHAIN_CONTRACT_ADDRESS`

---

## Step 5: Generate Backend Wallet

Create a dedicated wallet for the backend to sign transactions:

```bash
cd backend && node -e "const {Wallet}=require('ethers'); const w=Wallet.createRandom(); console.log('Address:', w.address); console.log('Private Key:', w.privateKey)"
```

**Output:**
```
Address: 0x...  ← Use this for setBackendAddress()
Private Key: 0x...  ← Use this for BACKEND_WALLET_PRIVATE_KEY (NEVER COMMIT!)
```

**Fund the wallet:**
1. Copy the generated address
2. Use the faucets from Step 2 to send 0.05 SepoliaETH to this address

---

## Step 6: Configure Backend Address

In Remix, under **Deployed Contracts**:

1. Expand the deployed contract
2. Find `setBackendAddress` function
3. Enter the backend wallet address (from Step 5)
4. Click **transact**
5. Confirm in MetaMask

This authorizes the backend wallet to call `addPredictionHash` and `addShipmentLog`.

---

## Step 7: Export ABI

After successful compilation:

1. Go to **Solidity Compiler** tab
2. Click **ABI** button (under contract name)
3. This copies the ABI to clipboard
4. Replace the contents of `backend/src/modules/blockchain/contracts/BlokDeprem.abi.json`

---

## Step 8: Update Backend Environment

Add to `backend/.env`:

```bash
# Blockchain Configuration
BLOCKCHAIN_CONTRACT_ADDRESS=0x...  # From Step 4.4
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID  # From Step 1
BACKEND_WALLET_PRIVATE_KEY=0x...  # From Step 5 (NEVER COMMIT!)
ETHERSCAN_BASE_URL=https://sepolia.etherscan.io
```

---

## Step 9: Verify Contract on Etherscan (Optional)

1. Go to [Sepolia Etherscan](https://sepolia.etherscan.io)
2. Search for your contract address
3. Click **Contract** tab → **Verify and Publish**
4. Select:
   - Compiler Type: Solidity (Single file)
   - Compiler Version: v0.8.x (match Remix)
   - Open Source License: MIT
5. Paste contract source code
6. Click **Verify and Publish**

---

## Testing in Remix

Before Sepolia deployment, test in Remix JavaScript VM:

### Test addPredictionHash
```
_regionId: "tr-istanbul-01"
_hash: 0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
```
Expected: Returns prediction ID (1, 2, 3...)

### Test getPredictionRecord
```
_predictionId: 1
```
Expected: Returns (hash, regionId, timestamp)

### Test addShipmentLog
```
_barcode: "SHIP-001"
_status: "in_transit"
_location: "Istanbul Warehouse"
```
Expected: Transaction succeeds, event emitted

### Test getShipmentHistory
```
_barcode: "SHIP-001"
```
Expected: Returns array of Log structs

---

## Security Checklist

- [ ] Backend wallet is separate from MetaMask (deployer) wallet
- [ ] Private key is in `.env` file only (never committed)
- [ ] `.gitignore` includes `.env`
- [ ] `setBackendAddress()` called with correct backend wallet
- [ ] Owner wallet (MetaMask) is stored securely

---

## Troubleshooting

### "Only backend can call this function"
The calling address doesn't match `backendAddress`. Verify:
1. `setBackendAddress()` was called with correct address
2. Backend is using the correct private key

### "Insufficient funds"
The wallet doesn't have enough SepoliaETH for gas. Get more from faucets.

### Transaction stuck pending
Try these in order:
1. Wait 2-3 minutes (Sepolia can be slow)
2. Increase gas price in MetaMask
3. Speed up or cancel transaction in MetaMask

---

## Resources

- [Remix IDE](https://remix.ethereum.org)
- [Sepolia Etherscan](https://sepolia.etherscan.io)
- [Infura Dashboard](https://app.infura.io)
- [ethers.js v6 Documentation](https://docs.ethers.org/v6/)
- [Solidity Documentation](https://docs.soliditylang.org/)
