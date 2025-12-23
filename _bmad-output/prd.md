---
stepsCompleted: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11]
inputDocuments:
  - /Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/analysis/brainstorming-session-2025-12-21.md
  - /Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/index.md
  - /Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/project-overview.md
  - /Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/integration-architecture.md
  - /Users/omerfarukkizil/development/BlokDepremProject/blokdeprem-tubitak-basvuru-formu.md
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 1
  projectDocs: 4
workflowType: 'prd'
lastStep: 11
project_name: 'BlokDepremProject'
user_name: 'Omerfarukkizil'
date: '2025-12-21'
---

# Product Requirements Document - BlokDepremProject

**Author:** Omerfarukkizil
**Date:** 2025-12-21

---

## Executive Summary

**BlokDeprem** is a blockchain and AI-powered earthquake aid tracking and coordination system designed to make post-earthquake relief in Turkey more transparent, fast, and efficient.

This PRD defines the **complete remaining implementation** for BlokDeprem, building upon the existing NestJS backend, React 19 frontend, and PostgreSQL database. The focus is on bringing three core capabilities to production:

1. **AI Prediction Service** — Machine learning models that predict regional aid needs based on population, damage statistics, and historical data
2. **Blockchain Integration** — Ethereum smart contracts for immutable tracking of shipments and prediction audits
3. **Prediction Audit Trail** — Accountability loop comparing AI predictions against actual delivery outcomes

### Target Users

| User Type | Role |
|-----------|------|
| **Görevli (Officials)** | Field workers who log deliveries, create barcodes, and update shipment status via crypto wallet authentication |
| **Yardımsever (Donors)** | Contributors who view real-time needs lists and track their donations via barcode |
| **Admin** | System administrators accessing reports, analytics, and monitoring dashboards |

### What Makes This Special

The unique value of BlokDeprem comes from the **synergy between AI and Blockchain**:

- **AI predictions are not black boxes** — Every prediction is hashed and stored on the blockchain, creating an immutable audit trail
- **The system learns from reality** — By comparing predicted vs. actual deliveries, the AI models continuously improve
- **Trust is built-in** — Donors can verify that their contributions moved through the system exactly as recorded
- **Data-driven decision making** — Officials receive actionable, prioritized recommendations rather than manual guesswork

### Project Context

**Status:** Brownfield — Extending existing production-ready codebase

**Existing Foundation:**
- NestJS 11 backend with 7 TypeORM entities (Location, Official, AidItem, Need, Shipment, ShipmentDetail, TrackingLog)
- React 19 frontend with Vite 7, Zustand state management, TailwindCSS
- JWT authentication with wallet address support
- Docker PostgreSQL infrastructure
- 4 trained Random Forest models for aid prediction (tents, containers, food packages, blankets)

**This PRD Adds:**
- Flask/FastAPI prediction service exposing ML models
- Ethereum smart contract for prediction hash recording and shipment tracking
- NestJS ↔ AI Service ↔ Blockchain integration layer
- Prediction accuracy dashboard and audit features

## Project Classification

**Technical Type:** Multi-part Monorepo (Web App + API Backend + Blockchain + AI)
**Domain:** GovTech / Humanitarian (Disaster Relief Coordination)
**Complexity:** HIGH
**Project Context:** Brownfield — extending existing system with AI + Blockchain capabilities

---

## Success Criteria

### User Success (Prototype Validation)

**Görevli (Officials):**
- Successfully authenticate with wallet address
- Receive AI-generated predictions for selected region
- Create barcode for shipment and update status
- Complete end-to-end workflow: prediction → shipment creation → delivery confirmation

**Yardımsever (Donors):**
- View real-time needs list without authentication
- Track donation status using barcode number
- View blockchain-verified shipment history

**Admin:**
- Access prediction accuracy reports (predicted vs. actual)
- View complete shipment tracking data

### Technical Success (Proof of Concept)

| Component | Success Criteria |
|-----------|-----------------|
| **AI Prediction Service** | Flask/FastAPI endpoint returns predictions from 4 trained Random Forest models |
| **Blockchain Recording** | Prediction hashes successfully recorded on Ethereum Sepolia testnet |
| **NestJS Integration** | Backend successfully calls AI service and blockchain service |
| **Audit Trail** | Predicted vs. actual comparison data stored in PostgreSQL and viewable |
| **Smart Contract** | `addShipmentLog()` and `getShipmentHistory()` functions operational |

### Measurable Outcomes

- [ ] AI service responds to prediction requests with valid JSON
- [ ] Blockchain transaction hashes stored in `tracking_logs` table
- [ ] Barcode-based shipment tracking returns complete history
- [ ] Prediction accuracy comparison displays for completed shipments

---

## Product Scope

### MVP — Minimum Viable Prototype

**Core Features (from Brainstorming Session):**

1. **Needs Prediction**
   - Flask/FastAPI endpoint exposing trained ML models
   - NestJS integration to call prediction service
   - Prediction results displayed in frontend

2. **Prediction Audit Trail**
   - Hash of each prediction recorded on Ethereum
   - Comparison of predicted quantities vs. actual delivered
   - Historical prediction records queryable

3. **Shipment Transparency**
   - Barcode generation for shipments
   - Status updates logged to blockchain
   - Public tracking via barcode lookup

### Out of Scope (Deferred)

- Model Accuracy Dashboard (MEDIUM priority from brainstorming)
- Priority Scoring by region (LOW priority from brainstorming)
- PWA / Mobile app
- Real-time WebSocket notifications
- Production deployment / scaling

---

## User Journeys

### Journey 1: Ahmet the Official — Getting AI Predictions and Creating a Shipment

Ahmet is a field coordinator for a disaster relief organization in Hatay. After the earthquake, his team is overwhelmed with requests from multiple collection points. He's been manually estimating how many tents, blankets, and food packages to send to each region — but he's often wrong, leading to shortages in some areas and surpluses in others.

He logs into BlokDeprem with his MetaMask wallet. On the dashboard, he sees a new "AI Predictions" section. He selects "Hatay Province" and clicks "Generate Prediction." Within seconds, the system displays: "Recommended: 450 tents, 1,200 blankets, 800 food packages, 200 containers."

Ahmet reviews the prediction and adjusts food packages to 900 based on his local knowledge. He clicks "Create Shipment" — the system generates a barcode automatically. Behind the scenes, the prediction (with his adjustments) is hashed and recorded on the Ethereum blockchain.

Three days later, when the shipment arrives at the distribution center, the receiving official scans the barcode. The system logs the actual quantities delivered. Ahmet can now see his prediction was 95% accurate for tents, but only 78% for blankets — insight he'll use next time.

**Capabilities Revealed:**
- Wallet-based authentication
- Region selection interface
- AI prediction service integration
- Prediction adjustment UI
- Shipment creation with auto-barcode
- Blockchain prediction hash recording
- Delivery confirmation workflow
- Accuracy comparison display

---

### Journey 2: Elif the Donor — Tracking Where Her Donation Went

Elif is a citizen in Istanbul who donated ₺500 worth of blankets after seeing news about earthquake victims. She dropped her donation at a collection point and received a barcode slip. She's always wondered: "Did my donation actually reach someone in need, or was it lost in the chaos?"

Two weeks later, she visits the BlokDeprem website and enters her barcode number. No login required. The tracking page shows a timeline:
- "Received at Istanbul Collection Center" — Jan 15
- "Departed for Hatay Warehouse" — Jan 16
- "Arrived at Hatay Warehouse" — Jan 17
- "Distributed to families in Samandağ" — Jan 20

Each status update has a blockchain verification link. Elif clicks it and sees the Ethereum transaction hash confirming the status change is immutable. She screenshots this and shares with friends: "Look, I can actually prove where my donation went!"

**Capabilities Revealed:**
- Public tracking page (no auth required)
- Barcode search functionality
- Shipment timeline/history display
- Blockchain transaction verification links
- Etherscan integration for transparency

---

### Journey 3: Zeynep the Admin — Reviewing Prediction Accuracy

Zeynep is a data analyst at the relief organization's headquarters in Ankara. Her job is to evaluate whether the new AI system is actually helping or making things worse.

She logs into the admin panel and navigates to "Prediction Reports." She filters by the last month and sees:
- Total predictions made: 47
- Average accuracy (predicted vs. actual): 82%
- Best performing category: Tents (91%)
- Worst performing category: Food packages (68%)

Zeynep clicks on the food packages row to drill down. She sees that predictions are consistently low for coastal regions. She exports this data and writes a recommendation: "Consider adding 'coastal proximity' as a feature in the next model training."

For the quarterly report to donors, Zeynep exports blockchain-verified records showing every prediction and corresponding delivery. The transparency builds trust with major organizational donors.

**Capabilities Revealed:**
- Admin authentication (elevated permissions)
- Prediction accuracy reports
- Filtering by date/region/category
- Drill-down analytics
- Data export functionality
- Blockchain audit trail export

---

### Journey Requirements Summary

| User Type | Core Interactions | Required Capabilities |
|-----------|-------------------|----------------------|
| **Official (Ahmet)** | Login → Predict → Adjust → Ship → Verify | Wallet auth, AI predictions, shipment creation, barcode generation, blockchain recording |
| **Donor (Elif)** | Track → Verify | Public tracking, barcode search, timeline, blockchain links |
| **Admin (Zeynep)** | Report → Analyze → Export | Admin auth, prediction reports, accuracy metrics, data export, audit trail |

---

## Innovation & Novel Patterns

### Detected Innovation Areas

BlokDeprem introduces a novel approach by combining **AI prediction** with **blockchain accountability** in the disaster relief domain:

| Innovation | Description |
|------------|-------------|
| **AI + Blockchain Synergy** | Machine learning predictions are hashed and recorded on Ethereum, creating an immutable audit trail for AI decisions |
| **Accountable AI** | Unlike black-box AI systems, every prediction can be verified and compared against actual outcomes |
| **Learning Loop** | The predicted vs. actual comparison enables continuous model improvement with transparent tracking |
| **Trust by Design** | Donors can verify the entire journey of their contribution through blockchain-verified records |

### What Makes This Unique

Traditional disaster relief systems face two problems:
1. **Estimation errors** — Manual guesswork leads to shortages or surpluses
2. **Trust deficit** — Donors don't know if their contributions reached victims

BlokDeprem solves both by:
- Using ML models trained on real disaster data (TÜİK, AFAD, TUBITAK sources)
- Recording every prediction and delivery on an immutable ledger
- Enabling anyone to audit the system's accuracy over time

### Validation Approach

| Component | Validation Method |
|-----------|------------------|
| **AI Predictions** | Compare predicted vs. actual quantities for completed shipments |
| **Blockchain Recording** | Verify transaction hashes on Ethereum Sepolia testnet |
| **End-to-End Flow** | Test complete journey from prediction → shipment → delivery → audit |
| **Model Accuracy** | Track accuracy metrics per category (tent, container, food, blanket) |

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| **Model inaccuracy** | Officials can adjust predictions before creating shipments; accuracy feedback improves future models |
| **Blockchain failures** | Off-chain database stores all data; blockchain provides verification layer, not primary storage |
| **Gas costs** | Use Sepolia testnet for prototype; production could use L2 or batch transactions |

---

## Technical Requirements

### Multi-Part Architecture Overview

BlokDeprem is a **multi-part monorepo** with four components that must integrate seamlessly:

```
┌──────────────────────────────────────────────────────────────────┐
│                     Frontend (React 19)                          │
│                    http://localhost:5173                         │
└─────────────────────────────┬────────────────────────────────────┘
                              │ REST API (Axios)
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Backend (NestJS 11)                          │
│                    http://localhost:3000                         │
└───────────┬─────────────────┼─────────────────┬──────────────────┘
            │                 │                 │
            ▼                 ▼                 ▼
     ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
     │  PostgreSQL │   │  AI Service │   │  Ethereum   │
     │   Database  │   │  (Python)   │   │  Sepolia    │
     └─────────────┘   └─────────────┘   └─────────────┘
```

### Blockchain Requirements (blockchain_web3)

| Requirement | Specification |
|-------------|---------------|
| **Chain Selection** | Ethereum Sepolia testnet (prototype) |
| **Wallet Integration** | MetaMask via ethers.js 6.16 |
| **Smart Contract** | Solidity deployed via Remix IDE |
| **Gas Optimization** | Not critical for prototype; testnet ETH |
| **Security Audit** | Deferred to production phase |

**Smart Contract Functions Required:**
```solidity
function addShipmentLog(string barcode, string status, string location) public onlyBackend
function addPredictionHash(string regionId, bytes32 hash, uint256 timestamp) public onlyBackend
function getShipmentHistory(string barcode) public view returns (Log[] memory)
function getPredictionRecord(string regionId) public view returns (Prediction memory)
```

### API Backend Requirements (api_backend)

| Requirement | Specification |
|-------------|---------------|
| **Framework** | NestJS 11 (existing) |
| **Authentication** | JWT + Wallet Address |
| **Data Format** | JSON (REST) |
| **Rate Limits** | Not required for prototype |
| **Versioning** | Not required for prototype |

**New Endpoints Required:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/ai/predict` | Get AI prediction for region | JWT |
| POST | `/ai/predict/record` | Record prediction hash on blockchain | JWT |
| GET | `/predictions/:regionId/history` | Get prediction history | JWT |
| GET | `/predictions/:regionId/accuracy` | Get accuracy comparison | JWT |
| GET | `/track/:barcode/blockchain` | Get blockchain verification | Public |

### AI Service Requirements (Python)

| Requirement | Specification |
|-------------|---------------|
| **Framework** | Flask or FastAPI |
| **Models** | 4 Random Forest models (tent, container, food, blanket) |
| **Input** | Region data (population, damage statistics) |
| **Output** | JSON with predicted quantities |
| **Port** | 5000 (internal only) |

**Prediction API Contract:**
```json
// Request: POST /predict
{
  "region_id": "hatay",
  "population": 1500000,
  "damage_level": "severe",
  "coastal": true
}

// Response
{
  "predictions": {
    "tent": 450,
    "container": 200,
    "food_package": 800,
    "blanket": 1200
  },
  "confidence": 0.82,
  "hash": "0x7d3f..."
}
```

### Web App Requirements (web_app)

| Requirement | Specification |
|-------------|---------------|
| **Architecture** | SPA (existing React 19 + Vite) |
| **Browser Support** | Modern browsers (Chrome, Firefox, Safari, Edge) |
| **SEO** | Not required (authenticated app) |
| **Real-time** | Deferred (out of MVP scope) |
| **Accessibility** | Basic keyboard navigation |

### Integration Layer Requirements

**NestJS → AI Service:**
- HTTP client to Flask/FastAPI endpoint
- Error handling for AI service unavailability
- Caching of predictions (optional for prototype)

**NestJS → Blockchain:**
- ethers.js provider for Sepolia
- Wallet abstraction for backend signing
- Transaction hash storage in `tracking_logs` table

**Frontend → Blockchain:**
- Etherscan links for verification
- MetaMask connection for Officials

### Data Model Extensions

**New Entity: Prediction**
```typescript
@Entity()
export class Prediction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  regionId: string;

  @Column('jsonb')
  predictedQuantities: Record<string, number>;

  @Column('jsonb', { nullable: true })
  actualQuantities: Record<string, number>;

  @Column({ nullable: true })
  blockchainTxHash: string;

  @Column({ nullable: true })
  accuracy: number;

  @CreateDateColumn()
  createdAt: Date;
}
```

### Skip Sections (Not Applicable)

- Mobile-first design (web-only prototype)
- CLI commands
- SDK generation
- Multi-tenancy
- Subscription tiers

---

## Functional Requirements

### Authentication & Identity

- **FR1:** Officials can authenticate using their wallet address (MetaMask)
- **FR2:** Officials can register new wallet addresses to the system
- **FR3:** System can verify wallet ownership via signature challenge
- **FR4:** Donors can access public pages without authentication
- **FR5:** Admins can authenticate with elevated permissions

### AI Prediction Service

- **FR6:** Officials can request AI predictions for a selected region
- **FR7:** System can return predicted quantities for tents, containers, food packages, and blankets
- **FR8:** Officials can view confidence scores for predictions
- **FR9:** Officials can adjust predicted quantities before creating shipment
- **FR10:** System can generate a cryptographic hash of each prediction

### Blockchain Integration

- **FR11:** System can record prediction hashes on Ethereum blockchain
- **FR12:** System can record shipment status changes on blockchain
- **FR13:** Users can view blockchain verification links for any status update
- **FR14:** System can retrieve shipment history from blockchain
- **FR15:** System can store blockchain transaction hashes in database

### Shipment Management

- **FR16:** Officials can create shipments with predicted/adjusted quantities
- **FR17:** System can generate unique barcodes for each shipment
- **FR18:** Officials can update shipment status (created, departed, arrived, delivered)
- **FR19:** Officials can confirm delivery with actual quantities received
- **FR20:** System can calculate accuracy percentage (predicted vs. actual)

### Public Tracking

- **FR21:** Donors can search for shipments by barcode number
- **FR22:** Donors can view shipment timeline with all status updates
- **FR23:** Donors can access blockchain verification for each status
- **FR24:** Donors can view the origin and destination of shipments

### Reporting & Analytics

- **FR25:** Admins can view prediction accuracy reports
- **FR26:** Admins can filter reports by date range, region, and aid category
- **FR27:** Admins can export prediction vs. actual data
- **FR28:** Admins can view aggregate accuracy metrics (average, best, worst)
- **FR29:** Admins can access blockchain audit trail for compliance reporting

---

## Non-Functional Requirements

> **Note:** These NFRs are scoped for a **prototype** implementation. Production deployment would require expanded requirements.

### Integration

- **NFR1:** AI service responds to prediction requests within 10 seconds
- **NFR2:** Blockchain transactions complete within 30 seconds (Sepolia testnet)
- **NFR3:** AI service gracefully handles unavailability with error messages
- **NFR4:** System retries failed blockchain transactions up to 3 times

### Security

- **NFR5:** Wallet authentication uses signature verification (no password storage)
- **NFR6:** JWT tokens expire after 24 hours
- **NFR7:** Admin endpoints require elevated role permissions
- **NFR8:** Database credentials not exposed in frontend code

### Reliability

- **NFR9:** All data persists in PostgreSQL before blockchain confirmation
- **NFR10:** Failed blockchain transactions do not block core functionality
- **NFR11:** API errors return meaningful error messages

### Excluded from Prototype

The following NFR categories are **not applicable** for the prototype:

| Category | Reason |
|----------|--------|
| **Performance** | Testnet blockchain is inherently slow; no SLAs required |
| **Scalability** | Single-user prototype; no concurrent load requirements |
| **Accessibility** | Basic keyboard navigation sufficient for prototype |
| **Compliance** | No real disaster victim data; GDPR/HIPAA not applicable |

---

## Document Status

**PRD Complete ✅**

| Section | Status |
|---------|--------|
| Executive Summary | ✅ Complete |
| Success Criteria | ✅ Complete |
| Product Scope | ✅ Complete |
| User Journeys | ✅ Complete (3 personas) |
| Innovation | ✅ Complete |
| Technical Requirements | ✅ Complete |
| Functional Requirements | ✅ Complete (29 FRs) |
| Non-Functional Requirements | ✅ Complete (11 NFRs) |

**Next Steps:**
1. Create Architecture document based on Technical Requirements
2. Create Epics & Stories based on Functional Requirements
3. Begin Implementation following MVP scope
