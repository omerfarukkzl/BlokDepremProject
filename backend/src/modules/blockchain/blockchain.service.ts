import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import BlokDepremAbi from './contracts/BlokDeprem.abi.json';

@Injectable()
export class BlockchainService implements OnModuleInit {
    private readonly logger = new Logger(BlockchainService.name);
    private provider: ethers.JsonRpcProvider;
    private wallet: ethers.Wallet;
    private contract: ethers.Contract;
    private isConnected = false;

    constructor(private configService: ConfigService) { }

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
}
