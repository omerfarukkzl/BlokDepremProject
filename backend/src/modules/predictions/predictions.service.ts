import { Injectable, Logger, BadRequestException } from '@nestjs/common';
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
    ) { }

    async createPrediction(
        regionId: string,
        predictedQuantities: Record<string, number>,
        confidence: number,
        officialId: number,
        predictionHash?: string,
    ): Promise<Prediction> {
        this.logger.debug(`Creating prediction: regionId=${regionId}, officialId=${officialId}, confidence=${confidence}`);

        // Input validation - more lenient for prototype
        if (!regionId || regionId.trim() === '') {
            throw new BadRequestException('Region ID is required');
        }
        if (!predictedQuantities || Object.keys(predictedQuantities).length === 0) {
            throw new BadRequestException('Predicted quantities are required');
        }
        // Allow officialId = 0 for testing, just log warning
        if (!officialId && officialId !== 0) {
            this.logger.warn(`No officialId provided, using default 0`);
            officialId = 0;
        }
        if (typeof confidence !== 'number' || confidence < 0 || confidence > 1) {
            this.logger.warn(`Invalid confidence ${confidence}, clamping to valid range`);
            confidence = Math.max(0, Math.min(1, confidence || 0.5));
        }

        const hash = predictionHash || this.generateHash(predictedQuantities, regionId);

        const prediction = this.predictionRepository.create({
            region_id: regionId,
            predicted_quantities: predictedQuantities,
            confidence,
            prediction_hash: hash,
            created_by_official_id: officialId || null,
        });

        const saved = await this.predictionRepository.save(prediction);
        this.logger.log(`Prediction saved: ${saved.id} with hash ${saved.prediction_hash}`);
        return saved;
    }

    /**
     * SHA-256 hash matching FastAPI: json.dumps(data, sort_keys=True)
     * CRITICAL: Must recursively sort keys for nested objects
     */
    generateHash(predictions: Record<string, number>, regionId: string): string {
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

    async findAll(): Promise<Prediction[]> {
        return this.predictionRepository.find({
            order: { created_at: 'DESC' },
        });
    }
}
