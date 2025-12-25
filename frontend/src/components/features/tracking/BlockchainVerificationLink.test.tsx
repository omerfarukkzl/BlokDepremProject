import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BlockchainVerificationLink, { getEtherscanTxUrl } from './BlockchainVerificationLink';

describe('BlockchainVerificationLink', () => {
    const validTxHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

    describe('Etherscan URL generation', () => {
        it('generates correct Etherscan Sepolia URL', () => {
            const url = getEtherscanTxUrl(validTxHash);
            expect(url).toBe(`https://sepolia.etherscan.io/tx/${validTxHash}`);
        });
    });

    describe('rendering with valid txHash', () => {
        it('renders a link when txHash is provided', () => {
            render(<BlockchainVerificationLink txHash={validTxHash} />);

            const link = screen.getByRole('link');
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute('href', `https://sepolia.etherscan.io/tx/${validTxHash}`);
        });

        it('opens link in new tab with correct security attributes', () => {
            render(<BlockchainVerificationLink txHash={validTxHash} />);

            const link = screen.getByRole('link');
            expect(link).toHaveAttribute('target', '_blank');
            expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        });

        it('has proper aria-label for accessibility', () => {
            render(<BlockchainVerificationLink txHash={validTxHash} />);

            const link = screen.getByRole('link');
            // aria-label contains truncated hash: first 6 and last 4 chars
            expect(link).toHaveAttribute('aria-label', expect.stringContaining('0x1234'));
            expect(link).toHaveAttribute('aria-label', expect.stringContaining('cdef'));
        });

        it('displays "Etherscan\'da Doğrula" text by default', () => {
            render(<BlockchainVerificationLink txHash={validTxHash} />);

            expect(screen.getByText("Etherscan'da Doğrula")).toBeInTheDocument();
        });
    });

    describe('compact mode', () => {
        it('hides visible text in compact mode', () => {
            render(<BlockchainVerificationLink txHash={validTxHash} compact />);

            // Text should be in screen-reader-only span
            const srText = screen.getByText("Etherscan'da Doğrula");
            expect(srText).toHaveClass('sr-only');
        });

        it('still renders the link in compact mode', () => {
            render(<BlockchainVerificationLink txHash={validTxHash} compact />);

            const link = screen.getByRole('link');
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute('href', `https://sepolia.etherscan.io/tx/${validTxHash}`);
        });
    });

    describe('handling missing or pending txHash', () => {
        it('renders pending state when txHash is null', () => {
            render(<BlockchainVerificationLink txHash={null} />);

            expect(screen.queryByRole('link')).not.toBeInTheDocument();
            expect(screen.getByText('Doğrulama Bekliyor...')).toBeInTheDocument();
        });

        it('renders pending state when txHash is undefined', () => {
            render(<BlockchainVerificationLink txHash={undefined} />);

            expect(screen.queryByRole('link')).not.toBeInTheDocument();
            expect(screen.getByText('Doğrulama Bekliyor...')).toBeInTheDocument();
        });

        it('renders pending state when txHash is "pending"', () => {
            render(<BlockchainVerificationLink txHash="pending" />);

            expect(screen.queryByRole('link')).not.toBeInTheDocument();
            expect(screen.getByText('Doğrulama Bekliyor...')).toBeInTheDocument();
        });

        it('shows pending emoji when txHash is missing', () => {
            render(<BlockchainVerificationLink txHash={null} />);

            expect(screen.getByText('⏳')).toBeInTheDocument();
        });

        it('has proper aria-label in pending state', () => {
            render(<BlockchainVerificationLink txHash={null} />);

            const pendingSpan = screen.getByLabelText('Blockchain verification pending');
            expect(pendingSpan).toBeInTheDocument();
        });
    });

    describe('styling', () => {
        it('applies custom className', () => {
            render(<BlockchainVerificationLink txHash={validTxHash} className="custom-class" />);

            const link = screen.getByRole('link');
            expect(link).toHaveClass('custom-class');
        });

        it('applies default styling classes', () => {
            render(<BlockchainVerificationLink txHash={validTxHash} />);

            const link = screen.getByRole('link');
            expect(link).toHaveClass('text-blue-600');
            expect(link).toHaveClass('hover:text-blue-800');
        });
    });
});
