import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConfidenceIndicator, { getConfidenceLevel } from './ConfidenceIndicator';

describe('ConfidenceIndicator', () => {
    describe('Confidence Level Classification', () => {
        it('displays HIGH confidence for values >= 0.80', () => {
            render(<ConfidenceIndicator confidence={0.80} />);
            expect(screen.getByText('80%')).toBeInTheDocument();
            expect(screen.getByText(/high confidence/i)).toBeInTheDocument();
        });

        it('displays HIGH confidence for values > 0.80', () => {
            render(<ConfidenceIndicator confidence={0.95} />);
            expect(screen.getByText('95%')).toBeInTheDocument();
            expect(screen.getByText(/high confidence/i)).toBeInTheDocument();
        });

        it('displays MEDIUM confidence for value 0.79', () => {
            render(<ConfidenceIndicator confidence={0.79} />);
            expect(screen.getByText('79%')).toBeInTheDocument();
            expect(screen.getByText(/medium confidence/i)).toBeInTheDocument();
        });

        it('displays MEDIUM confidence for value 0.50', () => {
            render(<ConfidenceIndicator confidence={0.50} />);
            expect(screen.getByText('50%')).toBeInTheDocument();
            expect(screen.getByText(/medium confidence/i)).toBeInTheDocument();
        });

        it('displays LOW confidence for value 0.49', () => {
            render(<ConfidenceIndicator confidence={0.49} />);
            expect(screen.getByText('49%')).toBeInTheDocument();
            expect(screen.getByText(/low confidence/i)).toBeInTheDocument();
        });

        it('displays LOW confidence for value 0.20', () => {
            render(<ConfidenceIndicator confidence={0.20} />);
            expect(screen.getByText('20%')).toBeInTheDocument();
            expect(screen.getByText(/low confidence/i)).toBeInTheDocument();
        });
    });

    describe('Boundary Values', () => {
        it('boundary: 0.49 is LOW', () => {
            render(<ConfidenceIndicator confidence={0.49} />);
            expect(screen.getByText(/low confidence/i)).toBeInTheDocument();
        });

        it('boundary: 0.50 is MEDIUM', () => {
            render(<ConfidenceIndicator confidence={0.50} />);
            expect(screen.getByText(/medium confidence/i)).toBeInTheDocument();
        });

        it('boundary: 0.79 is MEDIUM', () => {
            render(<ConfidenceIndicator confidence={0.79} />);
            expect(screen.getByText(/medium confidence/i)).toBeInTheDocument();
        });

        it('boundary: 0.80 is HIGH', () => {
            render(<ConfidenceIndicator confidence={0.80} />);
            expect(screen.getByText(/high confidence/i)).toBeInTheDocument();
        });
    });

    describe('Edge Cases (Input Validation)', () => {
        it('handles confidence = 0', () => {
            render(<ConfidenceIndicator confidence={0} />);
            expect(screen.getByText('0%')).toBeInTheDocument();
            expect(screen.getByText(/low confidence/i)).toBeInTheDocument();
        });

        it('handles confidence = 1', () => {
            render(<ConfidenceIndicator confidence={1} />);
            expect(screen.getByText('100%')).toBeInTheDocument();
            expect(screen.getByText(/high confidence/i)).toBeInTheDocument();
        });

        it('clamps confidence > 1 to 100%', () => {
            render(<ConfidenceIndicator confidence={1.5} />);
            expect(screen.getByText('100%')).toBeInTheDocument();
            expect(screen.getByText(/high confidence/i)).toBeInTheDocument();
        });

        it('clamps confidence < 0 to 0%', () => {
            render(<ConfidenceIndicator confidence={-0.5} />);
            expect(screen.getByText('0%')).toBeInTheDocument();
            expect(screen.getByText(/low confidence/i)).toBeInTheDocument();
        });

        it('handles NaN as 0%', () => {
            render(<ConfidenceIndicator confidence={NaN} />);
            expect(screen.getByText('0%')).toBeInTheDocument();
            expect(screen.getByText(/low confidence/i)).toBeInTheDocument();
        });
    });

    describe('Color Classes', () => {
        it('applies green classes for HIGH confidence', () => {
            render(<ConfidenceIndicator confidence={0.85} />);
            const badge = screen.getByText('85%');
            expect(badge).toHaveClass('bg-green-100', 'text-green-800');
        });

        it('applies yellow classes for MEDIUM confidence', () => {
            render(<ConfidenceIndicator confidence={0.65} />);
            const badge = screen.getByText('65%');
            expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
        });

        it('applies red classes for LOW confidence', () => {
            render(<ConfidenceIndicator confidence={0.30} />);
            const badge = screen.getByText('30%');
            expect(badge).toHaveClass('bg-red-100', 'text-red-800');
        });
    });

    describe('Accessibility', () => {
        it('has role="progressbar"', () => {
            render(<ConfidenceIndicator confidence={0.75} />);
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('has aria-valuenow set to percentage', () => {
            render(<ConfidenceIndicator confidence={0.82} />);
            const progressbar = screen.getByRole('progressbar');
            expect(progressbar).toHaveAttribute('aria-valuenow', '82');
        });

        it('has aria-valuemin set to 0', () => {
            render(<ConfidenceIndicator confidence={0.75} />);
            const progressbar = screen.getByRole('progressbar');
            expect(progressbar).toHaveAttribute('aria-valuemin', '0');
        });

        it('has aria-valuemax set to 100', () => {
            render(<ConfidenceIndicator confidence={0.75} />);
            const progressbar = screen.getByRole('progressbar');
            expect(progressbar).toHaveAttribute('aria-valuemax', '100');
        });

        it('has descriptive aria-label', () => {
            render(<ConfidenceIndicator confidence={0.82} />);
            const progressbar = screen.getByRole('progressbar');
            expect(progressbar).toHaveAttribute('aria-label', 'Confidence score: 82% (high)');
        });
    });

    describe('Size Variants', () => {
        it('applies sm size classes', () => {
            render(<ConfidenceIndicator confidence={0.75} size="sm" />);
            const badge = screen.getByText('75%');
            expect(badge).toHaveClass('text-xs');
        });

        it('applies lg size classes', () => {
            render(<ConfidenceIndicator confidence={0.75} size="lg" />);
            const badge = screen.getByText('75%');
            expect(badge).toHaveClass('text-base');
        });
    });

    describe('className Prop', () => {
        it('merges custom className', () => {
            const { container } = render(<ConfidenceIndicator confidence={0.75} className="custom-class" />);
            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper).toHaveClass('custom-class');
        });
    });

    describe('Progress Bar', () => {
        it('renders progress bar with correct width', () => {
            const { container } = render(<ConfidenceIndicator confidence={0.75} />);
            const progressBar = container.querySelector('.bg-gray-200 > div');
            expect(progressBar).toHaveStyle({ width: '75%' });
        });
    });

    describe('Exported getConfidenceLevel function', () => {
        it('returns high for >= 0.80', () => {
            expect(getConfidenceLevel(0.80)).toBe('high');
            expect(getConfidenceLevel(0.95)).toBe('high');
        });

        it('returns medium for 0.50 - 0.79', () => {
            expect(getConfidenceLevel(0.50)).toBe('medium');
            expect(getConfidenceLevel(0.79)).toBe('medium');
        });

        it('returns low for < 0.50', () => {
            expect(getConfidenceLevel(0.49)).toBe('low');
            expect(getConfidenceLevel(0.10)).toBe('low');
        });

        it('clamps out-of-range values', () => {
            expect(getConfidenceLevel(1.5)).toBe('high');
            expect(getConfidenceLevel(-0.5)).toBe('low');
        });
    });
});
