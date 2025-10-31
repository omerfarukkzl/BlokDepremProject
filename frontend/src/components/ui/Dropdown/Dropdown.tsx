import React, { Fragment } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { cn } from '../../../utils/cn';

export interface DropdownItem {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

export interface DropdownProps {
  items: DropdownItem[];
  trigger?: React.ReactNode;
  placeholder?: string;
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
  position?: 'left' | 'right';
}

const Dropdown: React.FC<DropdownProps> = ({
  items,
  trigger,
  placeholder = 'Select option',
  className,
  menuClassName,
  disabled = false,
  position = 'left',
}) => {
  return (
    <div className={cn('relative inline-block text-left', className)}>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <MenuButton
            className={cn(
              'inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
            disabled={disabled}
          >
            {trigger || placeholder}
            <ChevronDownIcon
              className="-mr-1 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </MenuButton>
        </div>

        <MenuItems
          className={cn(
            'absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
            position === 'right' ? 'right-0' : 'left-0',
            menuClassName
          )}
        >
          <div className="py-1">
            {items.map((item) => (
              <MenuItem key={item.value} as={Fragment}>
                {({ active }) => (
                  <button
                    onClick={item.onClick}
                    disabled={item.disabled}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm flex items-center gap-2',
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      item.disabled && 'opacity-50 cursor-not-allowed',
                      item.danger && 'text-red-600'
                    )}
                  >
                    {item.icon && (
                      <span className="h-4 w-4">{item.icon}</span>
                    )}
                    {item.label}
                  </button>
                )}
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Menu>
    </div>
  );
};

export default Dropdown;