import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminReportsPage from './AdminReportsPage';

// Mock react-query to resolve immediately with mock data
vi.mock('@tanstack/react-query', async () => {
    const actual = await vi.importActual('@tanstack/react-query');
    return {
        ...actual,
        useQuery: vi.fn().mockReturnValue({
            data: {
                totalPredictions: 42,
                completedPredictions: 35,
                averageAccuracy: 87.5,
                recentPredictions: [
                    { id: '1', regionName: 'Istanbul', accuracy: 92, createdAt: '2025-12-28' },
                    { id: '2', regionName: 'Ankara', accuracy: 85, createdAt: '2025-12-27' },
                    { id: '3', regionName: 'Izmir', accuracy: 88, createdAt: '2025-12-26' },
                ],
            },
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        }),
    };
});

// Mock recharts components
vi.mock('recharts', () => ({
    BarChart: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="bar-chart">{children}</div>
    ),
    Bar: () => <div data-testid="bar" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="responsive-container">{children}</div>
    ),
}));

describe('AdminReportsPage', () => {
    it('renders dashboard header', () => {
        render(<AdminReportsPage />);

        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
        expect(
            screen.getByText('View prediction accuracy analytics and reports')
        ).toBeInTheDocument();
    });

    it('renders placeholder chart', () => {
        render(<AdminReportsPage />);

        expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('renders metrics cards with mock data', () => {
        render(<AdminReportsPage />);

        expect(screen.getByText('Total Predictions')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
        expect(screen.getByText('Completed Predictions')).toBeInTheDocument();
        expect(screen.getByText('35')).toBeInTheDocument();
        expect(screen.getByText('Average Accuracy')).toBeInTheDocument();
        expect(screen.getByText('87.5%')).toBeInTheDocument();
    });

    it('renders chart section with title', () => {
        render(<AdminReportsPage />);

        expect(
            screen.getByText('Recent Prediction Accuracy by Region')
        ).toBeInTheDocument();
    });
});
