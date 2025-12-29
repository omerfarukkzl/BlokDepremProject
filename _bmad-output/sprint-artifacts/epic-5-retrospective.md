# Retrospective: Epic 5 - Public Donation Tracking

**Date:** 2025-12-29
**Facilitator:** Bob (Scrum Master)
**Participants:** Omerfarukkizil, Alice (PO), Charlie (Senior Dev), Dana (QA), Elena (Junior Dev)

## Executive Summary
Epic 5 successfully delivered the core public-facing features of the platform. Donors can now track shipments without authentication. While the features work, the team encountered significant friction due to integration mismatches (validation logic) and gaps in end-to-end testing, leading to bugs that could have been caught earlier.

## Delivery Metrics
- **Completed Stories:** 4 of 4 (100%)
- **Velocity:** Delivered in sequence.
- **Key Deliverables:** Public Tracking Page, Barcode Search, Timeline Component, Route Visualization.

## What Went Well
- **Public Access:** Successfully implemented the unguarded public API pattern, allowing seamless access for donors.
- **Visualizations:** The Timeline and Route Map components (using generic `TrackingLog` data) are reusable and provide high value.
- **Tech Stack Alignment:** Standardization on `@heroicons/react` and TailwindCSS improved UI consistency.

## Challenges & Lessons Learned
- **Integration Mismatches (The "Barcode Bug"):** 
    - *Issue:* Shipments were created with a barcode format that the Tracking verification logic rejected.
    - *Lesson:* "Shared Constants" or "Contract Tests" are needed between creating and consuming services. Frontend and Backend must agree on formats *before* implementation.
- **Testing Gaps:**
    - *Issue:* Automated unit tests passed, but the "Human User Journey" (Create -> Track) failed due to the mismatch.
    - *Lesson:* Automated tests are not a substitute for manual end-to-end verification.
- **Data Model Constraints:**
    - *Issue:* The `Location` entity lacked specific address fields, forcing the UI to fallback to generic text ("Belirtilmedi").

## Action Items
| ID | Action Item | Owner | Priority | Status |
|----|-------------|-------|----------|--------|
| **5.1** | **Mandate Manual UX Verification:** Add a required checklist item to every Story for "Manual User Journey Verification" by the developer. Coverage of "Happy Path" is mandatory. | **Team/All** | **High** | **Adopted** |
| **5.2** | **End-to-End Test Scenarios:** Enhance test suite to cover the flow from Creation (Epic 4) to Tracking (Epic 5) to catch format mismatches. | Dana (QA) | Medium | Proposed |
| **5.3** | **Shared Validation:** Move validation logic (like regex patterns) to a shared constants file/library accessible to both Front and Back if possible (or strictly duplicated). | Charlie (Dev) | Medium | Proposed |

## Preparation for Epic 6 (Admin Reports)
The team discussed readiness for the data-heavy reporting epic.

- **Technical Decision (Frontend):** Selected **Recharts** as the visualization library for its React-native composability.
- **Technical Decision (Backend):** Will implement **GIN Indexing** on PostgreSQL JSONB columns to ensure performant querying of prediction quantities.
- **Process:** Will apply the new "Manual Verification" rule strictly to ensure charts and reports are not just data-correct but visually usable.

## Conclusion
Epic 5 is closed. The team is ready to proceed to Epic 6 with a stronger focus on integration quality and manual validation.
