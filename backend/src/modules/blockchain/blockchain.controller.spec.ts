import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';
import { BlockchainHistoryResponseDto, VerificationStatus } from './dto/blockchain-history.dto';

describe('BlockchainController', () => {
    let controller: BlockchainController;
    let blockchainService: jest.Mocked<BlockchainService>;

    beforeEach(async () => {
        const mockBlockchainService = {
            getShipmentHistory: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [BlockchainController],
            providers: [
                {
                    provide: BlockchainService,
                    useValue: mockBlockchainService,
                },
            ],
        }).compile();

        controller = module.get<BlockchainController>(BlockchainController);
        blockchainService = module.get(BlockchainService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getShipmentHistory', () => {
        it('should return blockchain history for valid barcode', async () => {
            const barcode = 'TEST-123';
            const mockResponse: BlockchainHistoryResponseDto = {
                barcode,
                blockchainRecordCount: 2,
                databaseRecordCount: 2,
                verificationStatus: VerificationStatus.MATCH,
                blockchainHistory: [
                    { status: 'Registered', timestamp: 1700000000, location: 'City A' },
                    { status: 'InTransit', timestamp: 1700001000, location: 'City B' },
                ],
            };

            blockchainService.getShipmentHistory.mockResolvedValue(mockResponse);

            const result = await controller.getShipmentHistory(barcode);

            expect(result).toEqual(mockResponse);
            expect(blockchainService.getShipmentHistory).toHaveBeenCalledWith(barcode);
        });

        it('should trim barcode before calling service', async () => {
            const barcode = '  TEST-TRIMMED  ';
            const mockResponse: BlockchainHistoryResponseDto = {
                barcode: 'TEST-TRIMMED',
                blockchainRecordCount: 0,
                databaseRecordCount: 0,
                verificationStatus: VerificationStatus.MATCH,
                blockchainHistory: [],
            };

            blockchainService.getShipmentHistory.mockResolvedValue(mockResponse);

            await controller.getShipmentHistory(barcode);

            expect(blockchainService.getShipmentHistory).toHaveBeenCalledWith('TEST-TRIMMED');
        });

        it('should throw NotFoundException for empty barcode', async () => {
            await expect(controller.getShipmentHistory('')).rejects.toThrow(NotFoundException);
            await expect(controller.getShipmentHistory('   ')).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when blockchain service is unavailable', async () => {
            blockchainService.getShipmentHistory.mockRejectedValue(
                new Error('Blockchain service is not available')
            );

            await expect(controller.getShipmentHistory('TEST')).rejects.toThrow(NotFoundException);
        });

        it('should re-throw non-blockchain errors', async () => {
            const networkError = new Error('Network timeout');
            blockchainService.getShipmentHistory.mockRejectedValue(networkError);

            await expect(controller.getShipmentHistory('TEST')).rejects.toThrow('Network timeout');
        });
    });
});
