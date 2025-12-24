import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { Shipment } from '../../entities/shipment.entity';
import { ShipmentDetail } from '../../entities/shipment-detail.entity';
import { TrackingLog } from '../../entities/tracking-log.entity';
import { BlockchainService } from '../blockchain/blockchain.service';

describe('ShipmentsService', () => {
  let service: ShipmentsService;
  let shipmentRepository: jest.Mocked<Repository<Shipment>>;
  let shipmentDetailRepository: jest.Mocked<Repository<ShipmentDetail>>;
  let trackingLogRepository: jest.Mocked<Repository<TrackingLog>>;
  let blockchainService: jest.Mocked<BlockchainService>;

  const createMockRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  });

  beforeEach(async () => {
    const mockBlockchainService = {
      addShipmentLog: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentsService,
        {
          provide: getRepositoryToken(Shipment),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(ShipmentDetail),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(TrackingLog),
          useValue: createMockRepository(),
        },
        {
          provide: BlockchainService,
          useValue: mockBlockchainService,
        },
      ],
    }).compile();

    service = module.get<ShipmentsService>(ShipmentsService);
    shipmentRepository = module.get(getRepositoryToken(Shipment));
    shipmentDetailRepository = module.get(getRepositoryToken(ShipmentDetail));
    trackingLogRepository = module.get(getRepositoryToken(TrackingLog));
    blockchainService = module.get(BlockchainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createShipmentDto = {
      source_location_id: 1,
      destination_location_id: 2,
      items: [{ item_id: 1, quantity: 10 }],
    };
    const userId = 1;

    const mockSourceLocation = { id: 1, name: 'Istanbul Warehouse' };
    const mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    beforeEach(() => {
      shipmentRepository.create.mockReturnValue({ id: 1, barcode: 'SHIP-123' } as Shipment);
      shipmentRepository.save.mockResolvedValue({ id: 1, barcode: 'SHIP-123' } as Shipment);
      shipmentRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getOne.mockResolvedValue({ sourceLocation: mockSourceLocation });

      shipmentDetailRepository.create.mockReturnValue({} as ShipmentDetail);
      shipmentDetailRepository.save.mockResolvedValue([] as unknown as ShipmentDetail);
      trackingLogRepository.create.mockReturnValue({ id: 1 } as TrackingLog);
      trackingLogRepository.save.mockResolvedValue({ id: 1, transaction_hash: 'pending' } as TrackingLog);
    });

    it('should create a shipment and call blockchain service with location name', async () => {
      blockchainService.addShipmentLog.mockResolvedValue('0xabc123');

      const result = await service.create(createShipmentDto, userId);

      expect(result).toBeDefined();
      expect(shipmentRepository.save).toHaveBeenCalled();
      expect(trackingLogRepository.save).toHaveBeenCalled();
      expect(blockchainService.addShipmentLog).toHaveBeenCalledWith(
        expect.stringContaining('SHIP-'),
        'Registered',
        'Istanbul Warehouse', // Actual location name from mock
      );
    });

    it('should use fallback location format when location name not available', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null); // No location found
      blockchainService.addShipmentLog.mockResolvedValue('0xabc123');

      await service.create(createShipmentDto, userId);

      expect(blockchainService.addShipmentLog).toHaveBeenCalledWith(
        expect.stringContaining('SHIP-'),
        'Registered',
        'location_1', // Fallback format
      );
    });

    it('should update transaction hash after blockchain success', async () => {
      blockchainService.addShipmentLog.mockResolvedValue('0xabc123');

      await service.create(createShipmentDto, userId);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify transaction hash was updated
      expect(trackingLogRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ transaction_hash: '0xabc123' })
      );
    });

    it('should succeed even when blockchain fails', async () => {
      blockchainService.addShipmentLog.mockRejectedValue(new Error('Blockchain unavailable'));

      const result = await service.create(createShipmentDto, userId);

      expect(result).toBeDefined();
      expect(shipmentRepository.save).toHaveBeenCalled();
      // Shipment creation should succeed despite blockchain failure
    });
  });

  describe('updateStatus', () => {
    const updateStatusDto = { barcode: 'SHIP-123', status: 'Delivered' };
    const mockShipment = {
      id: 1,
      barcode: 'SHIP-123',
      status: 'InTransit',
      source_location_id: 1,
      destination_location_id: 2,
      sourceLocation: { id: 1, name: 'Istanbul Warehouse' },
      destinationLocation: { id: 2, name: 'Ankara Distribution Center' },
    } as Shipment;

    beforeEach(() => {
      shipmentRepository.findOne.mockResolvedValue(mockShipment);
      shipmentRepository.save.mockResolvedValue({ ...mockShipment, status: 'Delivered' } as Shipment);
      trackingLogRepository.create.mockReturnValue({ id: 1 } as TrackingLog);
      trackingLogRepository.save.mockResolvedValue({ id: 1, transaction_hash: 'pending' } as TrackingLog);
    });

    it('should update status and call blockchain with destination location name', async () => {
      blockchainService.addShipmentLog.mockResolvedValue('0xdef456');

      const result = await service.updateStatus(updateStatusDto);

      expect(result.status).toBe('Delivered');
      expect(blockchainService.addShipmentLog).toHaveBeenCalledWith(
        'SHIP-123',
        'Delivered',
        'Ankara Distribution Center', // Actual destination name
      );
    });

    it('should use source location name for InTransit status', async () => {
      blockchainService.addShipmentLog.mockResolvedValue('0xdef456');

      await service.updateStatus({ barcode: 'SHIP-123', status: 'InTransit' });

      expect(blockchainService.addShipmentLog).toHaveBeenCalledWith(
        'SHIP-123',
        'InTransit',
        'Istanbul Warehouse', // Actual source name
      );
    });

    it('should use fallback location format when location name not available', async () => {
      const shipmentWithoutLocations = { ...mockShipment, destinationLocation: null } as any;
      shipmentRepository.findOne.mockResolvedValue(shipmentWithoutLocations);
      blockchainService.addShipmentLog.mockResolvedValue('0xdef456');

      await service.updateStatus(updateStatusDto);

      expect(blockchainService.addShipmentLog).toHaveBeenCalledWith(
        'SHIP-123',
        'Delivered',
        'location_2', // Fallback when destinationLocation is null
      );
    });

    it('should update transaction hash after blockchain success', async () => {
      blockchainService.addShipmentLog.mockResolvedValue('0xdef789');

      await service.updateStatus(updateStatusDto);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify transaction hash was updated
      expect(trackingLogRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ transaction_hash: '0xdef789' })
      );
    });

    it('should succeed even when blockchain fails', async () => {
      blockchainService.addShipmentLog.mockRejectedValue(new Error('Network error'));

      const result = await service.updateStatus(updateStatusDto);

      expect(result).toBeDefined();
      expect(result.status).toBe('Delivered');
      // Status update should succeed despite blockchain failure
    });

    it('should throw NotFoundException when shipment not found', async () => {
      shipmentRepository.findOne.mockResolvedValue(null);

      await expect(service.updateStatus(updateStatusDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getRecentShipments', () => {
    it('should return recent shipments for a user', async () => {
      const mockShipments = [{ id: 1 }, { id: 2 }] as Shipment[];
      shipmentRepository.find.mockResolvedValue(mockShipments);

      const result = await service.getRecentShipments(1);

      expect(result).toEqual(mockShipments);
      expect(shipmentRepository.find).toHaveBeenCalledWith({
        where: { created_by_official_id: 1 },
        relations: ['sourceLocation', 'destinationLocation', 'official'],
        order: { created_at: 'DESC' },
        take: 10,
      });
    });
  });

  describe('getShipmentItems', () => {
    it('should return shipment items', async () => {
      const mockItems = [{ id: 1 }] as ShipmentDetail[];
      shipmentDetailRepository.find.mockResolvedValue(mockItems);

      const result = await service.getShipmentItems(1);

      expect(result).toEqual(mockItems);
      expect(shipmentDetailRepository.find).toHaveBeenCalledWith({
        where: { shipment_id: 1 },
        relations: ['item'],
      });
    });
  });
});