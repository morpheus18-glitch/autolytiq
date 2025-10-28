import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly leadingIcon?: ReactNode;
}

const variantClassName: Record<ButtonVariant, string> = {
  primary: 'button--primary',
  secondary: 'button--secondary',
  ghost: 'button--ghost',
};

const sizeClassName: Record<ButtonSize, string> = {
  sm: 'button--sm',
  md: 'button--md',
};

export function Button({
  variant = 'primary',
  size = 'md',
  leadingIcon,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={cn('button', variantClassName[variant], sizeClassName[size], className)} {...props}>
      {leadingIcon}
      <span>{children}</span>
    </button>
  );
}
