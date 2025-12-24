import React, { useState, useCallback, useEffect, useRef, useId } from 'react';
import { cn } from '../../../utils/cn';

export interface QuantityAdjusterProps {
    aidType: string;
    originalValue: number;
    adjustedValue?: number;
    onChange: (value: number) => void;
    className?: string;
}

/**
 * Capitalizes the first letter of a string
 */
const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Debounce hook for delaying value updates
 */
const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
};

const QuantityAdjuster: React.FC<QuantityAdjusterProps> = ({
    aidType,
    originalValue,
    adjustedValue,
    onChange,
    className,
}) => {
    // Local state for immediate UI feedback
    const [localValue, setLocalValue] = useState<number>(adjustedValue ?? originalValue);
    const isFirstRender = useRef(true);
    const descriptionId = useId();

    // Debounce the onChange callback
    const debouncedValue = useDebounce(localValue, 200);

    // Sync local value when adjustedValue or originalValue changes from outside
    useEffect(() => {
        setLocalValue(adjustedValue ?? originalValue);
    }, [adjustedValue, originalValue]);

    // Call onChange with debounced value
    useEffect(() => {
        // Skip first render to avoid unnecessary onChange call
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // Only trigger onChange if value differs from original (to track adjustments)
        if (debouncedValue !== originalValue || adjustedValue !== undefined) {
            onChange(debouncedValue);
        }
    }, [debouncedValue, onChange, originalValue, adjustedValue]);

    const isModified = adjustedValue !== undefined && adjustedValue !== originalValue;
    const diff = isModified ? (adjustedValue! - originalValue) : 0;

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 0) {
            setLocalValue(value);
        } else if (e.target.value === '') {
            setLocalValue(0);
        }
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        const step = e.shiftKey ? 10 : 1;

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setLocalValue((prev) => prev + step);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setLocalValue((prev) => Math.max(0, prev - step));
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setLocalValue(originalValue);
            onChange(originalValue);
        }
    }, [originalValue, onChange]);

    return (
        <div
            className={cn(
                'p-4 rounded-md transition-colors',
                isModified ? 'bg-yellow-50' : 'bg-gray-50',
                className
            )}
        >
            <label
                htmlFor={`quantity-${aidType}`}
                className="block text-sm font-medium text-gray-500 capitalize"
            >
                {capitalize(aidType)}
            </label>

            <div className="mt-1 flex items-center gap-2">
                <input
                    id={`quantity-${aidType}`}
                    type="number"
                    min="0"
                    step="1"
                    value={localValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        'text-2xl font-semibold w-24 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500',
                        isModified ? 'border-yellow-300 bg-white' : 'border-gray-300 bg-white'
                    )}
                    aria-label={`Adjust ${capitalize(aidType)} quantity`}
                    aria-describedby={isModified ? descriptionId : undefined}
                />

                {isModified && (
                    <div id={descriptionId} className="flex items-center gap-1 text-sm">
                        <span className={cn(
                            'font-medium',
                            diff > 0 ? 'text-green-600' : 'text-red-600'
                        )}>
                            {diff > 0 ? '↑' : '↓'} {Math.abs(diff)}
                        </span>
                        <span className="text-gray-400">
                            (was {originalValue})
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuantityAdjuster;
