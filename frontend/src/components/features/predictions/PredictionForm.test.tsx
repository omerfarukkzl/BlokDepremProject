import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PredictionForm from './PredictionForm';
import locationService from '../../../services/locationService';
import { usePredictionStore } from '../../../stores/predictionStore';

// Mock services
vi.mock('../../../services/locationService', () => ({
    default: {
        fetchRegions: vi.fn(),
    },
}));

vi.mock('../../../stores/predictionStore', () => ({
    usePredictionStore: vi.fn(),
}));

describe('PredictionForm', () => {
    const mockFetchPrediction = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (usePredictionStore as any).mockReturnValue({
            isLoading: false,
            fetchPrediction: mockFetchPrediction
        });
        (locationService.fetchRegions as any).mockResolvedValue([
            { id: 1, name: 'Hatay' },
            { id: 2, name: 'Adana' }
        ]);
    });

    it('renders region selection and button', async () => {
        render(<PredictionForm />);

        // Should fetch regions
        expect(locationService.fetchRegions).toHaveBeenCalled();

        // Check for dropdown elements
        await waitFor(() => {
            expect(screen.getByText('Hatay')).toBeInTheDocument();
        });
        expect(screen.getByText('Adana')).toBeInTheDocument();

        expect(screen.getByRole('button', { name: /generate prediction/i })).toBeInTheDocument();
    });

    it('submits form with selected region', async () => {
        render(<PredictionForm />);

        await waitFor(() => {
            expect(screen.getByText('Hatay')).toBeInTheDocument();
        });

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '1' } });

        const button = screen.getByRole('button', { name: /generate prediction/i });
        fireEvent.click(button);

        expect(mockFetchPrediction).toHaveBeenCalledWith('1');
    });

    it('disables button when loading', () => {
        (usePredictionStore as any).mockReturnValue({
            isLoading: true,
            fetchPrediction: mockFetchPrediction
        });

        render(<PredictionForm />);
        const button = screen.getByRole('button', { name: /generating/i });
        expect(button).toBeDisabled();
    });
});
