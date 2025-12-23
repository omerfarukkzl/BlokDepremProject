import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PredictionResult from './PredictionResult';
import { usePredictionStore } from '../../../stores/predictionStore';

vi.mock('../../../stores/predictionStore', () => ({
    usePredictionStore: vi.fn(),
}));

describe('PredictionResult', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state', () => {
        (usePredictionStore as any).mockReturnValue({
            isLoading: true,
            error: null,
            prediction: null
        });

        render(<PredictionResult />);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('renders error state', () => {
        const errorMsg = 'An error occurred';
        (usePredictionStore as any).mockReturnValue({
            isLoading: false,
            error: errorMsg,
            prediction: null
        });

        render(<PredictionResult />);
        expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });

    it('renders prediction results', () => {
        const prediction = {
            predictions: {
                tent: 100,
                container: 50,
                food: 500,
                blanket: 1000
            },
            confidence: 0.95,
            prediction_hash: 'hash',
            region_id: '1'
        };

        (usePredictionStore as any).mockReturnValue({
            isLoading: false,
            error: null,
            prediction: prediction
        });

        render(<PredictionResult />);
        expect(screen.getByText(/tent/i)).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();

        expect(screen.getByText(/container/i)).toBeInTheDocument();
        expect(screen.getByText('50')).toBeInTheDocument();

        expect(screen.getByText(/food/i)).toBeInTheDocument();
        expect(screen.getByText('500')).toBeInTheDocument();

        expect(screen.getByText(/blanket/i)).toBeInTheDocument();
        expect(screen.getByText('1000')).toBeInTheDocument();

        expect(screen.getByText(/95%/i)).toBeInTheDocument(); // Expecting percentage format
    });

    it('renders nothing when no data/loading/error', () => {
        (usePredictionStore as any).mockReturnValue({
            isLoading: false,
            error: null,
            prediction: null
        });
        const { container } = render(<PredictionResult />);
        expect(container).toBeEmptyDOMElement();
    });
});
