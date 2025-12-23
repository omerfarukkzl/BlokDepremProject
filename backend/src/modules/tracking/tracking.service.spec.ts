import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { Shipment } from '../../entities/shipment.entity';
import { TrackingLog } from '../../entities/tracking-log.entity';

describe('TrackingService', () => {
  let service: TrackingService;
  let shipmentRepository: any;
  let trackingLogRepository: any;

  const mockShipment: Partial<Shipment> = {
    id: 1,
    barcode: 'SHIP-12345678',
    status: 'Registered',
    source_location_id: 1,
    destination_location_id: 2,
    created_by_official_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockTrackingLogs: Partial<TrackingLog>[] = [
    {
      id: 1,
      shipment_id: 1,
      status: 'Registered',
      timestamp: new Date('2025-01-01T10:00:00Z'),
    },
    {
      id: 2,
      shipment_id: 1,
      status: 'InTransit',
      timestamp: new Date('2025-01-02T10:00:00Z'),
    },
  ];

  beforeEach(async () => {
    shipmentRepository = {
      findOne: jest.fn(),
    };
    trackingLogRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingService,
        {
          provide: getRepositoryToken(Shipment),
          useValue: shipmentRepository,
        },
        {
          provide: getRepositoryToken(TrackingLog),
          useValue: trackingLogRepository,
        },
      ],
    }).compile();

    service = module.get<TrackingService>(TrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('trackByBarcode', () => {
    it('should return shipment with history for valid barcode', async () => {
      shipmentRepository.findOne.mockResolvedValue(mockShipment);
      trackingLogRepository.find.mockResolvedValue(mockTrackingLogs);

      const result = await service.trackByBarcode('SHIP-12345678');

      expect(result.shipment).toEqual(mockShipment);
      expect(result.history).toEqual(mockTrackingLogs);
      expect(shipmentRepository.findOne).toHaveBeenCalledWith({
        where: { barcode: 'SHIP-12345678' },
        relations: ['sourceLocation', 'destinationLocation', 'official'],
      });
      expect(trackingLogRepository.find).toHaveBeenCalledWith({
        where: { shipment_id: 1 },
        order: { timestamp: 'DESC' },
      });
    });

    it('should throw NotFoundException when barcode not found', async () => {
      shipmentRepository.findOne.mockResolvedValue(null);

      await expect(service.trackByBarcode('INVALID-BARCODE')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.trackByBarcode('INVALID-BARCODE')).rejects.toThrow(
        'Shipment with barcode INVALID-BARCODE not found',
      );
    });

    it('should query tracking logs ordered by timestamp DESC', async () => {
      shipmentRepository.findOne.mockResolvedValue(mockShipment);
      trackingLogRepository.find.mockResolvedValue(mockTrackingLogs);

      await service.trackByBarcode('SHIP-12345678');

      expect(trackingLogRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { timestamp: 'DESC' },
        }),
      );
    });
  });
});