import { render, screen } from '@testing-library/react';
import TrackingTimeline, { TrackingEvent } from './TrackingTimeline';

describe('TrackingTimeline', () => {
    const mockEvents: TrackingEvent[] = [
        {
            id: '1',
            status: 'registered',
            location: 'İstanbul Merkez Depo',
            timestamp: '2025-12-25T10:00:00.000Z',
            notes: 'Gönderi kaydedildi',
            isOnBlockchain: true,
            blockchainTxHash: '0x1234567890abcdef1234567890abcdef12345678',
        },
        {
            id: '2',
            status: 'departed',
            location: 'İstanbul Merkez Depo',
            timestamp: '2025-12-25T12:00:00.000Z',
            notes: 'Gönderi çıkış yaptı',
            isOnBlockchain: true,
            blockchainTxHash: '0xabcdef1234567890abcdef1234567890abcdef12',
        },
        {
            id: '3',
            status: 'arrived',
            location: 'Ankara Bölge Deposu',
            timestamp: '2025-12-25T18:00:00.000Z',
            notes: 'Gönderi varış noktasına ulaştı',
            isOnBlockchain: false,
            blockchainTxHash: null,
        },
    ];

    it('renders empty state when no events provided', () => {
        render(<TrackingTimeline events={[]} />);
        expect(screen.getByText('Henüz takip kaydı bulunmuyor')).toBeInTheDocument();
    });

    it('renders timeline with events', () => {
        render(<TrackingTimeline events={mockEvents} />);

        // Check status labels are displayed (Turkish)
        expect(screen.getByText('Kaydedildi')).toBeInTheDocument();
        expect(screen.getByText('Çıkış Yapıldı')).toBeInTheDocument();
        expect(screen.getByText('Varış Noktasına Ulaştı')).toBeInTheDocument();
    });

    it('displays location for events with location', () => {
        render(<TrackingTimeline events={mockEvents} />);

        // All events have location in this test data
        expect(screen.getAllByText('İstanbul Merkez Depo')).toHaveLength(2);
        expect(screen.getByText('Ankara Bölge Deposu')).toBeInTheDocument();
    });

    it('displays notes when provided', () => {
        render(<TrackingTimeline events={mockEvents} />);

        expect(screen.getByText('Gönderi kaydedildi')).toBeInTheDocument();
        expect(screen.getByText('Gönderi çıkış yaptı')).toBeInTheDocument();
        expect(screen.getByText('Gönderi varış noktasına ulaştı')).toBeInTheDocument();
    });

    it('shows blockchain verification indicator for on-chain events', () => {
        render(<TrackingTimeline events={mockEvents} />);

        // Look for blockchain verification links (should be 2 - events 1 and 2)
        const verifyLinks = screen.getAllByRole('link', { name: /Etherscan/i });
        expect(verifyLinks).toHaveLength(2);
    });

    it('does not show blockchain link for off-chain events', () => {
        const offChainEvent: TrackingEvent = {
            id: '4',
            status: 'delivered',
            location: 'Ankara Teslim Noktası',
            timestamp: '2025-12-25T20:00:00.000Z',
            notes: 'Teslim edildi',
            isOnBlockchain: false,
            blockchainTxHash: null,
        };

        render(<TrackingTimeline events={[offChainEvent]} />);

        // Should not have any Etherscan links
        expect(screen.queryByRole('link', { name: /Etherscan/i })).not.toBeInTheDocument();
    });

    it('handles events without location gracefully', () => {
        const eventWithoutLocation: TrackingEvent = {
            id: '5',
            status: 'in_transit',
            timestamp: '2025-12-25T14:00:00.000Z',
            isOnBlockchain: false,
        };

        render(<TrackingTimeline events={[eventWithoutLocation]} />);

        expect(screen.getByText('Yolda')).toBeInTheDocument();
    });

    it('sorts events chronologically (oldest first)', () => {
        // Events in reverse order
        const unsortedEvents: TrackingEvent[] = [
            {
                id: '3',
                status: 'delivered',
                timestamp: '2025-12-25T20:00:00.000Z',
                isOnBlockchain: false,
            },
            {
                id: '1',
                status: 'registered',
                timestamp: '2025-12-25T10:00:00.000Z',
                isOnBlockchain: false,
            },
            {
                id: '2',
                status: 'departed',
                timestamp: '2025-12-25T15:00:00.000Z',
                isOnBlockchain: false,
            },
        ];

        render(<TrackingTimeline events={unsortedEvents} />);

        const listItems = screen.getAllByRole('listitem');

        // First item should be 'Kaydedildi' (registered)
        expect(listItems[0]).toHaveTextContent('Kaydedildi');
        // Last item should be 'Teslim Edildi' (delivered)
        expect(listItems[2]).toHaveTextContent('Teslim Edildi');
    });

    it('applies custom className when provided', () => {
        const { container } = render(
            <TrackingTimeline events={mockEvents} className="custom-class" />
        );

        expect(container.firstChild).toHaveClass('custom-class');
    });

    it('formats dates in Turkish locale', () => {
        const eventWithKnownDate: TrackingEvent = {
            id: '1',
            status: 'registered',
            timestamp: '2025-12-25T10:30:00.000Z',
            isOnBlockchain: false,
        };

        render(<TrackingTimeline events={[eventWithKnownDate]} />);

        // Turkish date format: DD.MM.YYYY, HH:MM
        // The exact format depends on the locale and timezone, so we check for key parts
        expect(screen.getByText(/25.12.2025/)).toBeInTheDocument();
    });

    it('handles cancelled status with appropriate styling', () => {
        const cancelledEvent: TrackingEvent = {
            id: '1',
            status: 'cancelled',
            timestamp: '2025-12-25T10:00:00.000Z',
            notes: 'Gönderi iptal edildi',
            isOnBlockchain: false,
        };

        render(<TrackingTimeline events={[cancelledEvent]} />);

        expect(screen.getByText('İptal Edildi')).toBeInTheDocument();
        expect(screen.getByText('Gönderi iptal edildi')).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
        render(<TrackingTimeline events={mockEvents} />);

        // Check for list role
        expect(screen.getByRole('list', { name: 'Takip geçmişi' })).toBeInTheDocument();

        // Check for list items
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(3);
    });
});
