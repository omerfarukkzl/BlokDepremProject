import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';
import { ethers } from 'ethers';

// Mock ethers
jest.mock('ethers');

describe('BlockchainService', () => {
    let service: BlockchainService;
    let configService: ConfigService;
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
        };
        (ethers.Contract as unknown as jest.Mock).mockImplementation(() => mockContract);

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

});
