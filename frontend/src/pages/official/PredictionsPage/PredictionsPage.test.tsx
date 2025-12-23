import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PredictionsPage from './PredictionsPage';

// Mock feature components
vi.mock('../../../components/features/predictions/PredictionForm', () => ({
    default: () => <div data-testid="prediction-form">Prediction Form Mock</div>
}));

vi.mock('../../../components/features/predictions/PredictionResult', () => ({
    default: () => <div data-testid="prediction-result">Prediction Result Mock</div>
}));

describe('PredictionsPage', () => {
    it('renders page layout with components', () => {
        render(<PredictionsPage />);

        expect(screen.getByText(/AI Aid Prediction/i)).toBeInTheDocument();
        expect(screen.getByTestId('prediction-form')).toBeInTheDocument();
        expect(screen.getByTestId('prediction-result')).toBeInTheDocument();
    });
});
