/**
 * DTO representing a single shipment log entry from the blockchain.
 */
export class BlockchainLogDto {
    status: string;
    timestamp: number;
    location: string;
}

/**
 * Verification status enum for comparing blockchain and database records.
 */
export enum VerificationStatus {
    MATCH = 'MATCH',
    MISMATCH = 'MISMATCH',
    PARTIAL = 'PARTIAL',
    NO_DB_RECORDS = 'NO_DB_RECORDS',
    NO_BLOCKCHAIN_RECORDS = 'NO_BLOCKCHAIN_RECORDS',
}

/**
 * DTO for the complete blockchain history response including verification.
 */
export class BlockchainHistoryResponseDto {
    barcode: string;
    blockchainRecordCount: number;
    databaseRecordCount: number;
    verificationStatus: VerificationStatus;
    blockchainHistory: BlockchainLogDto[];
}
