---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories", "step-04-final-validation"]
status: complete
completedAt: "2025-12-22"
totalEpics: 6
totalStories: 32
inputDocuments:
  - /Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/prd.md
  - /Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/architecture.md
---

# BlokDepremProject - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for BlokDepremProject, decomposing the requirements from the PRD and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Authentication & Identity (FR1-FR5)**
- FR1: Officials can authenticate using their wallet address (MetaMask)
- FR2: Officials can register new wallet addresses to the system
- FR3: System can verify wallet ownership via signature challenge
- FR4: Donors can access public pages without authentication
- FR5: Admins can authenticate with elevated permissions

**AI Prediction Service (FR6-FR10)**
- FR6: Officials can request AI predictions for a selected region
- FR7: System can return predicted quantities for tents, containers, food packages, and blankets
- FR8: Officials can view confidence scores for predictions
- FR9: Officials can adjust predicted quantities before creating shipment
- FR10: System can generate a cryptographic hash of each prediction

**Blockchain Integration (FR11-FR15)**
- FR11: System can record prediction hashes on Ethereum blockchain
- FR12: System can record shipment status changes on blockchain
- FR13: Users can view blockchain verification links for any status update
- FR14: System can retrieve shipment history from blockchain
- FR15: System can store blockchain transaction hashes in database

**Shipment Management (FR16-FR20)**
- FR16: Officials can create shipments with predicted/adjusted quantities
- FR17: System can generate unique barcodes for each shipment
- FR18: Officials can update shipment status (created, departed, arrived, delivered)
- FR19: Officials can confirm delivery with actual quantities received
- FR20: System can calculate accuracy percentage (predicted vs. actual)

**Public Tracking (FR21-FR24)**
- FR21: Donors can search for shipments by barcode number
- FR22: Donors can view shipment timeline with all status updates
- FR23: Donors can access blockchain verification for each status
- FR24: Donors can view the origin and destination of shipments

**Reporting & Analytics (FR25-FR29)**
- FR25: Admins can view prediction accuracy reports
- FR26: Admins can filter reports by date range, region, and aid category
- FR27: Admins can export prediction vs. actual data
- FR28: Admins can view aggregate accuracy metrics (average, best, worst)
- FR29: Admins can access blockchain audit trail for compliance reporting

### Non-Functional Requirements

**Integration**
- NFR1: AI service responds to prediction requests within 10 seconds
- NFR2: Blockchain transactions complete within 30 seconds (Sepolia testnet)
- NFR3: AI service gracefully handles unavailability with error messages
- NFR4: System retries failed blockchain transactions up to 3 times

**Security**
- NFR5: Wallet authentication uses signature verification (no password storage)
- NFR6: JWT tokens expire after 24 hours
- NFR7: Admin endpoints require elevated role permissions
- NFR8: Database credentials not exposed in frontend code

**Reliability**
- NFR9: All data persists in PostgreSQL before blockchain confirmation
- NFR10: Failed blockchain transactions do not block core functionality
- NFR11: API errors return meaningful error messages

### Additional Requirements (from Architecture)

**Data Architecture**
- New Prediction entity with TypeORM JSONB columns for quantities
- Database-first design: PostgreSQL is source of truth, blockchain is verification layer

**Infrastructure**
- Docker Compose orchestration for all services (NestJS:3000, React:5173, FastAPI:5000, PostgreSQL:5432)
- FastAPI selected for AI service (async Python, OpenAPI docs, uvicorn)
- Remix IDE for smart contract deployment to Sepolia testnet

**Integration Patterns**
- Dedicated AI Module in NestJS (`modules/ai/`) with HttpModule for FastAPI calls
- Dedicated Blockchain Module in NestJS (`modules/blockchain/`) with ethers.js
- WalletAuthGuard for signature verification using ethers.js `verifyMessage`
- Graceful degradation pattern: AI/blockchain failures don't block core functionality

**Code Patterns (AI Agent Consistency)**
- Follow existing naming: snake_case for DB tables, camelCase for entity fields
- Standard API response wrapper format with success/error structure
- Zustand slice pattern for new frontend state (predictionStore)
- Error handling: 503 for AI unavailable, 202 Accepted for pending blockchain tx

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | Wallet authentication via MetaMask |
| FR2 | Epic 1 | Wallet registration |
| FR3 | Epic 1 | Signature verification challenge |
| FR4 | Epic 1 | Public access without auth |
| FR5 | Epic 1 | Admin elevated permissions |
| FR6 | Epic 2 | AI predictions for regions |
| FR7 | Epic 2 | Predicted quantities for 4 aid types |
| FR8 | Epic 2 | Confidence score display |
| FR9 | Epic 2 | Quantity adjustment UI |
| FR10 | Epic 2 | Prediction hash generation |
| FR11 | Epic 3 | Record prediction hashes on-chain |
| FR12 | Epic 3 | Record shipment status on-chain |
| FR13 | Epic 3 | Blockchain verification links |
| FR14 | Epic 3 | Retrieve history from blockchain |
| FR15 | Epic 3 | Store tx hashes in database |
| FR16 | Epic 4 | Create shipments from predictions |
| FR17 | Epic 4 | Barcode generation |
| FR18 | Epic 4 | Status updates workflow |
| FR19 | Epic 4 | Delivery confirmation with actuals |
| FR20 | Epic 4 | Accuracy calculation |
| FR21 | Epic 5 | Barcode search |
| FR22 | Epic 5 | Shipment timeline display |
| FR23 | Epic 5 | Blockchain verification access |
| FR24 | Epic 5 | Origin/destination display |
| FR25 | Epic 6 | Prediction accuracy reports |
| FR26 | Epic 6 | Report filtering |
| FR27 | Epic 6 | Data export |
| FR28 | Epic 6 | Aggregate accuracy metrics |
| FR29 | Epic 6 | Blockchain audit trail export |

## Epic List

### Epic 1: Wallet Authentication & Identity

Officials can register and authenticate using MetaMask wallet signatures. Donors access public pages without authentication. Admins have elevated permissions.

**FRs covered:** FR1, FR2, FR3, FR4, FR5
**NFRs addressed:** NFR5, NFR6, NFR7

---

### Epic 2: AI Prediction Service

Officials can request AI-powered aid predictions for any region, view confidence scores, adjust quantities, and generate prediction hashes for blockchain recording.

**FRs covered:** FR6, FR7, FR8, FR9, FR10
**NFRs addressed:** NFR1, NFR3

---

### Epic 3: Blockchain Recording & Verification

System records predictions and shipment status changes on Ethereum blockchain. Users can verify any status update via Etherscan links. Transaction hashes are stored in the database.

**FRs covered:** FR11, FR12, FR13, FR14, FR15
**NFRs addressed:** NFR2, NFR4, NFR9, NFR10

---

### Epic 4: Shipment Creation & Delivery Workflow

Officials create shipments from predictions, generate barcodes, update shipment status through the workflow, confirm deliveries with actual quantities, and view accuracy calculations.

**FRs covered:** FR16, FR17, FR18, FR19, FR20
**NFRs addressed:** NFR11

---

### Epic 5: Public Donation Tracking

Donors (unauthenticated) can search by barcode and view complete shipment timelines with blockchain verification links and origin/destination information.

**FRs covered:** FR21, FR22, FR23, FR24

---

### Epic 6: Admin Reports & Analytics

Admins can view prediction accuracy reports, filter by date/region/category, export data, view aggregate metrics, and access blockchain audit trails for compliance.

**FRs covered:** FR25, FR26, FR27, FR28, FR29
**NFRs addressed:** NFR7

---

## Epic 1: Wallet Authentication & Identity

Officials can register and authenticate using MetaMask wallet signatures. Donors access public pages without authentication. Admins have elevated permissions.

### Story 1.1: MetaMask Wallet Connection

As an **Official**,
I want to connect my MetaMask wallet to the application,
So that I can authenticate without a traditional password.

**Acceptance Criteria:**

**Given** I am on the login page
**When** I click "Connect Wallet"
**Then** MetaMask prompts me to connect
**And** my wallet address is displayed on successful connection
**And** an error message is shown if MetaMask is not installed or connection is rejected

---

### Story 1.2: Wallet Signature Challenge & JWT Issuance

As an **Official**,
I want to sign a challenge message with my wallet,
So that the system can verify I own the wallet address and issue me a JWT.

**Acceptance Criteria:**

**Given** my wallet is connected
**When** I sign the server-generated nonce/challenge message
**Then** the backend verifies the signature using ethers.js `verifyMessage`
**And** a JWT token is returned valid for 24 hours
**And** the JWT contains my wallet address and role claims

---

### Story 1.3: Wallet Registration for New Officials

As an **unregistered Official**,
I want to register my wallet address in the system,
So that I can be recognized as an authorized Official.

**Acceptance Criteria:**

**Given** I am a new user with a connected wallet
**When** I submit my registration with wallet address
**Then** my wallet is stored in the Officials table
**And** I receive a success message and can proceed to authenticate
**And** duplicate wallet addresses are rejected with an error

---

### Story 1.4: Public Page Access Without Authentication

As a **Donor**,
I want to access the public tracking page without logging in,
So that I can search for shipment status using my barcode.

**Acceptance Criteria:**

**Given** I am an unauthenticated user
**When** I navigate to the `/track` page
**Then** I can access it without being redirected to login
**And** I can enter a barcode to search

---

### Story 1.5: Admin Role-Based Access Control

As an **Admin**,
I want elevated permissions for protected admin endpoints,
So that only authorized administrators can access reports and analytics.

**Acceptance Criteria:**

**Given** I am logged in with admin role
**When** I access admin endpoints (e.g., `/predictions/reports/*`)
**Then** I am granted access
**And** non-admin users receive 403 Forbidden response
**And** unauthenticated users receive 401 Unauthorized response

---

## Epic 2: AI Prediction Service

Officials can request AI-powered aid predictions for any region, view confidence scores, adjust quantities, and generate prediction hashes for blockchain recording.

### Story 2.1: FastAPI Prediction Service Setup

As a **Developer**,
I want a FastAPI service exposing the 4 trained Random Forest models,
So that the NestJS backend can request predictions via HTTP.

**Acceptance Criteria:**

**Given** the AI service is running on port 5000
**When** POST `/predict` is called with region data (population, damage_level, coastal)
**Then** predictions for tent, container, food_package, and blanket are returned
**And** the response includes a confidence score
**And** a health endpoint `/health` returns 200 OK

---

### Story 2.2: NestJS AI Module Integration

As an **Official**,
I want the backend to integrate with the AI service,
So that predictions can be requested through the main API.

**Acceptance Criteria:**

**Given** I am authenticated
**When** I call POST `/ai/predict` with regionId
**Then** the backend calls the FastAPI service and returns predictions
**And** graceful fallback is returned if AI service is unavailable (503 with message)
**And** requests timeout after 10 seconds (NFR1)

---

### Story 2.3: Region Selection & Prediction UI

As an **Official**,
I want to select a region and request predictions,
So that I can see recommended aid quantities for that area.

**Acceptance Criteria:**

**Given** I am on the predictions page
**When** I select a region and click "Generate Prediction"
**Then** predicted quantities for 4 aid types are displayed
**And** a loading state is shown during the request
**And** error messages are displayed if the request fails

---

### Story 2.4: Prediction Confidence Score Display

As an **Official**,
I want to see the confidence score for each prediction,
So that I know how reliable the AI recommendation is.

**Acceptance Criteria:**

**Given** a prediction has been generated
**When** I view the prediction results
**Then** a confidence percentage is displayed (e.g., 82%)
**And** the confidence is visually indicated (color coding for high/medium/low)

---

### Story 2.5: Prediction Quantity Adjustment

As an **Official**,
I want to adjust the predicted quantities before creating a shipment,
So that I can apply my local knowledge.

**Acceptance Criteria:**

**Given** prediction results are displayed
**When** I modify the quantity values in the input fields
**Then** the adjusted values are stored for shipment creation
**And** both original prediction and adjusted values are tracked
**And** I can reset to original predictions

---

### Story 2.6: Prediction Entity & Hash Generation

As the **System**,
I want to generate a cryptographic hash of each prediction,
So that it can be recorded immutably on the blockchain.

**Acceptance Criteria:**

**Given** a prediction is requested
**When** the prediction is saved to the database
**Then** a Prediction entity is created with JSONB quantities
**And** a SHA-256 hash of the prediction data is generated
**And** the hash is stored in the Prediction entity for blockchain recording

---

## Epic 3: Blockchain Recording & Verification

System records predictions and shipment status changes on Ethereum blockchain. Users can verify any status update via Etherscan links. Transaction hashes are stored in the database.

### Story 3.1: Smart Contract Development & Deployment

As a **Developer**,
I want a Solidity smart contract deployed to Sepolia testnet,
So that predictions and shipments can be recorded on-chain.

**Acceptance Criteria:**

**Given** the smart contract is deployed via Remix IDE
**When** `addPredictionHash()` and `addShipmentLog()` are called
**Then** data is stored immutably on Ethereum
**And** `getShipmentHistory()` and `getPredictionRecord()` return stored data
**And** contract address is configured in backend environment

---

### Story 3.2: NestJS Blockchain Module Setup

As a **Developer**,
I want a Blockchain module in NestJS using ethers.js,
So that the backend can interact with the smart contract.

**Acceptance Criteria:**

**Given** the module is configured with Sepolia RPC and contract ABI
**When** blockchain methods are called
**Then** transactions are signed with the backend wallet
**And** failed transactions are retried up to 3 times (NFR4)
**And** transaction status is logged for debugging

---

### Story 3.3: Record Prediction Hash On-Chain

As the **System**,
I want to record prediction hashes on the blockchain,
So that AI predictions are immutably traceable.

**Acceptance Criteria:**

**Given** a prediction hash is generated
**When** the recording is triggered
**Then** `addPredictionHash()` is called on the smart contract
**And** the transaction hash is stored in the Prediction entity
**And** recording failures don't block the prediction flow (NFR10)

---

### Story 3.4: Record Shipment Status On-Chain

As the **System**,
I want to record shipment status changes on the blockchain,
So that the delivery journey is transparent.

**Acceptance Criteria:**

**Given** a shipment status is updated
**When** the status change is persisted in PostgreSQL
**Then** `addShipmentLog()` is called with barcode, status, and location
**And** the transaction hash is stored in the TrackingLog entity
**And** blockchain recording is async (returns 202 Accepted)

---

### Story 3.5: Blockchain Verification Links

As a **User**,
I want to see blockchain verification links for status updates,
So that I can verify records on Etherscan.

**Acceptance Criteria:**

**Given** a status update has a transaction hash
**When** I view the tracking timeline
**Then** an Etherscan Sepolia link is displayed for each blockchain-verified entry
**And** clicking the link opens the transaction details in a new tab

---

### Story 3.6: Retrieve Shipment History from Blockchain

As the **System**,
I want to retrieve shipment history from the blockchain,
So that on-chain records can be displayed.

**Acceptance Criteria:**

**Given** a barcode is provided
**When** `getShipmentHistory()` is called on the smart contract
**Then** all on-chain logs for that shipment are returned
**And** results match the database records for verification

---

## Epic 4: Shipment Creation & Delivery Workflow

Officials create shipments from predictions, generate barcodes, update shipment status through the workflow, confirm deliveries with actual quantities, and view accuracy calculations.

### Story 4.1: Create Shipment from Prediction

As an **Official**,
I want to create a shipment using the predicted/adjusted quantities,
So that I can initiate the delivery process.

**Acceptance Criteria:**

**Given** I have approved prediction quantities
**When** I click "Create Shipment"
**Then** a new Shipment entity is created with the quantities
**And** the Prediction is linked to the Shipment
**And** I am redirected to the shipment details page

---

### Story 4.2: Barcode Generation for Shipments

As the **System**,
I want to generate a unique barcode for each shipment,
So that it can be tracked throughout the delivery process.

**Acceptance Criteria:**

**Given** a shipment is created
**When** the shipment is saved
**Then** a unique barcode is generated (format: `BD-2025-XXXXX`)
**And** the barcode is displayed on the shipment details page
**And** a printable barcode image is available for download

---

### Story 4.3: Shipment Status Updates

As an **Official**,
I want to update shipment status through the workflow stages,
So that the delivery progress is tracked.

**Acceptance Criteria:**

**Given** I am viewing a shipment
**When** I change the status (Created → Departed → Arrived → Delivered)
**Then** the new status is saved with timestamp
**And** a TrackingLog entry is created
**And** the status change triggers blockchain recording (from Epic 3)

---

### Story 4.4: Delivery Confirmation with Actual Quantities

As an **Official**,
I want to confirm delivery and enter actual quantities received,
So that prediction accuracy can be calculated.

**Acceptance Criteria:**

**Given** a shipment has arrived at destination
**When** I enter the actual quantities received for each aid type
**Then** the actual quantities are stored in the Prediction entity
**And** the shipment status is updated to "Delivered"
**And** validation ensures quantities are non-negative integers

---

### Story 4.5: Prediction Accuracy Calculation

As the **System**,
I want to calculate the accuracy percentage between predicted and actual quantities,
So that users can see how accurate the AI was.

**Acceptance Criteria:**

**Given** a shipment has actual quantities recorded
**When** the accuracy is calculated
**Then** the percentage accuracy is computed per aid type
**And** the overall accuracy is stored in the Prediction entity
**And** the accuracy is displayed on the shipment details page

---

## Epic 5: Public Donation Tracking

Donors (unauthenticated) can search by barcode and view complete shipment timelines with blockchain verification links and origin/destination information.

### Story 5.1: Public Tracking Page

As a **Donor**,
I want to access a public tracking page without logging in,
So that I can check the status of my donation.

**Acceptance Criteria:**

**Given** I am an unauthenticated user
**When** I navigate to `/track`
**Then** a barcode search form is displayed
**And** no authentication is required
**And** the page has a clean, user-friendly design

---

### Story 5.2: Barcode Search Functionality

As a **Donor**,
I want to search for a shipment using its barcode,
So that I can find my donation's tracking information.

**Acceptance Criteria:**

**Given** I am on the tracking page
**When** I enter a valid barcode and submit
**Then** the shipment details are displayed
**And** an error message is shown if the barcode is not found
**And** the search input is validated for proper barcode format

---

### Story 5.3: Shipment Timeline Display

As a **Donor**,
I want to view the complete timeline of my shipment,
So that I can see every status update in the journey.

**Acceptance Criteria:**

**Given** a shipment is found
**When** I view the tracking results
**Then** a timeline shows all status updates with timestamps
**And** each status shows location (Received → Departed → Arrived → Delivered)
**And** blockchain verification links are displayed where available (from Epic 3)

---

### Story 5.4: Origin & Destination Display

As a **Donor**,
I want to see the origin and destination of my shipment,
So that I know where my donation went.

**Acceptance Criteria:**

**Given** I am viewing shipment details
**When** the page loads
**Then** the origin location (collection point) is displayed
**And** the destination location (distribution center) is displayed
**And** a visual route indicator connects origin to destination

---

## Epic 6: Admin Reports & Analytics

Admins can view prediction accuracy reports, filter by date/region/category, export data, view aggregate metrics, and access blockchain audit trails for compliance.

### Story 6.1: Admin Reports Dashboard

As an **Admin**,
I want to access a reports dashboard,
So that I can view prediction accuracy analytics.

**Acceptance Criteria:**

**Given** I am logged in with admin role
**When** I navigate to `/admin/reports`
**Then** a dashboard with prediction accuracy metrics is displayed
**And** non-admin users are redirected with 403 Forbidden

---

### Story 6.2: Prediction Accuracy Reports

As an **Admin**,
I want to view prediction accuracy reports,
So that I can assess how well the AI is performing.

**Acceptance Criteria:**

**Given** I am on the reports dashboard
**When** I view the accuracy section
**Then** predicted vs. actual comparisons are displayed for completed shipments
**And** accuracy percentages are shown per aid category (tent, container, food, blanket)

---

### Story 6.3: Report Filtering

As an **Admin**,
I want to filter reports by date range, region, and aid category,
So that I can analyze specific segments of data.

**Acceptance Criteria:**

**Given** I am on the reports dashboard
**When** I apply filters (date range, region, category)
**Then** the displayed data is filtered accordingly
**And** filters can be cleared to show all data
**And** the URL updates to reflect filter state (shareable links)

---

### Story 6.4: Data Export

As an **Admin**,
I want to export prediction vs. actual data,
So that I can perform offline analysis or share with stakeholders.

**Acceptance Criteria:**

**Given** I am viewing filtered or unfiltered data
**When** I click "Export"
**Then** the data is downloaded as CSV
**And** the export includes all visible columns
**And** the filename includes the current date

---

### Story 6.5: Aggregate Accuracy Metrics

As an **Admin**,
I want to view aggregate metrics (average, best, worst accuracy),
So that I can quickly assess overall system performance.

**Acceptance Criteria:**

**Given** I am on the reports dashboard
**When** the page loads
**Then** aggregate metrics are displayed (average accuracy, best category, worst category)
**And** total predictions count and completed predictions count are shown
**And** metrics update when filters are applied

---

### Story 6.6: Blockchain Audit Trail Export

As an **Admin**,
I want to export blockchain-verified records,
So that I can provide compliance reports to stakeholders.

**Acceptance Criteria:**

**Given** I am on the admin dashboard
**When** I click "Export Blockchain Audit Trail"
**Then** all blockchain transaction hashes with timestamps are exported
**And** the export includes Etherscan Sepolia links for verification
**And** prediction hashes and shipment logs are both included

