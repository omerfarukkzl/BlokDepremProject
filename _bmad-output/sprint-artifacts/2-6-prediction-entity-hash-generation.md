# Story 2.6: Prediction Entity & Hash Generation

Status: done

## Story

As the **System**,
I want to generate a cryptographic hash of each prediction,
so that it can be recorded immutably on the blockchain.

## Acceptance Criteria

1. **Given** a prediction is requested
   **When** the prediction is saved to the database
   **Then** a Prediction entity is created with JSONB quantities

2. **Given** a prediction is requested
   **When** the prediction is saved to the database
   **Then** a SHA-256 hash of the prediction data is generated

3. **Given** a prediction is requested
   **When** the prediction is saved to the database
   **Then** the hash is stored in the Prediction entity for blockchain recording

## Tasks / Subtasks

- [x] Task 1: Create Prediction Entity (AC: #1, #3)
  - [x] 1.1 Create `backend/src/entities/prediction.entity.ts`
  - [x] 1.2 Use numeric `@PrimaryGeneratedColumn()` (matches existing entities)
  - [x] 1.3 Use **snake_case** column names (matches existing patterns)
  - [x] 1.4 Add `region_id: string` column
  - [x] 1.5 Add `predicted_quantities: Record<string, number>` JSONB column
  - [x] 1.6 Add `actual_quantities: Record<string, number>` nullable JSONB column
  - [x] 1.7 Add `prediction_hash: string` column for SHA-256 hash
  - [x] 1.8 Add `blockchain_tx_hash: string` nullable column (for Epic 3)
  - [x] 1.9 Add `accuracy: number` nullable decimal column (for Story 4.5)
  - [x] 1.10 Add `confidence: number` decimal column
  - [x] 1.11 Add `created_by_official_id: number` with `@ManyToOne(() => Official)` relation
  - [x] 1.12 Add `shipment_id: number` nullable column (prep for Story 4.1)
  - [x] 1.13 Add `created_at: Date` timestamp column

- [x] Task 2: Create Predictions Module (AC: #1, #2, #3)
  - [x] 2.1 Create `backend/src/modules/predictions/predictions.module.ts`
  - [x] 2.2 Create `backend/src/modules/predictions/predictions.service.ts`
  - [x] 2.3 Create `backend/src/modules/predictions/predictions.controller.ts`
  - [x] 2.4 Create `backend/src/modules/predictions/dto/create-prediction.dto.ts`
  - [x] 2.5 Import `TypeOrmModule.forFeature([Prediction])` in module
  - [x] 2.6 Add `PredictionsModule` to AppModule imports array

- [x] Task 3: Integrate AI Service with Prediction Persistence (AC: #1, #2, #3)
  - [x] 3.1 Inject `PredictionsService` into `AiController`
  - [x] 3.2 After receiving FastAPI response, call `predictionsService.createPrediction()`
  - [x] 3.3 Store `prediction_hash` from FastAPI response in entity
  - [x] 3.4 Return saved entity ID in response for frontend reference

- [x] Task 4: Hash Generation Fallback (AC: #2)
  - [x] 4.1 Add NestJS fallback hash generation using Node.js `crypto`
  - [x] 4.2 Use recursive key sorting to match FastAPI `json.dumps(sort_keys=True)` exactly
  - [x] 4.3 Test hash consistency between FastAPI and NestJS fallback

- [x] Task 5: Unit Tests (AC: #1, #2, #3)
  - [x] 5.1 Create `backend/src/modules/predictions/predictions.service.spec.ts`
  - [x] 5.2 Test entity creation with JSONB columns
  - [x] 5.3 Test hash storage and retrieval
  - [x] 5.4 Test fallback hash matches FastAPI hash format
  - [x] 5.5 Run: `cd backend && npm run test`

## Dev Notes

### Architecture Compliance

| Aspect | Requirement |
|--------|-------------|
| Framework | NestJS 11 + TypeORM 0.3.27 |
| Entity Location | `backend/src/entities/prediction.entity.ts` |
| Module Location | `backend/src/modules/predictions/` |
| Primary Key | `@PrimaryGeneratedColumn()` → `id: number` (matches existing) |
| Column Names | **snake_case** (`region_id`, `prediction_hash`) — matches all existing entities |
| JSONB Pattern | `@Column('jsonb')` |
| Entity Auto-Discovery | AppModule uses glob: `entities: [__dirname + '/**/*.entity{.ts,.js}']` |

### Prediction Entity (Corrected)

```typescript
// backend/src/entities/prediction.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Official } from './official.entity';

@Entity('predictions')
export class Prediction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  region_id: string;

  @Column('jsonb')
  predicted_quantities: Record<string, number>;
  // { tent: 150, container: 50, food_package: 1000, blanket: 500 }

  @Column('jsonb', { nullable: true })
  actual_quantities: Record<string, number> | null;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  confidence: number;

  @Column()
  prediction_hash: string;

  @Column({ nullable: true })
  blockchain_tx_hash: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  accuracy: number | null;

  @Column()
  created_by_official_id: number;

  @ManyToOne(() => Official)
  @JoinColumn({ name: 'created_by_official_id' })
  official: Official;

  @Column({ nullable: true })
  shipment_id: number | null;
  // Will be linked in Story 4.1

  @CreateDateColumn()
  created_at: Date;
}
```

### PredictionsModule

```typescript
// backend/src/modules/predictions/predictions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prediction } from '../../entities/prediction.entity';
import { PredictionsService } from './predictions.service';
import { PredictionsController } from './predictions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Prediction])],
  providers: [PredictionsService],
  controllers: [PredictionsController],
  exports: [PredictionsService], // Export for AiModule injection
})
export class PredictionsModule {}
```

### PredictionsService

```typescript
// backend/src/modules/predictions/predictions.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prediction } from '../../entities/prediction.entity';
import { createHash } from 'crypto';

@Injectable()
export class PredictionsService {
  private readonly logger = new Logger(PredictionsService.name);

  constructor(
    @InjectRepository(Prediction)
    private readonly predictionRepository: Repository<Prediction>,
  ) {}

  async createPrediction(
    regionId: string,
    predictedQuantities: Record<string, number>,
    confidence: number,
    officialId: number,
    predictionHash?: string,
  ): Promise<Prediction> {
    const hash = predictionHash || this.generateHash(predictedQuantities, regionId);

    const prediction = this.predictionRepository.create({
      region_id: regionId,
      predicted_quantities: predictedQuantities,
      confidence,
      prediction_hash: hash,
      created_by_official_id: officialId,
    });

    const saved = await this.predictionRepository.save(prediction);
    this.logger.log(`Prediction saved: ${saved.id} with hash ${saved.prediction_hash}`);
    return saved;
  }

  /**
   * SHA-256 hash matching FastAPI: json.dumps(data, sort_keys=True)
   * CRITICAL: Must recursively sort keys for nested objects
   */
  private generateHash(predictions: Record<string, number>, regionId: string): string {
    const data = { predictions, region_id: regionId };
    const jsonStr = JSON.stringify(this.sortObjectKeys(data));
    return createHash('sha256').update(jsonStr).digest('hex');
  }

  private sortObjectKeys(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map(item => this.sortObjectKeys(item));
    return Object.keys(obj)
      .sort()
      .reduce((sorted, key) => {
        sorted[key] = this.sortObjectKeys(obj[key]);
        return sorted;
      }, {} as any);
  }

  async findById(id: number): Promise<Prediction | null> {
    return this.predictionRepository.findOne({ where: { id } });
  }
}
```

### AI Controller Integration

```typescript
// Modify: backend/src/modules/ai/ai.controller.ts
// Add PredictionsService injection and persistence

import { PredictionsService } from '../predictions/predictions.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly predictionsService: PredictionsService,
  ) {}

  @Post('predict')
  @UseGuards(AuthGuard('jwt'))
  async getPrediction(
    @Body() predictionDto: PredictionDto,
    @Request() req: any,
  ): Promise<any> {
    const response = await this.aiService.getPrediction(predictionDto);
    
    // Persist prediction with hash
    const prediction = await this.predictionsService.createPrediction(
      predictionDto.region_id,
      response.data.predictions,
      response.data.confidence,
      req.user.id, // Official ID from JWT
      response.data.prediction_hash,
    );

    return {
      ...response,
      predictionId: prediction.id,
    };
  }
}
```

### AppModule Update

```typescript
// backend/src/app.module.ts - ADD to imports array
import { PredictionsModule } from './modules/predictions/predictions.module';

@Module({
  imports: [
    // ... existing imports
    PredictionsModule, // ADD THIS
  ],
})
```

> **Note:** Entity auto-discovered via glob pattern - no manual entity registration needed.

### Project Structure

**Create:**
- `backend/src/entities/prediction.entity.ts`
- `backend/src/modules/predictions/predictions.module.ts`
- `backend/src/modules/predictions/predictions.service.ts`
- `backend/src/modules/predictions/predictions.controller.ts`
- `backend/src/modules/predictions/dto/create-prediction.dto.ts`

**Modify:**
- `backend/src/app.module.ts` (add PredictionsModule import)
- `backend/src/modules/ai/ai.module.ts` (import PredictionsModule)
- `backend/src/modules/ai/ai.controller.ts` (inject PredictionsService, persist after AI call)

### Dependencies on This Story

| Story | Requires | Column/Field |
|-------|----------|--------------|
| Story 3.3 | Record hash on-chain | `prediction_hash` |
| Story 4.1 | Link shipment | `shipment_id` |
| Story 4.4 | Delivery actuals | `actual_quantities` |
| Story 4.5 | Accuracy calc | `accuracy` |

### References

- [Shipment Entity pattern](file:///Users/omerfarukkizil/development/BlokDepremProject/backend/src/entities/shipment.entity.ts)
- [Official Entity (relation pattern)](file:///Users/omerfarukkizil/development/BlokDepremProject/backend/src/entities/official.entity.ts)
- [AI Controller](file:///Users/omerfarukkizil/development/BlokDepremProject/backend/src/modules/ai/ai.controller.ts)
- [FastAPI hash generation](file:///Users/omerfarukkizil/development/BlokDepremProject/ai/prediction_service.py#L103-L110)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4 (Antigravity)

### Debug Log References

- All 63 backend tests pass (no regressions)
- 14 new prediction-specific tests pass

### Completion Notes List

- Created Prediction entity with JSONB columns, ManyToOne relation to Official, and all required fields
- Created PredictionsModule with service, controller, and DTO
- Integrated PredictionsService into AiController to persist predictions after AI response
- Implemented SHA-256 hash generation fallback with recursive key sorting matching FastAPI
- Created comprehensive unit tests for service and controller
- Updated AI module to import PredictionsModule
- Updated AI controller tests to include PredictionsService mock
- Updated AI service test to verify fallback behavior

### Senior Developer Review (AI)

**Review Date:** 2024-12-24  
**Review Outcome:** Changes Requested → Fixed  
**Issues Fixed:** 6 (2 High, 4 Medium)

#### Fixes Applied:
- [x] [HIGH] Added input validation to `createPrediction()` with BadRequestException
- [x] [HIGH] Added try-catch error handling in `AiController.getPrediction()`
- [x] [MED] Added NotFoundException in `PredictionsController.findOne()`
- [x] [MED] Added @IsOptional() decorator to DTO prediction_hash
- [x] [MED] Added @Index() decorator to region_id column
- [x] [MED] CreatePredictionDto acknowledged as intentionally unused (creation via AiController)

### File List

**New Files:**
- `backend/src/entities/prediction.entity.ts`
- `backend/src/modules/predictions/predictions.module.ts`
- `backend/src/modules/predictions/predictions.service.ts`
- `backend/src/modules/predictions/predictions.controller.ts`
- `backend/src/modules/predictions/dto/create-prediction.dto.ts`
- `backend/src/modules/predictions/predictions.service.spec.ts`
- `backend/src/modules/predictions/predictions.controller.spec.ts`

**Modified Files:**
- `backend/src/app.module.ts` (added PredictionsModule import)
- `backend/src/modules/ai/ai.module.ts` (import PredictionsModule)
- `backend/src/modules/ai/ai.controller.ts` (inject PredictionsService, persist predictions, error handling)
- `backend/src/modules/ai/ai.controller.spec.ts` (added PredictionsService mock)
- `backend/src/modules/ai/ai.service.spec.ts` (updated test for fallback behavior)

## Change Log

- 2024-12-24: Implemented Story 2.6 - Prediction Entity & Hash Generation (All 5 tasks complete)
- 2024-12-24: Code review fixes applied - input validation, error handling, 404 response, DTO decorator, index decorator
