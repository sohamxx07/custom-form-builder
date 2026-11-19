import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const SheetContext = createContext({
  open: false,
  setOpen: () => {},
});

const Sheet = ({ children, open: controlledOpen, onOpenChange }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? onOpenChange : setUncontrolledOpen;

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
};

const SheetTrigger = ({ children, asChild, ...props }) => {
  const { setOpen } = useContext(SheetContext);
  return React.cloneElement(children, {
    onClick: (e) => {
      children.props.onClick?.(e);
      setOpen(true);
    },
    ...props,
  });
};

const SheetContent = ({ className, children, side = 'left', ...props }) => {
  const { open, setOpen } = useContext(SheetContext);

  if (!open) return null;

  const sideClasses = {
    left: 'inset-y-0 left-0 w-3/4 max-w-sm slide-in-from-left',
    right: 'inset-y-0 right-0 w-3/4 max-w-sm slide-in-from-right',
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setOpen(false)}
      />
      <div
        className={cn(
          'relative z-50 flex h-full flex-col bg-white p-6 shadow-xl border-r border-gray-200 transition ease-in-out duration-300 animate-in',
          sideClasses[side] || sideClasses.left,
          className
        )}
        {...props}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  );
};

const SheetHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-2 text-left mb-4', className)} {...props} />
);

const SheetTitle = ({ className, ...props }) => (
  <h3 className={cn('text-lg font-bold text-gray-900', className)} {...props} />
);

const SheetDescription = ({ className, ...props }) => (
  <p className={cn('text-sm text-gray-500', className)} {...props} />
);

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
};
