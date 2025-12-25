
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PredictionResult from './PredictionResult';
import { usePredictionStore, useActiveQuantities } from '../../../stores/predictionStore';

vi.mock('../../../stores/predictionStore', () => ({
    usePredictionStore: vi.fn(),
    useActiveQuantities: vi.fn(),
}));

describe('PredictionResult', () => {
    const mockSetAdjustedQuantity = vi.fn();
    const mockResetToOriginal = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });



    it('renders loading state', () => {
        (usePredictionStore as any).mockReturnValue({
            isLoading: true,
            error: null,
            prediction: null,
            adjustedQuantities: null,
            setAdjustedQuantity: mockSetAdjustedQuantity,
            resetToOriginal: mockResetToOriginal
        });
        (useActiveQuantities as any).mockReturnValue(null);

        render(
            <MemoryRouter>
                <PredictionResult />
            </MemoryRouter>
        );
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('renders error state', () => {
        const errorMsg = 'An error occurred';
        (usePredictionStore as any).mockReturnValue({
            isLoading: false,
            error: errorMsg,
            prediction: null,
            adjustedQuantities: null,
            setAdjustedQuantity: mockSetAdjustedQuantity,
            resetToOriginal: mockResetToOriginal
        });
        (useActiveQuantities as any).mockReturnValue(null);

        render(
            <MemoryRouter>
                <PredictionResult />
            </MemoryRouter>
        );
        expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });

    it('renders prediction results with editable quantities', () => {
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
            prediction: prediction,
            adjustedQuantities: null,
            setAdjustedQuantity: mockSetAdjustedQuantity,
            resetToOriginal: mockResetToOriginal
        });
        (useActiveQuantities as any).mockReturnValue(prediction.predictions);

        render(
            <MemoryRouter>
                <PredictionResult />
            </MemoryRouter>
        );

        // Check QuantityAdjuster components render for each aid type
        expect(screen.getByLabelText('Adjust Tent quantity')).toBeInTheDocument();
        expect(screen.getByLabelText('Adjust Container quantity')).toBeInTheDocument();
        expect(screen.getByLabelText('Adjust Food quantity')).toBeInTheDocument();
        expect(screen.getByLabelText('Adjust Blanket quantity')).toBeInTheDocument();

        // Check ConfidenceIndicator renders
        expect(screen.getByText(/95%/i)).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders nothing when no data/loading/error', () => {
        (usePredictionStore as any).mockReturnValue({
            isLoading: false,
            error: null,
            prediction: null,
            adjustedQuantities: null,
            setAdjustedQuantity: mockSetAdjustedQuantity,
            resetToOriginal: mockResetToOriginal
        });
        (useActiveQuantities as any).mockReturnValue(null);

        const { container } = render(
            <MemoryRouter>
                <PredictionResult />
            </MemoryRouter>
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('shows Reset button when adjustments exist', () => {
        const prediction = {
            predictions: { tent: 100 },
            confidence: 0.9,
            prediction_hash: 'hash',
            region_id: '1'
        };

        (usePredictionStore as any).mockReturnValue({
            isLoading: false,
            error: null,
            prediction: prediction,
            adjustedQuantities: { tent: 150 },
            setAdjustedQuantity: mockSetAdjustedQuantity,
            resetToOriginal: mockResetToOriginal
        });
        (useActiveQuantities as any).mockReturnValue({ tent: 150 });

        render(
            <MemoryRouter>
                <PredictionResult />
            </MemoryRouter>
        );

        expect(screen.getByText('Reset to Original Predictions')).toBeInTheDocument();
    });

    it('hides Reset button when no adjustments', () => {
        const prediction = {
            predictions: { tent: 100 },
            confidence: 0.9,
            prediction_hash: 'hash',
            region_id: '1'
        };

        (usePredictionStore as any).mockReturnValue({
            isLoading: false,
            error: null,
            prediction: prediction,
            adjustedQuantities: null,
            setAdjustedQuantity: mockSetAdjustedQuantity,
            resetToOriginal: mockResetToOriginal
        });
        (useActiveQuantities as any).mockReturnValue(prediction.predictions);

        render(
            <MemoryRouter>
                <PredictionResult />
            </MemoryRouter>
        );

        expect(screen.queryByText('Reset to Original Predictions')).not.toBeInTheDocument();
    });

    it('calls resetToOriginal when Reset button clicked', () => {
        const prediction = {
            predictions: { tent: 100 },
            confidence: 0.9,
            prediction_hash: 'hash',
            region_id: '1'
        };

        (usePredictionStore as any).mockReturnValue({
            isLoading: false,
            error: null,
            prediction: prediction,
            adjustedQuantities: { tent: 150 },
            setAdjustedQuantity: mockSetAdjustedQuantity,
            resetToOriginal: mockResetToOriginal
        });
        (useActiveQuantities as any).mockReturnValue({ tent: 150 });

        render(
            <MemoryRouter>
                <PredictionResult />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Reset to Original Predictions'));
        expect(mockResetToOriginal).toHaveBeenCalled();
    });

    it('renders enabled Create Shipment button', () => {
        const prediction = {
            predictions: { tent: 100 },
            confidence: 0.9,
            prediction_hash: 'hash',
            region_id: '1'
        };

        (usePredictionStore as any).mockReturnValue({
            isLoading: false,
            error: null,
            prediction: prediction,
            adjustedQuantities: null,
            setAdjustedQuantity: mockSetAdjustedQuantity,
            resetToOriginal: mockResetToOriginal
        });
        (useActiveQuantities as any).mockReturnValue(prediction.predictions);

        render(
            <MemoryRouter>
                <PredictionResult />
            </MemoryRouter>
        );

        const createButton = screen.getByText('Create Shipment');
        expect(createButton).toBeInTheDocument();
        expect(createButton).not.toBeDisabled();
    });
});
