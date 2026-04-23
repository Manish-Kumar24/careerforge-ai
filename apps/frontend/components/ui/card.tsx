// filepath: components/ui/card.tsx

import { HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div className={`border rounded-xl p-4 shadow ${className}`} {...props}>
      {children}
    </div>
  );
}