import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
import BlokDepremAbi from './contracts/BlokDeprem.abi.json';
import { TrackingLog } from '../../entities/tracking-log.entity';
import { Shipment } from '../../entities/shipment.entity';
import {
    BlockchainHistoryResponseDto,
    BlockchainLogDto,
    VerificationStatus,
} from './dto/blockchain-history.dto';

@Injectable()
export class BlockchainService implements OnModuleInit {
    private readonly logger = new Logger(BlockchainService.name);
    private provider: ethers.JsonRpcProvider;
    private wallet: ethers.Wallet;
    private contract: ethers.Contract;
    private isConnected = false;

    constructor(
        private configService: ConfigService,
        @InjectRepository(TrackingLog)
        private readonly trackingLogRepository: Repository<TrackingLog>,
        @InjectRepository(Shipment)
        private readonly shipmentRepository: Repository<Shipment>,
    ) { }

    async onModuleInit() {
        this.logger.log('Initializing BlockchainService...');

        const rpcUrl = this.configService.get<string>('SEPOLIA_RPC_URL');
        const privateKey = this.configService.get<string>('BACKEND_WALLET_PRIVATE_KEY');
        const contractAddress = this.configService.get<string>('BLOCKCHAIN_CONTRACT_ADDRESS');

        if (!rpcUrl || !privateKey || !contractAddress) {
            this.logger.warn('Blockchain configuration missing. Blockchain features will be disabled.');
            return;
        }

        try {
            this.provider = new ethers.JsonRpcProvider(rpcUrl);
            this.wallet = new ethers.Wallet(privateKey, this.provider);
            this.contract = new ethers.Contract(contractAddress, BlokDepremAbi, this.wallet);

            const network = await this.provider.getNetwork();
            this.logger.log(`Connected to blockchain network: ${network.name} (chainId: ${network.chainId})`);
            this.isConnected = true;
        } catch (error) {
            this.logger.warn(`Failed to initialize blockchain connection: ${error.message}. Blockchain features will be disabled.`);
            // Graceful degradation: Do not throw error, allow app to start
        }
    }

    async addPredictionHash(regionId: string, hash: string): Promise<string> {
        this.ensureConnection();
        return this.executeWithRetry(async () => {
            this.logger.debug(`Adding prediction hash for ${regionId}: ${hash}`);
            const tx = await this.contract.addPredictionHash(regionId, hash);
            this.logger.log(`Transaction sent: ${tx.hash}`);
            this.monitorTransaction(tx);
            return tx.hash;
        });
    }

    async addShipmentLog(barcode: string, status: string, location: string): Promise<string> {
        this.ensureConnection();
        return this.executeWithRetry(async () => {
            this.logger.debug(`Adding shipment log for ${barcode}: ${status} at ${location}`);
            const tx = await this.contract.addShipmentLog(barcode, status, location);
            this.logger.log(`Transaction sent: ${tx.hash}`);
            this.monitorTransaction(tx);
            return tx.hash;
        });
    }

    private ensureConnection() {
        if (!this.isConnected) {
            throw new Error('Blockchain service is not available (checking DB-only mode fallback)');
        }
    }

    private monitorTransaction(tx: ethers.TransactionResponse) {
        // Fire-and-forget monitoring
        tx.wait()
            .then((receipt) => {
                if (receipt && receipt.status === 1) {
                    this.logger.log(`Transaction confirmed: ${tx.hash} (Block: ${receipt.blockNumber})`);
                } else {
                    this.logger.error(`Transaction failed on-chain: ${tx.hash}`);
                }
            })
            .catch((error) => {
                this.logger.error(`Error waiting for transaction ${tx.hash}: ${error.message}`);
            });
    }

    private async executeWithRetry<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            if (retries > 0) {
                this.logger.warn(`Blockchain operation failed, retrying... (${retries} attempts left). Error: ${error.message}`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.executeWithRetry(operation, retries - 1, delay * 2);
            } else {
                this.logger.error(`Blockchain operation failed after all retries. Error: ${error.message}`);
                throw error;
            }
        }
    }

    /**
     * Retrieves shipment history from the blockchain and verifies against database records.
     * @param barcode - The shipment barcode to query
     * @returns BlockchainHistoryResponseDto with history and verification status
     */
    async getShipmentHistory(barcode: string): Promise<BlockchainHistoryResponseDto> {
        this.ensureConnection();

        // Call the smart contract to get blockchain history
        const blockchainLogs = await this.contract.getShipmentHistory(barcode);

        // Map blockchain data to DTO format
        // The contract returns an array of Log structs: { status, timestamp, location }
        const blockchainHistory: BlockchainLogDto[] = blockchainLogs.map((log: { status: string; timestamp: bigint; location: string }) => ({
            status: log.status,
            timestamp: Number(log.timestamp), // Convert BigInt to number
            location: log.location,
        }));

        // Get database records for verification
        const shipment = await this.shipmentRepository.findOne({
            where: { barcode },
        });

        let databaseRecordCount = 0;
        let verificationStatus: VerificationStatus;

        if (shipment) {
            const dbLogs = await this.trackingLogRepository.find({
                where: { shipment_id: shipment.id },
                order: { timestamp: 'ASC' },
            });
            databaseRecordCount = dbLogs.length;

            // Determine verification status
            // Determine verification status
            if (blockchainHistory.length === 0 && databaseRecordCount === 0) {
                verificationStatus = VerificationStatus.MATCH;
            } else if (blockchainHistory.length === 0) {
                verificationStatus = VerificationStatus.NO_BLOCKCHAIN_RECORDS;
            } else if (databaseRecordCount === 0) {
                verificationStatus = VerificationStatus.NO_DB_RECORDS;
            } else if (blockchainHistory.length === databaseRecordCount) {
                // Same count - strictly verify content alignment
                let isMatch = true;
                const TIMESTAMP_TOLERANCE_MS = 60 * 60 * 1000; // 1 hour tolerance due to block time vs server time differences

                for (let i = 0; i < blockchainHistory.length; i++) {
                    const bcLog = blockchainHistory[i];
                    const dbLog = dbLogs[i];

                    // 1. Verify Status
                    if (bcLog.status !== dbLog.status) {
                        this.logger.warn(`Verification Mismatch: Status at index ${i} differs. BC: ${bcLog.status}, DB: ${dbLog.status}`);
                        isMatch = false;
                        break;
                    }

                    // 2. Verify Timestamp (Blockchain uses seconds, DB uses MS)
                    const bcTimeMs = bcLog.timestamp * 1000;
                    const dbTimeMs = dbLog.timestamp.getTime();
                    const diff = Math.abs(bcTimeMs - dbTimeMs);

                    if (diff > TIMESTAMP_TOLERANCE_MS) {
                        this.logger.warn(`Verification Mismatch: Timestamp at index ${i} differs by ${diff}ms. BC: ${bcTimeMs}, DB: ${dbTimeMs}`);
                        // We strictly require alignment as per AC, but loose tolerance allows for async processing time
                        isMatch = false;
                        break;
                    }
                }
                verificationStatus = isMatch ? VerificationStatus.MATCH : VerificationStatus.MISMATCH;
            } else {
                // Different counts - partial match at best
                verificationStatus = VerificationStatus.PARTIAL;
            }
        } else {
            // No shipment found in DB
            verificationStatus = blockchainHistory.length > 0
                ? VerificationStatus.NO_DB_RECORDS
                : VerificationStatus.MATCH;
        }

        return {
            barcode,
            blockchainRecordCount: blockchainHistory.length,
            databaseRecordCount,
            verificationStatus,
            blockchainHistory,
        };
    }
}
