import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prediction } from '../../entities/prediction.entity';
import { createHash } from 'crypto';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class PredictionsService {
    private readonly logger = new Logger(PredictionsService.name);

    constructor(
        @InjectRepository(Prediction)
        private readonly predictionRepository: Repository<Prediction>,
        private readonly blockchainService: BlockchainService,
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
        if (!officialId) {
            throw new BadRequestException('Official ID is required');
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
            created_by_official_id: officialId,
        });

        const saved = await this.predictionRepository.save(prediction);
        this.logger.log(`Prediction saved: ${saved.id} with hash ${saved.prediction_hash}`);

        // Non-blocking blockchain recording (Fire and forget with error logging)
        this.recordHashOnChain(saved).catch(err => {
            this.logger.error(`Failed to record hash on-chain for prediction ${saved.id}: ${err.message}`);
        });

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

    private async recordHashOnChain(prediction: Prediction): Promise<void> {
        this.logger.debug(`Initiating blockchain recording for prediction ${prediction.id}`);
        try {
            const txHash = await this.blockchainService.addPredictionHash(prediction.region_id, prediction.prediction_hash);
            prediction.blockchain_tx_hash = txHash;
            await this.predictionRepository.save(prediction);
            this.logger.log(`Blockchain transaction recorded for prediction ${prediction.id}: ${txHash}`);
        } catch (error) {
            // Rethrow to be caught by the caller's .catch() block for logging
            throw error;
        }
    }
}
