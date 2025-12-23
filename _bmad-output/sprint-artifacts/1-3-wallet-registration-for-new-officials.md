# Story 1.3: Wallet Registration for New Officials

Status: done

---

## Story

As an **unregistered Official**,
I want to register my wallet address in the system,
So that I can be recognized as an authorized Official.

## Acceptance Criteria

1. **Given** I am a new user with a connected wallet
   **When** I submit my registration with wallet address
   **Then** my wallet is stored in the Officials table
   **And** I receive a success message and can proceed to authenticate
   **And** duplicate wallet addresses are rejected with an error

## Tasks / Subtasks

> **✅ IMPLEMENTATION COMPLETE**

All tasks have been implemented and verified with passing tests.

### ✅ Already Implemented (Verified)

- [x] Task 1: Backend Registration Endpoint (AC: #1) ✅
  - [x] Existing: `POST /auth/register` endpoint in `auth.controller.ts`
  - [x] Existing: `register()` method in `auth.service.ts`
  - [x] Existing: `RegisterDto` with wallet address validation (Ethereum address regex)
  - [x] Existing: Signature verification via ethers.js `verifyMessage`

- [x] Task 2: Official Entity Storage (AC: #1) ✅
  - [x] Existing: `Official` entity with `wallet_address`, `name`, `role`, `location_id` columns
  - [x] Existing: `wallet_address` column has `unique: true` constraint
  - [x] Existing: Wallet addresses normalized to lowercase before storage

- [x] Task 3: Duplicate Wallet Rejection (AC: #1) ✅
  - [x] Existing: Check for existing official before creation
  - [x] Existing: Returns `UnauthorizedException` with message "Official with this wallet address already exists"

- [x] Task 4: Success Response with JWT (AC: #1) ✅
  - [x] Existing: JWT token generation on successful registration
  - [x] Existing: Token contains `sub`, `walletAddress`, and `role` claims
  - [x] Existing: Returns `AuthResponse` with user info and token

- [x] Task 5: Frontend Registration Page (AC: #1) ✅
  - [x] Existing: `RegisterPage.tsx` at `/frontend/src/pages/public/RegisterPage/`
  - [x] Existing: Form for wallet registration with required fields

- [x] Task 6: Unit Tests (AC: #1) ✅
  - [x] Existing: `auth.service.spec.ts` with registration tests
  - [x] Test: "should successfully register new official"
  - [x] Test: "should reject duplicate wallet address"
  - [x] Test: "should reject invalid signature"

## Dev Notes

### 🎯 Implementation Summary

All Story 1.3 acceptance criteria have been met:

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Wallet stored in Officials table | ✅ | `officialRepository.save()` in auth.service.ts |
| Success message & JWT token | ✅ | Returns `AuthResponse` with user and token |
| Duplicate wallet rejection | ✅ | `UnauthorizedException` on existing wallet |

### Existing Code References

#### 1. RegisterDto (`dto/register.dto.ts`)
```typescript
export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'wallet_address must be a valid Ethereum address',
  })
  wallet_address: string;

  @IsString()
  @IsNotEmpty()
  signature: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNumber()
  @IsNotEmpty()
  location_id: number;
}
```

#### 2. Registration Service (`auth.service.ts`)
```typescript
async register(registerDto: RegisterDto): Promise<AuthResponse> {
  // Verify signature
  if (!this.verifySignature(wallet_address, message, signature)) {
    throw new BadRequestException('Invalid signature');
  }

  // Check for duplicate
  const existingOfficial = await this.officialRepository.findOne({
    where: { wallet_address: wallet_address.toLowerCase() }
  });
  if (existingOfficial) {
    throw new UnauthorizedException('Official with this wallet address already exists');
  }

  // Create and save official
  const official = this.officialRepository.create({ ... });
  const savedOfficial = await this.officialRepository.save(official);

  // Generate JWT token
  const payload = { sub, walletAddress, role };
  return { user, token };
}
```

### Architecture Compliance ✅

- [x] Uses ethers.js v6.16.0 for signature verification
- [x] NestJS module pattern followed
- [x] Standard API response wrapper format
- [x] Wallet addresses normalized to lowercase
- [x] TypeORM entity with unique constraint on wallet_address

### Dependencies

- **Story 1.1** ✅ MetaMask Wallet Connection (completed - provides connected wallet)
- **Story 1.2** ✅ Wallet Signature Challenge (completed - provides signature verification)

### References

- [auth.controller.ts](file:///Users/omerfarukkizil/development/BlokDepremProject/backend/src/modules/auth/auth.controller.ts) - `POST /auth/register` endpoint
- [auth.service.ts](file:///Users/omerfarukkizil/development/BlokDepremProject/backend/src/modules/auth/auth.service.ts) - `register()` method
- [register.dto.ts](file:///Users/omerfarukkizil/development/BlokDepremProject/backend/src/modules/auth/dto/register.dto.ts) - DTO with validation
- [official.entity.ts](file:///Users/omerfarukkizil/development/BlokDepremProject/backend/src/entities/official.entity.ts) - Official entity
- [RegisterPage.tsx](file:///Users/omerfarukkizil/development/BlokDepremProject/frontend/src/pages/public/RegisterPage/RegisterPage.tsx) - Frontend registration UI

## Testing Requirements

### Unit Tests ✅

| Test Case | File | Status |
|-----------|------|--------|
| Register new official successfully | `auth.service.spec.ts` | ✅ Pass |
| Reject duplicate wallet address | `auth.service.spec.ts` | ✅ Pass |
| Reject invalid signature | `auth.service.spec.ts` | ✅ Pass |

### Integration Tests

| Test Case | Endpoint | Status |
|-----------|----------|--------|
| Valid registration with new wallet | `POST /auth/register` | ✅ Covered |
| Duplicate wallet rejection | `POST /auth/register` | ✅ Covered |

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-22 | Story created - implementation already complete | SM Agent |
