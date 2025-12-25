import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { BlockchainHistoryResponseDto } from './dto/blockchain-history.dto';

@Controller('blockchain')
export class BlockchainController {
    constructor(private readonly blockchainService: BlockchainService) { }

    /**
     * GET /blockchain/history/:barcode
     * Retrieves shipment history from the blockchain and verifies against database records.
     * @param barcode - The shipment barcode to query
     * @returns BlockchainHistoryResponseDto with history and verification status
     */
    @Get('history/:barcode')
    async getShipmentHistory(@Param('barcode') barcode: string): Promise<BlockchainHistoryResponseDto> {
        // Validate barcode format (basic non-empty check)
        if (!barcode || barcode.trim().length === 0) {
            throw new NotFoundException('Barcode is required');
        }

        try {
            return await this.blockchainService.getShipmentHistory(barcode.trim());
        } catch (error) {
            // Re-throw blockchain service errors or handle gracefully
            if (error.message?.includes('Blockchain service is not available')) {
                throw new NotFoundException('Blockchain service is currently unavailable. Please try again later.');
            }
            throw error;
        }
    }
}

