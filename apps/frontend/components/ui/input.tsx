// apps\frontend\components\ui\input.tsx

import { forwardRef, InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-3 py-2 rounded-lg border 
        border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 
        dark:bg-gray-900 dark:border-gray-700 dark:text-white 
        ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";