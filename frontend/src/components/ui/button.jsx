import React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = {
  variant: {
    default: 'bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white shadow-sm shadow-indigo-500/25 active:scale-[0.98]',
    brand: 'bg-[#3730A3] hover:bg-[#312E81] active:bg-[#1E1B4B] text-white shadow-sm active:scale-[0.98]',
    destructive: 'bg-red-600 text-white shadow-sm hover:bg-red-700 active:scale-[0.98]',
    outline: 'border border-border bg-white shadow-sm hover:bg-[#EEF2FF] hover:text-[#3730A3] hover:border-indigo-200 text-slate-700 active:scale-[0.98]',
    secondary: 'bg-[#EEF2FF] text-[#3730A3] hover:bg-indigo-100/80 font-medium active:scale-[0.98]',
    ghost: 'hover:bg-[#EEF2FF] hover:text-[#3730A3] text-slate-700 active:scale-[0.98]',
    link: 'text-[#4F46E5] underline-offset-4 hover:underline p-0 h-auto',
    success: 'bg-[#16A34A] text-white shadow-sm hover:bg-[#15803D] active:scale-[0.98]',
  },
  size: {
    default: 'h-9 px-4 py-2 text-sm',
    sm: 'h-8 rounded-lg px-3 text-xs',
    lg: 'h-11 rounded-xl px-6 text-base font-semibold',
    icon: 'h-9 w-9 p-0',
  },
};

const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', disabled, asChild, children, ...props }, ref) => {
    const combinedClassName = cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
      buttonVariants.variant[variant] || buttonVariants.variant.default,
      buttonVariants.size[size] || buttonVariants.size.default,
      className
    );

    // Support asChild pattern (rendering single React element child with cloneElement)
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ref,
        className: cn(combinedClassName, children.props.className),
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={combinedClassName}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
