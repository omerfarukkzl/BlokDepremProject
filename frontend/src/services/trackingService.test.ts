import { describe, it, expect } from 'vitest';
import trackingService from './trackingService';

describe('TrackingService', () => {
    describe('validateBarcode', () => {
        it('should return valid for correct format BD-YYYY-XXXXX', () => {
            const result = trackingService.validateBarcode('BD-2025-00001');
            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should be case-insensitive for barcode validation', () => {
            const result = trackingService.validateBarcode('bd-2025-00001');
            expect(result.isValid).toBe(true);
        });

        it('should return invalid for empty barcode', () => {
            const result = trackingService.validateBarcode('');
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Barkod gereklidir');
        });

        it('should return invalid for missing BD prefix', () => {
            const result = trackingService.validateBarcode('XX-2025-00001');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Geçersiz barkod formatı');
        });

        it('should return invalid for wrong year format (3 digits)', () => {
            const result = trackingService.validateBarcode('BD-202-00001');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Geçersiz barkod formatı');
        });

        it('should return invalid for wrong sequence format (4 digits)', () => {
            const result = trackingService.validateBarcode('BD-2025-0001');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Geçersiz barkod formatı');
        });

        it('should return invalid for missing dashes', () => {
            const result = trackingService.validateBarcode('BD202500001');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Geçersiz barkod formatı');
        });

        it('should return invalid for year before 2020', () => {
            const result = trackingService.validateBarcode('BD-2019-00001');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('2020-2099');
        });

        it('should return invalid for year after 2099', () => {
            const result = trackingService.validateBarcode('BD-2100-00001');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('2020-2099');
        });

        it('should accept valid barcodes from different years', () => {
            expect(trackingService.validateBarcode('BD-2020-00001').isValid).toBe(true);
            expect(trackingService.validateBarcode('BD-2024-12345').isValid).toBe(true);
            expect(trackingService.validateBarcode('BD-2099-99999').isValid).toBe(true);
        });

        it('should accept alphanumeric barcodes', () => {
            const result = trackingService.validateBarcode('BD-2025-NOA7E');
            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should trim whitespace from barcode', () => {
            const result = trackingService.validateBarcode('  BD-2025-00001  ');
            expect(result.isValid).toBe(true);
        });

        it('should return invalid for barcodes with extra characters', () => {
            const result = trackingService.validateBarcode('BD-2025-00001-extra');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Geçersiz barkod formatı');
        });

        it('should return invalid for old BK format', () => {
            const result = trackingService.validateBarcode('BK-2024-001');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Geçersiz barkod formatı');
        });
    });
});
