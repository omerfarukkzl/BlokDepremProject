import React from 'react';
import {
  InboxIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../Button';
import { cn } from '../../../utils/cn';

type EmptyStateIcon = 'inbox' | 'document' | 'search' | 'error' | React.ReactNode;

export interface EmptyStateProps {
  icon?: EmptyStateIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  className?: string;
}

const iconMap = {
  inbox: InboxIcon,
  document: DocumentTextIcon,
  search: MagnifyingGlassIcon,
  error: ExclamationCircleIcon,
};

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  action,
  className,
}) => {
  const IconComponent = typeof icon === 'string' ? iconMap[icon] : null;

  return (
    <div className={cn('text-center py-12', className)}>
      <div className="flex justify-center">
        {typeof icon === 'string' && IconComponent ? (
          <IconComponent className="h-12 w-12 text-gray-400" />
        ) : (
          <div className="h-12 w-12 text-gray-400">
            {icon}
          </div>
        )}
      </div>

      <h3 className="mt-2 text-sm font-medium text-gray-900">
        {title}
      </h3>

      {description && (
        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-6">
          <Button
            variant={action.variant || 'primary'}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};

// Predefined empty states
export const NoDataEmptyState: React.FC<{
  title?: string;
  description?: string;
  onRefresh?: () => void;
}> = ({
  title = 'Veri bulunamadı',
  description = 'Gösterilecek veri mevcut değil.',
  onRefresh
}) => (
  <EmptyState
    icon="inbox"
    title={title}
    description={description}
    action={onRefresh ? {
      label: 'Yenile',
      onClick: onRefresh,
      variant: 'outline'
    } : undefined}
  />
);

export const NoSearchResultsEmptyState: React.FC<{
  searchTerm?: string;
  onClearSearch?: () => void;
}> = ({
  searchTerm,
  onClearSearch
}) => (
  <EmptyState
    icon="search"
    title={`"${searchTerm}" için sonuç bulunamadı`}
    description="Arama kriterlerinizi değiştirmeyi deneyin."
    action={onClearSearch ? {
      label: 'Aramayı Temizle',
      onClick: onClearSearch,
      variant: 'outline'
    } : undefined}
  />
);

export const ErrorEmptyState: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
}> = ({
  title = 'Bir hata oluştu',
  description = 'Veriler yüklenirken bir hata meydana geldi.',
  onRetry
}) => (
  <EmptyState
    icon="error"
    title={title}
    description={description}
    action={onRetry ? {
      label: 'Tekrar Dene',
      onClick: onRetry,
      variant: 'primary'
    } : undefined}
  />
);

export const NoShipmentsEmptyState: React.FC<{
  onCreateShipment?: () => void;
}> = ({ onCreateShipment }) => (
  <EmptyState
    icon="document"
    title="Gönderi bulunmuyor"
    description="Henüz hiç gönderi oluşturulmamış."
    action={onCreateShipment ? {
      label: 'İlk Gönderiyi Oluştur',
      onClick: onCreateShipment,
      variant: 'primary'
    } : undefined}
  />
);

export const NoNeedsEmptyState: React.FC<{
  onCreateNeed?: () => void;
}> = ({ onCreateNeed }) => (
  <EmptyState
    icon="inbox"
    title="İhtiyaç bulunmuyor"
    description="Bu lokasyon için kayıtlı ihtiyaç yok."
    action={onCreateNeed ? {
      label: 'İhtiyaç Ekle',
      onClick: onCreateNeed,
      variant: 'primary'
    } : undefined}
  />
);

export default EmptyState;