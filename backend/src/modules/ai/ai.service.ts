import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError, timeout } from 'rxjs';
import { PredictionDto, PredictionResponseDto } from './dto/prediction.dto';
import { GetReportsStatsDto } from './dto/get-reports-stats.dto';
import { AxiosError } from 'axios';
import { PredictionsService } from '../predictions/predictions.service';

// Category keys used in prediction quantities
const CATEGORIES = ['tent', 'container', 'food_package', 'blanket'] as const;
type AidCategory = typeof CATEGORIES[number];

export interface AccuracyMetrics {
  totalPredictions: number;
  completedPredictions: number;
  averageAccuracy: number;
  accuracyByCategory: Record<string, number>;
  predictedVsActual: Array<{
    category: string;
    predicted: number;
    actual: number;
  }>;
  recentPredictions: Array<{
    id: string;
    regionName: string;
    accuracy: number;
    createdAt: string;
  }>;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  constructor(
    private readonly httpService: HttpService,
    private readonly predictionsService: PredictionsService,
  ) { }

  /**
   * Calculate accuracy for a single item prediction.
   * Formula: max(0, 100 - (|predicted - actual| / predicted * 100))
   * Edge case: If predicted is 0, return 100 if actual is 0, else 0.
   */
  calculateAccuracy(predicted: number, actual: number): number {
    if (predicted === 0) {
      return actual === 0 ? 100 : 0;
    }
    const accuracy = Math.max(0, 100 - (Math.abs(predicted - actual) / predicted * 100));
    // Round to 1 decimal place
    return Math.round(accuracy * 10) / 10;
  }

  /**
   * Get accuracy metrics from completed predictions for dashboard reports.
   * Queries predictions where actual_quantities IS NOT NULL.
   * Supports filtering by date range, region, and category. (Story 6.3)
   */
  async getAccuracyMetrics(filters?: GetReportsStatsDto): Promise<AccuracyMetrics> {
    const allPredictions = await this.predictionsService.findAll();
    let completedPredictions = allPredictions.filter(p => p.actual_quantities !== null);

    // Apply date range filter (filter by created_at)
    // Apply date range filter (filter by created_at)
    if (filters?.startDate) {
      // Ensure we compare start of day
      const filterStart = new Date(filters.startDate);
      filterStart.setHours(0, 0, 0, 0);
      completedPredictions = completedPredictions.filter(p => p.created_at >= filterStart);
    }
    if (filters?.endDate) {
      // Ensure we compare end of day
      const filterEnd = new Date(filters.endDate);
      filterEnd.setHours(23, 59, 59, 999);
      completedPredictions = completedPredictions.filter(p => p.created_at <= filterEnd);
    }

    // Apply region filter
    if (filters?.regionId) {
      completedPredictions = completedPredictions.filter(p => p.region_id === filters.regionId);
    }

    // Determine which categories to include in aggregation
    const categoriesToAggregate: readonly AidCategory[] = filters?.category
      ? [filters.category as AidCategory]
      : CATEGORIES;

    // Aggregate totals by category
    const categoryTotals: Record<string, { predicted: number; actual: number; accuracySum: number; count: number }> = {};
    for (const category of categoriesToAggregate) {
      categoryTotals[category] = { predicted: 0, actual: 0, accuracySum: 0, count: 0 };
    }

    let globalAccuracySum = 0;
    let globalAccuracyCount = 0;

    for (const prediction of completedPredictions) {
      const predicted = prediction.predicted_quantities || {};
      const actual = prediction.actual_quantities || {};

      for (const category of categoriesToAggregate) {
        const predictedVal = predicted[category] || 0;
        const actualVal = actual[category] || 0;

        categoryTotals[category].predicted += predictedVal;
        categoryTotals[category].actual += actualVal;

        if (predictedVal > 0 || actualVal > 0) {
          const accuracy = this.calculateAccuracy(predictedVal, actualVal);
          categoryTotals[category].accuracySum += accuracy;
          categoryTotals[category].count += 1;
          globalAccuracySum += accuracy;
          globalAccuracyCount += 1;
        }
      }
    }

    // Compute average accuracy per category
    const accuracyByCategory: Record<string, number> = {};
    for (const category of categoriesToAggregate) {
      const { accuracySum, count } = categoryTotals[category];
      accuracyByCategory[category] = count > 0 ? Math.round((accuracySum / count) * 10) / 10 : 0;
    }

    // Compute global average accuracy
    const averageAccuracy = globalAccuracyCount > 0
      ? Math.round((globalAccuracySum / globalAccuracyCount) * 10) / 10
      : 0;

    // Build predicted vs actual array
    const predictedVsActual = categoriesToAggregate.map(category => ({
      category: this.formatCategoryName(category),
      predicted: categoryTotals[category].predicted,
      actual: categoryTotals[category].actual,
    }));

    // Get recent completed predictions (limit to 10)
    const recentPredictions = completedPredictions
      .slice(0, 10)
      .map(p => ({
        id: String(p.id),
        regionName: p.region_id, // In future, could map to actual region name
        accuracy: p.accuracy ?? this.computePredictionAccuracy(p, categoriesToAggregate),
        createdAt: p.created_at.toISOString().split('T')[0],
      }));

    return {
      totalPredictions: allPredictions.length,
      completedPredictions: completedPredictions.length,
      averageAccuracy,
      accuracyByCategory,
      predictedVsActual,
      recentPredictions,
    };
  }

  /**
   * Compute overall accuracy for a single prediction (average of all category accuracies).
   * Accepts optional categories array for filtered accuracy calculation.
   */
  private computePredictionAccuracy(
    prediction: { predicted_quantities: Record<string, number>; actual_quantities: Record<string, number> | null },
    categories: readonly string[] = CATEGORIES
  ): number {
    if (!prediction.actual_quantities) return 0;

    let sum = 0;
    let count = 0;
    for (const category of categories) {
      const predicted = prediction.predicted_quantities[category] || 0;
      const actual = prediction.actual_quantities[category] || 0;
      if (predicted > 0 || actual > 0) {
        sum += this.calculateAccuracy(predicted, actual);
        count++;
      }
    }
    return count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
  }

  /**
   * Format category key to display name (e.g., food_package -> Food Package).
   */
  private formatCategoryName(category: string): string {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async getPrediction(predictionDto: PredictionDto): Promise<PredictionResponseDto> {
    try {
      // Enrich DTO with mock stats if missing (Prototype logic)
      // In production, this would fetch from LocationsService/Database
      const enrichedDto = {
        ...predictionDto,
        population: predictionDto.population || 100000,
        collapsed_buildings: predictionDto.collapsed_buildings || 500,
        urgent_demolition: predictionDto.urgent_demolition || 200,
        severely_damaged: predictionDto.severely_damaged || 1000,
        moderately_damaged: predictionDto.moderately_damaged || 2000,
        population_change: predictionDto.population_change || -10000,
        max_magnitude: predictionDto.max_magnitude || 7.8,
        earthquake_count: predictionDto.earthquake_count || 50,
        damage_ratio: predictionDto.damage_ratio || 0.45
      };

      const { data } = await firstValueFrom(
        this.httpService.post<PredictionResponseDto>(
          `${this.aiServiceUrl}/predict`,
          enrichedDto,
          { timeout: 10000 } // 10s timeout (NFR1)
        ).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`AI Service Error: ${error.message}`);
            throw 'AI_SERVICE_ERROR';
          }),
        ),
      );
      return data;
    } catch (error) {
      this.logger.warn(`AI Service unavailable: ${error}`);
      // Graceful degradation / Error handling (NFR3)
      this.logger.warn(`AI Service unavailable: ${error}. Using fallback mock data.`);

      // Fallback mock data for prototype resilience
      return {
        success: true,
        data: {
          predictions: {
            tent: 150,
            container: 50,
            food_package: 1000,
            blanket: 500
          },
          confidence: 0.85,
          prediction_hash: 'mock-fallback-' + Date.now(),
          region_id: predictionDto.region_id
        },
        timestamp: new Date().toISOString()
      } as any;
    }
  }

  async getDistributionSuggestions(): Promise<any> {
    // Mock response
    return {
      message: 'AI distribution suggestions are not yet implemented.',
      suggestions: [
        {
          from: 'Istanbul',
          to: 'Ankara',
          items: ['Water', 'Food'],
          priority: 1,
        },
        {
          from: 'Izmir',
          to: 'Antalya',
          items: ['Tents', 'Blankets'],
          priority: 2,
        },
      ],
    };
  }
}
