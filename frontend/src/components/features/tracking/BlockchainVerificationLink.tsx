import { LinkIcon } from '@heroicons/react/24/outline';

/**
 * Etherscan Sepolia base URL for transaction verification
 */
const ETHERSCAN_SEPOLIA_TX_URL = 'https://sepolia.etherscan.io/tx/';

export interface BlockchainVerificationLinkProps {
    /** Transaction hash to link to Etherscan */
    txHash?: string | null;
    /** Additional CSS classes */
    className?: string;
    /** Show compact version (icon only with tooltip) */
    compact?: boolean;
}

/**
 * BlockchainVerificationLink - Displays an Etherscan link for blockchain-verified transactions
 * 
 * When a transaction hash is provided, renders a clickable link to Etherscan Sepolia.
 * When the hash is 'pending' or missing, shows a pending state indicator.
 * Follows accessibility best practices with proper aria-labels.
 */
export default function BlockchainVerificationLink({
    txHash,
    className = '',
    compact = false,
}: BlockchainVerificationLinkProps) {
    // Handle missing or pending transaction hash
    if (!txHash || txHash === 'pending') {
        return (
            <span
                className={`inline-flex items-center text-gray-400 text-sm ${className}`}
                aria-label="Blockchain verification pending"
            >
                <span className="animate-pulse mr-1">⏳</span>
                {!compact && <span>Doğrulama Bekliyor...</span>}
            </span>
        );
    }

    const etherscanUrl = `${ETHERSCAN_SEPOLIA_TX_URL}${txHash}`;

    // Truncate hash for display (show first 6 and last 4 characters)
    const truncatedHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;

    return (
        <a
            href={etherscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline text-sm transition-colors ${className}`}
            aria-label={`View transaction ${truncatedHash} on Etherscan`}
            title={`İşlem: ${txHash}`}
        >
            <LinkIcon className="w-4 h-4 mr-1 flex-shrink-0" aria-hidden="true" />
            {compact ? (
                <span className="sr-only">Etherscan'da Doğrula</span>
            ) : (
                <span>Etherscan'da Doğrula</span>
            )}
        </a>
    );
}

/**
 * Export a helper function to generate Etherscan URLs
 * Can be used elsewhere in the application if needed
 */
export function getEtherscanTxUrl(txHash: string): string {
    return `${ETHERSCAN_SEPOLIA_TX_URL}${txHash}`;
}
