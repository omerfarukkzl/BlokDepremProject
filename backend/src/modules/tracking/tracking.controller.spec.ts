import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';

describe('TrackingController', () => {
  let controller: TrackingController;
  let trackingService: any;

  const mockTrackingResult = {
    shipment: {
      id: 1,
      barcode: 'SHIP-12345678',
      status: 'Registered',
    },
    history: [
      { id: 1, status: 'Registered', timestamp: new Date() },
    ],
  };

  beforeEach(async () => {
    trackingService = {
      trackByBarcode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrackingController],
      providers: [
        {
          provide: TrackingService,
          useValue: trackingService,
        },
      ],
    }).compile();

    controller = module.get<TrackingController>(TrackingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('trackByBarcode', () => {
    it('should return success response with shipment data for valid barcode', async () => {
      trackingService.trackByBarcode.mockResolvedValue(mockTrackingResult);

      const result = await controller.trackByBarcode('SHIP-12345678');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTrackingResult);
      expect(result.timestamp).toBeDefined();
      expect(trackingService.trackByBarcode).toHaveBeenCalledWith('SHIP-12345678');
    });

    it('should throw BadRequestException for barcode shorter than 8 chars', async () => {
      await expect(controller.trackByBarcode('SHORT')).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.trackByBarcode('SHORT')).rejects.toThrow(
        'Barcode must be between 8 and 50 characters',
      );
    });

    it('should throw BadRequestException for empty barcode', async () => {
      await expect(controller.trackByBarcode('')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for barcode with invalid characters', async () => {
      await expect(controller.trackByBarcode('SHIP-123!@#')).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.trackByBarcode('SHIP-123!@#')).rejects.toThrow(
        'Barcode contains invalid characters',
      );
    });

    it('should throw BadRequestException for barcode longer than 50 chars', async () => {
      const longBarcode = 'A'.repeat(51);
      await expect(controller.trackByBarcode(longBarcode)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should propagate NotFoundException from service as 404', async () => {
      trackingService.trackByBarcode.mockRejectedValue(
        new NotFoundException('Shipment not found'),
      );

      await expect(controller.trackByBarcode('NOTFOUND-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should include ISO timestamp in response', async () => {
      trackingService.trackByBarcode.mockResolvedValue(mockTrackingResult);

      const result = await controller.trackByBarcode('SHIP-12345678');

      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});