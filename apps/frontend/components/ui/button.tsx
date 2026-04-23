// apps\frontend\components\ui\button.tsx

import { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function Button({ className = "", children, ...props }: ButtonProps) {
  return (
    <button
      className={`w-full py-2 rounded-lg font-medium transition 
      bg-blue-600 text-white hover:bg-blue-700 
      disabled:opacity-50 disabled:cursor-not-allowed 
      dark:bg-blue-500 dark:hover:bg-blue-600 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}