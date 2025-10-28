import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly title?: string;
  readonly action?: ReactNode;
}

export function Card({ title, action, className, children, ...props }: CardProps) {
  return (
    <section className={cn('card', className)} {...props}>
      {(title || action) && (
        <header className="card__header">
          {title && <h2 className="card__title">{title}</h2>}
          {action}
        </header>
      )}
      <div className="card__body">{children}</div>
    </section>
  );
}
