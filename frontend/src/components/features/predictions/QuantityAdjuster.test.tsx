import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuantityAdjuster from './QuantityAdjuster';

describe('QuantityAdjuster', () => {
    const defaultProps = {
        aidType: 'tent',
        originalValue: 100,
        onChange: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('rendering', () => {
        it('renders label and value correctly', () => {
            render(<QuantityAdjuster {...defaultProps} />);

            expect(screen.getByLabelText('Adjust Tent quantity')).toBeInTheDocument();
            expect(screen.getByRole('spinbutton')).toHaveValue(100);
        });

        it('capitalizes aid type in label', () => {
            render(<QuantityAdjuster {...defaultProps} aidType="container" />);

            expect(screen.getByText('Container')).toBeInTheDocument();
        });

        it('uses adjustedValue when provided', () => {
            render(<QuantityAdjuster {...defaultProps} adjustedValue={150} />);

            expect(screen.getByRole('spinbutton')).toHaveValue(150);
        });
    });

    describe('original value badge', () => {
        it('shows original badge when adjusted !== original', () => {
            render(<QuantityAdjuster {...defaultProps} adjustedValue={150} />);

            expect(screen.getByText('(was 100)')).toBeInTheDocument();
            expect(screen.getByText('↑ 50')).toBeInTheDocument();
        });

        it('shows down arrow when adjusted < original', () => {
            render(<QuantityAdjuster {...defaultProps} adjustedValue={80} />);

            expect(screen.getByText('↓ 20')).toBeInTheDocument();
            expect(screen.getByText('(was 100)')).toBeInTheDocument();
        });

        it('hides original badge when using original value', () => {
            render(<QuantityAdjuster {...defaultProps} />);

            expect(screen.queryByText('(was 100)')).not.toBeInTheDocument();
        });

        it('hides original badge when adjusted equals original', () => {
            render(<QuantityAdjuster {...defaultProps} adjustedValue={100} />);

            expect(screen.queryByText('(was 100)')).not.toBeInTheDocument();
        });
    });

    describe('value changes', () => {
        it('updates display value when typing', () => {
            render(<QuantityAdjuster {...defaultProps} />);

            const input = screen.getByRole('spinbutton');

            // Verify initial value
            expect(input).toHaveValue(100);

            // Change value
            fireEvent.change(input, { target: { value: '150' } });

            // Display should update immediately
            expect(input).toHaveValue(150);
        });

        it('rejects negative values', () => {
            render(<QuantityAdjuster {...defaultProps} />);

            const input = screen.getByRole('spinbutton');
            fireEvent.change(input, { target: { value: '-10' } });

            // Value should remain unchanged (original or previous valid value)
            expect(input).toHaveValue(100);
        });

        it('sets to 0 when input is cleared', () => {
            render(<QuantityAdjuster {...defaultProps} />);

            const input = screen.getByRole('spinbutton');
            fireEvent.change(input, { target: { value: '' } });

            expect(input).toHaveValue(0);
        });
    });

    describe('keyboard navigation', () => {
        it('increments by 1 with ArrowUp', () => {
            render(<QuantityAdjuster {...defaultProps} />);

            const input = screen.getByRole('spinbutton');
            fireEvent.keyDown(input, { key: 'ArrowUp' });

            expect(input).toHaveValue(101);
        });

        it('decrements by 1 with ArrowDown', () => {
            render(<QuantityAdjuster {...defaultProps} />);

            const input = screen.getByRole('spinbutton');
            fireEvent.keyDown(input, { key: 'ArrowDown' });

            expect(input).toHaveValue(99);
        });

        it('increments by 10 with Shift+ArrowUp', () => {
            render(<QuantityAdjuster {...defaultProps} />);

            const input = screen.getByRole('spinbutton');
            fireEvent.keyDown(input, { key: 'ArrowUp', shiftKey: true });

            expect(input).toHaveValue(110);
        });

        it('decrements by 10 with Shift+ArrowDown', () => {
            render(<QuantityAdjuster {...defaultProps} />);

            const input = screen.getByRole('spinbutton');
            fireEvent.keyDown(input, { key: 'ArrowDown', shiftKey: true });

            expect(input).toHaveValue(90);
        });

        it('does not go below 0', () => {
            render(<QuantityAdjuster {...defaultProps} originalValue={5} />);

            const input = screen.getByRole('spinbutton');
            fireEvent.keyDown(input, { key: 'ArrowDown', shiftKey: true });

            expect(input).toHaveValue(0);
        });

        it('resets to original on Escape', () => {
            const onChange = vi.fn();
            render(<QuantityAdjuster {...defaultProps} adjustedValue={150} onChange={onChange} />);

            const input = screen.getByRole('spinbutton');
            fireEvent.keyDown(input, { key: 'Escape' });

            expect(input).toHaveValue(100);
            expect(onChange).toHaveBeenCalledWith(100);
        });
    });

    describe('styling', () => {
        it('has yellow background when modified', () => {
            const { container } = render(<QuantityAdjuster {...defaultProps} adjustedValue={150} />);

            expect(container.firstChild).toHaveClass('bg-yellow-50');
        });

        it('has gray background when not modified', () => {
            const { container } = render(<QuantityAdjuster {...defaultProps} />);

            expect(container.firstChild).toHaveClass('bg-gray-50');
        });
    });
});
