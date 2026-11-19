import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const Checkbox = React.forwardRef(({ className, checked, onChange, disabled, id, ...props }, ref) => {
  return (
    <div className="relative inline-flex items-center">
      <input
        ref={ref}
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="peer sr-only"
        {...props}
      />
      <div
        onClick={() => !disabled && onChange?.({ target: { checked: !checked } })}
        className={cn(
          'h-4 w-4 shrink-0 rounded border border-gray-300 ring-offset-background transition-colors flex items-center justify-center cursor-pointer',
          'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2',
          'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
          checked ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white hover:border-gray-400',
          className
        )}
      >
        {checked && <Check className="h-3 w-3 stroke-[3]" />}
      </div>
    </div>
  );
});
Checkbox.displayName = 'Checkbox';

export { Checkbox };
