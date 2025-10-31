import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const skeletonVariants = cva(
  'animate-pulse rounded-md bg-gray-200',
  {
    variants: {
      variant: {
        text: 'h-4',
        title: 'h-6 w-1/3',
        avatar: 'h-10 w-10 rounded-full',
        button: 'h-10 w-20',
        card: 'h-24',
        line: 'h-2 w-full',
        rectangle: 'h-16 w-full',
      },
      size: {
        sm: 'h-2 w-12',
        md: 'h-4 w-24',
        lg: 'h-6 w-32',
        xl: 'h-8 w-48',
      },
    },
    defaultVariants: {
      variant: 'text',
    },
  }
);

export interface SkeletonLoaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  lines?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant,
  size,
  lines = 1,
  className,
  ...props
}) => {
  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)} {...props}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={cn(
              skeletonVariants({ variant: 'line' }),
              i === lines - 1 && 'w-3/4' // Last line is shorter
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(skeletonVariants({ variant, size }), className)}
      {...props}
    />
  );
};

// Predefined skeleton components
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-4 space-y-4', className)}>
    <SkeletonLoader variant="avatar" className="mb-4" />
    <SkeletonLoader variant="title" />
    <SkeletonLoader lines={3} />
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 5,
  cols = 4,
  className
}) => (
  <div className={cn('space-y-2', className)}>
    {/* Header */}
    <div className="flex gap-4 pb-2 border-b">
      {Array.from({ length: cols }, (_, i) => (
        <SkeletonLoader key={`header-${i}`} variant="line" className="flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex gap-4 py-2">
        {Array.from({ length: cols }, (_, colIndex) => (
          <SkeletonLoader key={`cell-${rowIndex}-${colIndex}`} variant="line" className="flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const ListSkeleton: React.FC<{ items?: number; className?: string }> = ({
  items = 3,
  className
}) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: items }, (_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <SkeletonLoader variant="avatar" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader variant="line" className="w-3/4" />
          <SkeletonLoader variant="line" className="w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export default SkeletonLoader;