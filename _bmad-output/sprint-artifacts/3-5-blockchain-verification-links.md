# Story 3.5: Blockchain Verification Links

Status: done

## Story

As a **User**,
I want to **see blockchain verification links for status updates**,
so that **I can verify records on Etherscan**.

## Acceptance Criteria

1. **Given** a status update has a transaction hash
   **When** I view the tracking timeline
   **Then** an Etherscan Sepolia link is displayed for each blockchain-verified entry
2. **And** clicking the link opens the transaction details in a new tab

## Tasks / Subtasks

- [x] Create `BlockchainVerificationLink` component (AC: #1, #2)
  - [x] Create `frontend/src/components/features/tracking/BlockchainVerificationLink.tsx`
  - [x] Accept `txHash` prop to construct Etherscan Sepolia URL
  - [x] Display clickable link with blockchain verification icon
  - [x] Open link in new tab with `target="_blank"` and `rel="noopener noreferrer"`
  - [x] Style with TailwindCSS to match existing UI patterns
  - [x] Handle null/undefined txHash gracefully (hide or show "Pending" state)
- [x] Integrate into tracking timeline display (AC: #1)
  - [x] Update `TrackPage.tsx` to include blockchain verification data in tracking logs transformation
  - [x] Use `isOnBlockchain` and `blockchainTxHash` from tracking events
  - [x] Conditionally render `BlockchainVerificationLink` when `txHash` is present
  - [x] Added `ShieldCheckIcon` indicator for blockchain-verified entries
- [x] Write unit tests for `BlockchainVerificationLink` (AC: #1, #2)
  - [x] Test correct Etherscan URL generation
  - [x] Test that link opens in new tab
  - [x] Test graceful handling of missing `txHash`
  - [x] Test accessibility (proper aria-labels for screen readers)
- [x] Verify on live tracking page
  - [x] Navigate to `/track` and search for a shipment with blockchain-recorded status
  - [x] Confirm Etherscan links appear for verified entries
  - [x] Confirm clicking opens Etherscan Sepolia in new tab

## Dev Notes

### Existing Implementation (Use These)

- **`TrackingEvent` interface** already has `isOnBlockchain: boolean` and `blockchainTxHash?: string` fields in `frontend/src/services/trackingService.ts`
- **`formatTrackingTimeline()`** method returns `{ isBlockchain, txHash }` for each event - already implemented
- **Etherscan Sepolia base URL**: `https://sepolia.etherscan.io/tx/`
- **`TrackingHistory.blockchainTransactions`** interface already captures `txHash`, `timestamp`, `blockNumber`, `status`

### Etherscan URL Pattern

```typescript
// Transaction URL format
const etherscanUrl = `https://sepolia.etherscan.io/tx/${txHash}`;

// Example:
// https://sepolia.etherscan.io/tx/0x1234567890abcdef...
```

### Component Pattern

```tsx
// BlockchainVerificationLink.tsx
interface BlockchainVerificationLinkProps {
  txHash?: string | null;
  className?: string;
}

export default function BlockchainVerificationLink({ 
  txHash, 
  className 
}: BlockchainVerificationLinkProps) {
  if (!txHash || txHash === 'pending') {
    return <span className="text-gray-400">⏳ Pending...</span>;
  }

  const url = `https://sepolia.etherscan.io/tx/${txHash}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center text-blue-500 hover:underline ${className}`}
      aria-label="View transaction on Etherscan"
    >
      <BlockchainIcon className="w-4 h-4 mr-1" />
      Verify on Etherscan
    </a>
  );
}
```

### Integration Pattern

The `TrackingService.formatTrackingTimeline()` already transforms backend events into the correct shape:

```typescript
// From trackingService.ts:363-386
formatTrackingTimeline(events: TrackingEvent[]): Array<{
  id: string;
  status: string;
  location?: string;
  timestamp: string;
  notes?: string;
  isBlockchain: boolean;  // <-- Use this to show/hide icon
  txHash?: string;        // <-- Pass to BlockchainVerificationLink
}>
```

### Source Files

| File | Action |
|------|--------|
| `frontend/src/components/features/tracking/BlockchainVerificationLink.tsx` | **[NEW]** Create component |
| `frontend/src/components/features/tracking/TrackingTimeline.tsx` | Integrate `BlockchainVerificationLink` |
| `frontend/src/services/trackingService.ts` | Use existing methods (no changes) |

### Project Structure Notes

- Component location: `frontend/src/components/features/tracking/` (already exists per architecture)
- Follow existing React component patterns: PascalCase file names, default export
- Use TailwindCSS utility classes for styling
- Use existing UI icons from `frontend/src/components/ui/` if available

### Testing Standards

- File pattern: `*.test.tsx` co-located with component
- Framework: React Testing Library + Vitest (or Jest)
- Test external link attributes: `target="_blank"`, `rel="noopener noreferrer"`
- Test accessibility with `aria-label` checks

### References

- [Story 3.4](file:///Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/sprint-artifacts/3-4-record-shipment-status-on-chain.md) - Where transaction hashes are stored
- [trackingService.ts](file:///Users/omerfarukkizil/development/BlokDepremProject/frontend/src/services/trackingService.ts) - Already has `txHash` handling in interfaces
- [Architecture: Frontend Components](file:///Users/omerfarukkizil/development/BlokDepremProject/_bmad-output/architecture.md#L469) - Component structure for tracking

## Dev Agent Record

### Agent Model Used

Gemini (Antigravity)

### Debug Log References

N/A

### Completion Notes List

- Created `BlockchainVerificationLink.tsx` component with full Etherscan Sepolia integration
- Component handles `pending` and null/undefined txHash states gracefully with pending indicator
- Added compact mode option for icon-only display
- Exported helper function `getEtherscanTxUrl()` for reuse
- Created barrel export `index.ts` for tracking feature components
- Integrated component into `TrackPage.tsx` timeline display
- Added `isOnBlockchain` and `blockchainTxHash` to tracking log transformation
- Added `ShieldCheckIcon` visual indicator for blockchain-verified entries
- Wrote 14 comprehensive unit tests covering all acceptance criteria
- All 90 frontend tests pass (14 new tests for BlockchainVerificationLink)
- Updated backend `TrackingLog` entity with `is_on_blockchain` computed getter
- Updated backend `TrackingService` to transform logs with blockchain fields
- All 81 backend tests pass
- Manual verification completed on live tracking page

### File List

- `frontend/src/components/features/tracking/BlockchainVerificationLink.tsx` (new)
- `frontend/src/components/features/tracking/BlockchainVerificationLink.test.tsx` (new)
- `frontend/src/components/features/tracking/index.ts` (new)
- `frontend/src/pages/public/TrackPage/TrackPage.tsx` (modified)
- `backend/src/entities/tracking-log.entity.ts` (modified)
- `backend/src/modules/tracking/tracking.service.ts` (modified)

## Change Log

- 2025-12-25: Story created with comprehensive developer context for blockchain verification links
- 2025-12-25: Implemented BlockchainVerificationLink component with Etherscan Sepolia integration and pending state handling
- 2025-12-25: Integrated component into TrackPage.tsx timeline with ShieldCheckIcon indicator
- 2025-12-25: Created 14 unit tests covering URL generation, new tab behavior, accessibility, pending states, and styling
- 2025-12-25: All tests passing (90 frontend, 81 backend), status updated to review
- 2025-12-25: Updated backend TrackingLog entity and TrackingService to return `is_on_blockchain` field
- 2025-12-25: Manual verification completed on live tracking page - blockchain links working correctly, status updated to done
