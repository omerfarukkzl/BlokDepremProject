import { render, screen } from '@testing-library/react';
import { RouteDisplay } from './RouteDisplay';

interface Location {
    id: string;
    name: string;
    city: string;
    region: string;
    latitude?: number;
    longitude?: number;
}

describe('RouteDisplay', () => {
    const mockOrigin: Location = {
        id: '1',
        name: 'Istanbul Warehouse',
        city: 'Istanbul',
        region: 'Marmara',
        latitude: 41.0082,
        longitude: 28.9784,
    };

    const mockDestination: Location = {
        id: '2',
        name: 'Ankara Distribution Center',
        city: 'Ankara',
        region: 'Central Anatolia',
        latitude: 39.9334,
        longitude: 32.8597,
    };

    it('renders origin and destination cities correctly', () => {
        render(
            <RouteDisplay
                origin={mockOrigin}
                destination={mockDestination}
                status="registered"
            />
        );

        expect(screen.getByText('Istanbul')).toBeInTheDocument();
        expect(screen.getByText('Ankara')).toBeInTheDocument();
        expect(screen.getByText('Istanbul Warehouse')).toBeInTheDocument();
        expect(screen.getByText('Ankara Distribution Center')).toBeInTheDocument();
    });

    it('renders coordinates when available', () => {
        render(
            <RouteDisplay
                origin={mockOrigin}
                destination={mockDestination}
                status="registered"
            />
        );

        expect(screen.getByText('41.0082, 28.9784')).toBeInTheDocument();
        expect(screen.getByText('39.9334, 32.8597')).toBeInTheDocument();
    });

    it('renders without coordinates gracefully', () => {
        const originNoCoords = { ...mockOrigin, latitude: undefined, longitude: undefined };
        const destNoCoords = { ...mockDestination, latitude: undefined, longitude: undefined };

        render(
            <RouteDisplay
                origin={originNoCoords}
                destination={destNoCoords}
                status="registered"
            />
        );

        expect(screen.getByText('Istanbul')).toBeInTheDocument();
        expect(screen.queryByText(/41\.0082/)).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(
            <RouteDisplay
                origin={mockOrigin}
                destination={mockDestination}
                status="registered"
                className="custom-class"
            />
        );

        expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders estimated duration when provided and in transit', () => {
        render(
            <RouteDisplay
                origin={mockOrigin}
                destination={mockDestination}
                status="in_transit"
                estimatedDuration="2 gün"
            />
        );

        expect(screen.getByText('2 gün')).toBeInTheDocument();
    });

    it('renders fallback text when city is empty (backend behavior)', () => {
        const originNoCity = { ...mockOrigin, city: '' };
        const destNoCity = { ...mockDestination, city: '' };

        render(
            <RouteDisplay
                origin={originNoCity}
                destination={destNoCity}
                status="registered"
            />
        );

        // Should show 'Belirtilmedi' for empty city values
        const fallbackTexts = screen.getAllByText('Belirtilmedi');
        expect(fallbackTexts).toHaveLength(2);
    });

    it('handles departed status with correct progress', () => {
        const { container } = render(
            <RouteDisplay
                origin={mockOrigin}
                destination={mockDestination}
                status="departed"
            />
        );

        // Progress bar should be at 50% for departed status
        const progressBar = container.querySelector('[style*="width: 50%"]');
        expect(progressBar).toBeInTheDocument();
    });

    it('handles arrived status with correct progress', () => {
        const { container } = render(
            <RouteDisplay
                origin={mockOrigin}
                destination={mockDestination}
                status="arrived"
            />
        );

        // Progress bar should be at 85% for arrived status
        const progressBar = container.querySelector('[style*="width: 85%"]');
        expect(progressBar).toBeInTheDocument();
    });
});
