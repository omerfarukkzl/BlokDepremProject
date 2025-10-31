import React from 'react';
import type { UseFormRegister } from 'react-hook-form';
import type { FieldErrors, Path, FieldValues } from 'react-hook-form';
import { Input } from '../../ui';

interface FormFieldProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  errors?: FieldErrors<T>;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export function FormField<T extends FieldValues>({
  label,
  name,
  register,
  errors,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  helperText,
  leftIcon,
  rightIcon,
  className,
}: FormFieldProps<T>) {
  const error = errors?.[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <Input
      label={label}
      type={type}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      helperText={helperText || errorMessage}
      error={errorMessage}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      className={className}
      {...register(name)}
    />
  );
}

export default FormField;