import React from 'react';
import type { UseFormRegister } from 'react-hook-form';
import type { FieldErrors, Path, FieldValues } from 'react-hook-form';
import { cn } from '../../../utils/cn';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface FormSelectProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  errors?: FieldErrors<T>;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  className?: string;
}

export function FormSelect<T extends FieldValues>({
  label,
  name,
  register,
  errors,
  options,
  placeholder = 'Seçiniz...',
  required = false,
  disabled = false,
  helperText,
  className,
}: FormSelectProps<T>) {
  const error = errors?.[name];
  const errorMessage = error?.message as string | undefined;
  const hasError = !!error;

  const inputId = `select-${name}`;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        id={inputId}
        className={cn(
          'flex w-full rounded-lg border transition-colors',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-gray-500',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'h-10 px-3 text-base',
          hasError
            ? 'border-red-300 bg-white text-gray-900 focus-visible:ring-red-500'
            : 'border-gray-300 bg-white text-gray-900 focus-visible:ring-primary-500',
          className
        )}
        disabled={disabled}
        {...register(name)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {(hasError || helperText) && (
        <p className={cn(
          'text-sm',
          hasError ? 'text-red-600' : 'text-gray-500'
        )}>
          {hasError ? errorMessage : helperText}
        </p>
      )}
    </div>
  );
}

export default FormSelect;