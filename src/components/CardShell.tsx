import type { ReactNode } from 'react';

interface CardShellProps {
  children: ReactNode;
  className?: string;
}

export function CardShell({ children, className = '' }: CardShellProps) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-[1.5rem] border border-beige/60 bg-white p-3 text-left shadow-[0_12px_30px_-18px_rgba(62,46,34,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-orange/30 hover:shadow-[0_16px_40px_-18px_rgba(62,46,34,0.3)] ${className}`.trim()}
    >
      {children}
    </div>
  );
}
