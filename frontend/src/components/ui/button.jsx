import React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = {
  variant: {
    default: 'bg-blue-600 text-white shadow hover:bg-blue-700 active:scale-[0.98]',
    destructive: 'bg-red-600 text-white shadow-sm hover:bg-red-700 active:scale-[0.98]',
    outline: 'border border-gray-300 bg-white shadow-sm hover:bg-gray-50 text-gray-700 active:scale-[0.98]',
    secondary: 'bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 active:scale-[0.98]',
    ghost: 'hover:bg-gray-100 text-gray-700',
    link: 'text-blue-600 underline-offset-4 hover:underline p-0 h-auto',
    success: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98]',
  },
  size: {
    default: 'h-9 px-4 py-2 text-sm',
    sm: 'h-8 rounded-lg px-3 text-xs',
    lg: 'h-10 rounded-xl px-6 text-base',
    icon: 'h-9 w-9 p-0',
  },
};

const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
          buttonVariants.variant[variant] || buttonVariants.variant.default,
          buttonVariants.size[size] || buttonVariants.size.default,
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
