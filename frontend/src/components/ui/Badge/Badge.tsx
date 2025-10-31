import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-primary-100 text-primary-800',
        secondary: 'bg-secondary-100 text-secondary-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        outline: 'border border-gray-300 text-gray-700 bg-white',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Shipment status specific variants
const shipmentStatusVariants = {
  registered: 'bg-blue-100 text-blue-800',
  in_transit: 'bg-yellow-100 text-yellow-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
} as const;

// Urgency level specific variants
const urgencyVariants = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-gray-100 text-gray-800',
} as const;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  // Custom status variants
  shipmentStatus?: keyof typeof shipmentStatusVariants;
  urgency?: keyof typeof urgencyVariants;
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      shipmentStatus,
      urgency,
      dot = false,
      children,
      ...props
    },
    ref
  ) => {
    let variantClass = '';

    if (shipmentStatus) {
      variantClass = shipmentStatusVariants[shipmentStatus];
    } else if (urgency) {
      variantClass = urgencyVariants[urgency];
    } else {
      variantClass = '';
    }

    return (
      <span
        ref={ref}
        className={cn(
          badgeVariants({ variant: shipmentStatus || urgency ? undefined : variant, size }),
          variantClass,
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'mr-1.5 h-2 w-2 rounded-full',
              shipmentStatus === 'delivered' || urgency === 'low'
                ? 'bg-green-400'
                : shipmentStatus === 'in_transit' || urgency === 'medium'
                ? 'bg-yellow-400'
                : shipmentStatus === 'cancelled' || urgency === 'critical'
                ? 'bg-red-400'
                : 'bg-gray-400'
            )}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;