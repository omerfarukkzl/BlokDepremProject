import React from 'react';
import type { UseFormRegister } from 'react-hook-form';
import type { FieldErrors, Path, FieldValues } from 'react-hook-form';
import { cn } from '../../../utils/cn';

interface FormCheckboxProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  errors?: FieldErrors<T>;
  disabled?: boolean;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export function FormCheckbox<T extends FieldValues>({
  label,
  name,
  register,
  errors,
  disabled = false,
  helperText,
  required = false,
  className,
}: FormCheckboxProps<T>) {
  const error = errors?.[name];
  const errorMessage = error?.message as string | undefined;
  const hasError = !!error;

  const inputId = `checkbox-${name}`;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={inputId}
            type="checkbox"
            className={cn(
              'h-4 w-4 rounded border-gray-300 text-primary-600',
              'focus:ring-primary-500',
              disabled && 'opacity-50 cursor-not-allowed',
              hasError && 'border-red-300 focus:ring-red-500'
            )}
            disabled={disabled}
            {...register(name)}
          />
        </div>
        <div className="ml-3 text-sm">
          <label
            htmlFor={inputId}
            className={cn(
              'font-medium text-gray-700',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {helperText && (
            <p className="text-gray-500">{helperText}</p>
          )}
        </div>
      </div>

      {hasError && (
        <p className="text-sm text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export default FormCheckbox;