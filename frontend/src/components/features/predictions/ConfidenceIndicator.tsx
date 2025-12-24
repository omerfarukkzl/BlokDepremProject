import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

/**
 * Determines the confidence level based on the confidence value.
 * High: >= 0.80, Medium: 0.50 - 0.79, Low: < 0.50
 */
export const getConfidenceLevel = (confidence: number): 'high' | 'medium' | 'low' => {
    // Clamp to valid range first
    const clampedConfidence = Math.max(0, Math.min(1, confidence));
    if (clampedConfidence >= 0.80) return 'high';
    if (clampedConfidence >= 0.50) return 'medium';
    return 'low';
};

/**
 * Clamps confidence value to valid 0-1 range and handles edge cases
 */
const normalizeConfidence = (confidence: number): number => {
    if (typeof confidence !== 'number' || isNaN(confidence)) return 0;
    return Math.max(0, Math.min(1, confidence));
};

const confidenceVariants = cva(
    'inline-flex items-center rounded-full px-3 py-1 font-medium',
    {
        variants: {
            level: {
                high: 'bg-green-100 text-green-800',
                medium: 'bg-yellow-100 text-yellow-800',
                low: 'bg-red-100 text-red-800',
            },
            size: {
                sm: 'text-xs px-2 py-0.5',
                md: 'text-sm px-3 py-1',
                lg: 'text-base px-4 py-1.5',
            },
        },
        defaultVariants: {
            level: 'medium',
            size: 'md',
        },
    }
);

const progressBarVariants = {
    high: 'bg-green-500',
    medium: 'bg-yellow-500',
    low: 'bg-red-500',
};

export interface ConfidenceIndicatorProps
    extends Omit<VariantProps<typeof confidenceVariants>, 'level'> {
    confidence: number; // 0.0 to 1.0
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = React.memo(({
    confidence,
    size = 'md',
    className,
}) => {
    const normalizedConfidence = normalizeConfidence(confidence);
    const level = getConfidenceLevel(normalizedConfidence);
    const percentage = Math.round(normalizedConfidence * 100);

    return (
        <div
            className={cn('flex flex-col gap-2', className)}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Confidence score: ${percentage}% (${level})`}
        >
            <div className="flex items-center gap-2">
                <span className={cn(confidenceVariants({ level, size }))}>
                    {percentage}%
                </span>
                <span className="text-sm text-gray-500 capitalize">
                    {level} confidence
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-300',
                        progressBarVariants[level]
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
});

ConfidenceIndicator.displayName = 'ConfidenceIndicator';

export default ConfidenceIndicator;
