'use client';

import * as React from 'react';
import { cn } from '@/lib/utils'; // tailwind helper (or use clsx)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /* visual variants */
  variant?: 'default' | 'error';
  /* auto-grow height while typing */
  autoGrow?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', autoGrow = false, ...props }, ref) => {
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null);
    React.useImperativeHandle(ref, () => innerRef.current!);

    /* auto-resize logic */
    React.useEffect(() => {
      if (!autoGrow) return;
      const el = innerRef.current;
      if (!el) return;
      const handler = () => {
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight + 4}px`;
      };
      el.addEventListener('input', handler);
      handler(); // init
      return () => el.removeEventListener('input', handler);
    }, [autoGrow]);

    return (
      <textarea
        ref={innerRef}
        className={cn(
          'flex min-h-[80px] w-full rounded-xl border bg-white px-4 py-3 text-sm placeholder:text-[#7D141D]/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1E27] focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-60',
          variant === 'error' && 'border-red-500 ring-red-500',
          variant === 'default' && 'border-[#7D141D]/30',
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };