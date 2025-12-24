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
        // Input validation
        if (!regionId || regionId.trim() === '') {
            throw new BadRequestException('Region ID is required');
        }
        if (!predictedQuantities || Object.keys(predictedQuantities).length === 0) {
            throw new BadRequestException('Predicted quantities are required');
        }
        if (!officialId || officialId <= 0) {
            throw new BadRequestException('Valid official ID is required');
        }
        if (confidence < 0 || confidence > 1) {
            throw new BadRequestException('Confidence must be between 0 and 1');
        }

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
