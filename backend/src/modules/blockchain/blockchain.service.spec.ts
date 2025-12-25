import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockchainService } from './blockchain.service';
import { TrackingLog } from '../../entities/tracking-log.entity';
import { Shipment } from '../../entities/shipment.entity';
import { VerificationStatus } from './dto/blockchain-history.dto';
import { ethers } from 'ethers';

// Mock ethers
jest.mock('ethers');

describe('BlockchainService', () => {
    let service: BlockchainService;
    let configService: ConfigService;
    let mockTrackingLogRepository: jest.Mocked<Repository<TrackingLog>>;
    let mockShipmentRepository: jest.Mocked<Repository<Shipment>>;
    let mockProvider: any;
    let mockWallet: any;
    let mockContract: any;

    beforeEach(async () => {
        // Reset mocks
        jest.clearAllMocks();

        mockProvider = {
            getNetwork: jest.fn().mockResolvedValue({ chainId: 11155111, name: 'sepolia' }),
        };
        (ethers.JsonRpcProvider as unknown as jest.Mock).mockImplementation(() => mockProvider);

        mockWallet = {
            connect: jest.fn(),
        };
        (ethers.Wallet as unknown as jest.Mock).mockImplementation(() => mockWallet);

        mockContract = {
            addPredictionHash: jest.fn().mockResolvedValue({
                hash: '0xtxhash',
                wait: jest.fn().mockResolvedValue({ status: 1, blockNumber: 12345 })
            }),
            addShipmentLog: jest.fn().mockResolvedValue({
                hash: '0xtxhash',
                wait: jest.fn().mockResolvedValue({ status: 1, blockNumber: 12345 })
            }),
            getShipmentHistory: jest.fn().mockResolvedValue([]),
        };
        (ethers.Contract as unknown as jest.Mock).mockImplementation(() => mockContract);

        mockTrackingLogRepository = {
            find: jest.fn(),
            findOne: jest.fn(),
        } as any;

        mockShipmentRepository = {
            find: jest.fn(),
            findOne: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BlockchainService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key) => {
                            if (key === 'SEPOLIA_RPC_URL') return 'https://sepolia.infura.io/v3/test';
                            if (key === 'BACKEND_WALLET_PRIVATE_KEY') return '0x0123456789012345678901234567890123456789012345678901234567890123';
                            if (key === 'BLOCKCHAIN_CONTRACT_ADDRESS') return '0xTestContractAddress';
                            return null;
                        }),
                    },
                },
                {
                    provide: getRepositoryToken(TrackingLog),
                    useValue: mockTrackingLogRepository,
                },
                {
                    provide: getRepositoryToken(Shipment),
                    useValue: mockShipmentRepository,
                },
            ],
        }).compile();

        service = module.get<BlockchainService>(BlockchainService);
        configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('onModuleInit', () => {
        it('should initialize provider, wallet, and contract', async () => {
            await service.onModuleInit();
            expect(ethers.JsonRpcProvider).toHaveBeenCalledWith('https://sepolia.infura.io/v3/test');
            expect(ethers.Wallet).toHaveBeenCalledWith(expect.any(String), mockProvider);
            expect(ethers.Contract).toHaveBeenCalled();
            expect(mockProvider.getNetwork).toHaveBeenCalled();
        });

        it('should handle initialization errors gracefully', async () => {
            mockProvider.getNetwork.mockRejectedValueOnce(new Error('Network error'));
            const loggerSpy = jest.spyOn(Logger.prototype, 'warn');

            await service.onModuleInit();

            expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to initialize blockchain connection'));
        });
    });

    describe('addPredictionHash', () => {
        beforeEach(async () => {
            // Must init to set isConnected = true for other tests
            await service.onModuleInit();
        });

        it('should call contract.addPredictionHash', async () => {
            const regionId = 'Turkey-Hatay';
            const hash = '0x1234567890123456789012345678901234567890123456789012345678901234';
            await service.addPredictionHash(regionId, hash);
            expect(mockContract.addPredictionHash).toHaveBeenCalledWith(regionId, hash);
        });

        it('should retry on failure', async () => {
            mockContract.addPredictionHash
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({
                    hash: '0xsuccess',
                    wait: jest.fn().mockResolvedValue({ status: 1, blockNumber: 123 })
                });

            const regionId = 'Turkey-Hatay';
            const hash = '0x1234567890123456789012345678901234567890123456789012345678901234';

            await service.addPredictionHash(regionId, hash);
            expect(mockContract.addPredictionHash).toHaveBeenCalledTimes(3);
        });
    });

    describe('getShipmentHistory', () => {
        beforeEach(async () => {
            await service.onModuleInit();
        });

        it('should return MATCH when both blockchain and DB have matching records', async () => {
            const barcode = 'TEST-123';
            const mockBlockchainLogs = [
                { status: 'Registered', timestamp: BigInt(1700000000), location: 'Source Location' },
                { status: 'InTransit', timestamp: BigInt(1700001000), location: 'Transit Hub' },
            ];
            mockContract.getShipmentHistory.mockResolvedValue(mockBlockchainLogs);

            const mockShipment = { id: 1, barcode } as Shipment;
            mockShipmentRepository.findOne.mockResolvedValue(mockShipment);

            const mockDbLogs = [
                { id: 1, status: 'Registered', timestamp: new Date(1700000000 * 1000) } as TrackingLog,
                { id: 2, status: 'InTransit', timestamp: new Date(1700001000 * 1000) } as TrackingLog,
            ];
            mockTrackingLogRepository.find.mockResolvedValue(mockDbLogs);

            const result = await service.getShipmentHistory(barcode);

            expect(result.barcode).toBe(barcode);
            expect(result.blockchainRecordCount).toBe(2);
            expect(result.databaseRecordCount).toBe(2);
            expect(result.verificationStatus).toBe(VerificationStatus.MATCH);
            expect(result.blockchainHistory).toHaveLength(2);
            expect(result.blockchainHistory[0].status).toBe('Registered');
            expect(result.blockchainHistory[0].timestamp).toBe(1700000000);
            expect(result.blockchainHistory[0].location).toBe('Source Location');
        });

        it('should return MISMATCH when statuses differ', async () => {
            const barcode = 'TEST-456';
            const mockBlockchainLogs = [
                { status: 'Registered', timestamp: BigInt(1700000000), location: 'Location' },
            ];
            mockContract.getShipmentHistory.mockResolvedValue(mockBlockchainLogs);

            const mockShipment = { id: 1, barcode } as Shipment;
            mockShipmentRepository.findOne.mockResolvedValue(mockShipment);

            const mockDbLogs = [
                { id: 1, status: 'Delivered', timestamp: new Date(1700000000 * 1000) } as TrackingLog, // Different status
            ];
            mockTrackingLogRepository.find.mockResolvedValue(mockDbLogs);

            const result = await service.getShipmentHistory(barcode);

            expect(result.verificationStatus).toBe(VerificationStatus.MISMATCH);
        });

        it('should return PARTIAL when record counts differ', async () => {
            const barcode = 'TEST-789';
            const mockBlockchainLogs = [
                { status: 'Registered', timestamp: BigInt(1700000000), location: 'Location' },
            ];
            mockContract.getShipmentHistory.mockResolvedValue(mockBlockchainLogs);

            const mockShipment = { id: 1, barcode } as Shipment;
            mockShipmentRepository.findOne.mockResolvedValue(mockShipment);

            const mockDbLogs = [
                { id: 1, status: 'Registered', timestamp: new Date(1700000000 * 1000) } as TrackingLog,
                { id: 2, status: 'InTransit', timestamp: new Date() } as TrackingLog, // Extra record
            ];
            mockTrackingLogRepository.find.mockResolvedValue(mockDbLogs);

            const result = await service.getShipmentHistory(barcode);

            expect(result.verificationStatus).toBe(VerificationStatus.PARTIAL);
            expect(result.blockchainRecordCount).toBe(1);
            expect(result.databaseRecordCount).toBe(2);
        });

        it('should return NO_BLOCKCHAIN_RECORDS when blockchain has no records but DB does', async () => {
            const barcode = 'TEST-NOBLOCKCHAIN';
            mockContract.getShipmentHistory.mockResolvedValue([]);

            const mockShipment = { id: 1, barcode } as Shipment;
            mockShipmentRepository.findOne.mockResolvedValue(mockShipment);

            const mockDbLogs = [
                { id: 1, status: 'Registered', timestamp: new Date() } as TrackingLog,
            ];
            mockTrackingLogRepository.find.mockResolvedValue(mockDbLogs);

            const result = await service.getShipmentHistory(barcode);

            expect(result.verificationStatus).toBe(VerificationStatus.NO_BLOCKCHAIN_RECORDS);
        });

        it('should return NO_DB_RECORDS when blockchain has records but shipment not in DB', async () => {
            const barcode = 'TEST-NODB';
            const mockBlockchainLogs = [
                { status: 'Registered', timestamp: BigInt(1700000000), location: 'Location' },
            ];
            mockContract.getShipmentHistory.mockResolvedValue(mockBlockchainLogs);

            mockShipmentRepository.findOne.mockResolvedValue(null);

            const result = await service.getShipmentHistory(barcode);

            expect(result.verificationStatus).toBe(VerificationStatus.NO_DB_RECORDS);
            expect(result.databaseRecordCount).toBe(0);
        });

        it('should throw error when blockchain service is not connected', async () => {
            // Create a new service without initialization
            const uninitializedService = new BlockchainService(
                configService,
                mockTrackingLogRepository,
                mockShipmentRepository,
            );

            await expect(uninitializedService.getShipmentHistory('TEST')).rejects.toThrow(
                'Blockchain service is not available'
            );
        });

        it('should correctly map blockchain Log structs to DTOs', async () => {
            const barcode = 'TEST-MAPPING';
            const mockBlockchainLogs = [
                { status: 'Registered', timestamp: BigInt(1700000000), location: 'City A' },
                { status: 'InTransit', timestamp: BigInt(1700001000), location: 'City B' },
                { status: 'Delivered', timestamp: BigInt(1700002000), location: 'City C' },
            ];
            mockContract.getShipmentHistory.mockResolvedValue(mockBlockchainLogs);
            mockShipmentRepository.findOne.mockResolvedValue(null);

            const result = await service.getShipmentHistory(barcode);

            expect(result.blockchainHistory).toHaveLength(3);
            expect(result.blockchainHistory[0]).toEqual({
                status: 'Registered',
                timestamp: 1700000000,
                location: 'City A',
            });
            expect(result.blockchainHistory[1]).toEqual({
                status: 'InTransit',
                timestamp: 1700001000,
                location: 'City B',
            });
            expect(result.blockchainHistory[2]).toEqual({
                status: 'Delivered',
                timestamp: 1700002000,
                location: 'City C',
            });
        });
    });
});

